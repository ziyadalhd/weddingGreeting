# Implementation Plan — Persist wishes to Supabase, success moment, admin view

Status: **approved and implemented.** Remaining work is the Supabase project
setup listed at the end of this file — it needs credentials, so it cannot be done
from the repo alone.

Two deviations from the approved plan, both deliberate:

- **`card_style` column dropped.** The wish is saved at form submit, before the
  guest picks a template, and RLS forbids updates — so the column would have been
  NULL on every row. Removed rather than shipped as dead data.
- **`src/lib/message-links.ts` and its tests deleted.** With the WhatsApp/`mailto:`
  submission path gone, nothing imported it.

Scope: replace the "open WhatsApp prefilled and let the guest send it" submission
path with durable storage in Supabase, add a success confirmation moment, and add
a protected admin view for the groom.

---

## 0. Context and constraints found in the repo

| Fact | Impact |
|---|---|
| `next.config.ts` sets `output: "export"` — fully static, no server | **No API routes, no Server Actions, no middleware.** Every decision below must work with a browser-only client. This is the single biggest constraint. |
| `AGENTS.md` says: no database, no backend, no admin dashboard, no env vars | This work **directly contradicts** those MVP boundaries. `AGENTS.md` and `ROADMAP.md` must be amended as part of the change (Step 8), not silently violated. |
| `src/components/wedding-greeting.tsx` is 759 lines with all steps inline | Adding a persistence step + success step + photo field here would push it past 900 lines. Step bodies get extracted (Section 4). |
| Design system: sharp corners (`--radius-*: 0px`), accent `#ae1800`, `riseIn`/`stepIn` keyframes, `prefers-reduced-motion` honored | The success animation must use these tokens and CSS keyframes only — no animation library. |
| `AGENTS.md` documents Thmanyah local fonts, but `globals.css` actually loads IBM Plex Sans Arabic + Archivo from Google Fonts | Pre-existing doc drift. Flagged, not fixed, unless requested. |

**Open decision (assumed below):** dropping the WhatsApp submission path means removing
the **"إرسال كنص عبر الواتساب"** button, while **keeping** the card-image generation and
`navigator.share()` flow — that is a keepsake for the guest, not a submission mechanism.

---

## 1. Database schema and security policy

Checked into the repo as `supabase/migrations/0001_wishes.sql` so the schema is
version-controlled, not clicked into a dashboard.

### Table

```sql
create table public.wishes (
  id          uuid primary key default gen_random_uuid(),
  guest_name  text not null check (char_length(btrim(guest_name)) between 1 and 50),
  message     text not null check (char_length(btrim(message)) between 1 and 280),
  photo_path  text check (photo_path ~ '^[0-9a-f-]{36}\.(jpg|webp)$'),
  card_style  text check (card_style in ('grid','poster','ledger')),
  created_at  timestamptz not null default now()
);

create index wishes_created_at_idx on public.wishes (created_at desc);
```

Reasoning:

- `CHECK` constraints mirror the existing `maxNameLength = 50` / `maxMessageLength = 280`
  limits. Because the guest client holds a public key, **the database must enforce the
  limits, not the form** — otherwise anyone with the key can insert a 10 MB message.
  This is the cheap way to do it without a server.
- `photo_path` is regex-constrained to a bare UUID filename, so a caller cannot write a
  path pointing at another bucket folder.
- `card_style` is a nice-to-have for the admin view (which template each guest picked);
  nullable since the wish is saved before the template is chosen.
- No `updated_at`, no soft-delete, no moderation columns — wishes are immutable by
  design, which is what makes the security policy trivial.

### Row Level Security

```sql
alter table public.wishes enable row level security;

-- Guests: append-only. No select, update, or delete policy exists for anon,
-- and with RLS on, "no policy" means denied.
create policy "guests can add a wish"
  on public.wishes for insert to anon with check (true);

-- Groom (signed in): read everything.
create policy "admin can read wishes"
  on public.wishes for select to authenticated using (true);
```

This is the whole security model, and it is enforced by Postgres, not by client code.
A guest holding the publishable key can `INSERT` and nothing else — they cannot list,
read, edit, or delete anyone's wish, including their own. Deletion, if ever needed,
happens from the Supabase dashboard with the service role.

### Storage (photos)

Private bucket `wish-photos`, `file_size_limit = 5MB`,
`allowed_mime_types = {image/jpeg, image/webp}`:

```sql
create policy "guests can upload a photo"
  on storage.objects for insert to anon
  with check (bucket_id = 'wish-photos');

create policy "admin can read photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'wish-photos');
```

The bucket is private, so the admin view fetches images through `createSignedUrls()`
(short-lived, e.g. 1 hour) rather than public URLs.

Two honest caveats:

1. Supabase's own troubleshooting docs note that some upload paths (upsert/resumable)
   also require a matching `SELECT` policy for the uploader. Standard `upload()` should
   not, but **this gets verified against the real project during implementation**; if a
   `SELECT` policy for `anon` turns out to be required, filenames are unguessable UUIDs
   in a private bucket, which is an acceptable fallback — it will be reported either way.
2. An anon-insertable bucket is spam-able by anyone who extracts the publishable key from
   the bundle. Mitigations included: the bucket's own size/MIME limits, client-side
   downscaling, and the fact that the site is live for roughly one day. Rate-limiting and
   captcha are deliberately **not** built — overengineering for a one-night wedding — but
   the exposure is real and stated here.

### Client-side photo handling

`<input type="file" accept="image/jpeg,image/webp" capture="environment">`, then downscale
on a canvas to max 1600px / JPEG quality 0.8 before upload (reusing the same canvas
approach already proven in `card-renderer.ts`). Venue Wi-Fi is the real enemy here — a raw
4 MB iPhone photo is the most likely cause of a failed submission.

**Write order:** generate a client-side UUID → upload photo to `{uuid}.jpg` → insert the
row with `photo_path`. If the insert fails, an orphaned file is left in the bucket; that is
harmless and preferable to a wish row pointing at a missing image.

---

## 2. Reliable persistence

Wedding venues have bad signal, and a guest gets one shot at this. Three layers:

1. **Save at form submit**, not at the end of the flow. The current flow is
   `form → pick → card`; a wish saved only at the end is lost by anyone who abandons at
   the template picker. New flow: name + message + optional photo → **submit saves** →
   success moment → *then* optionally continue to the card.
2. **Local write-ahead.** Before the network call, the wish is written to `localStorage`
   under a pending key; it is cleared only after a confirmed insert. On next page load,
   any leftover pending wish is retried automatically. A guest who submits in a dead zone
   and reopens the page later still gets their wish delivered.
3. **Visible, recoverable failure.** On error: Arabic message, input preserved, explicit
   retry button. Submit is disabled while in flight to prevent double-inserts.

Small pure helpers (`buildPhotoPath`, `validateWish`, pending-queue serialization) go in
`src/lib/wishes.ts` with focused tests in `src/lib/wishes.test.ts`, matching the existing
`message-links.test.ts` pattern — these are the parts worth testing, and they are testable
without a network.

---

## 3. Success-state UX and animation

A new `sent` step, replacing the current inline `sentVia` notice.

Sequence (~1.1s total):

1. A square-cornered outlined mark (no circle — the design system uses `--radius: 0px`
   throughout) with a checkmark drawn via SVG `stroke-dasharray` / `stroke-dashoffset`,
   ~600ms `ease-out`, in `--color-accent-700`.
2. A 2px accent rule wipes in horizontally from the right (RTL-correct), ~400ms.
3. Staggered `riseIn` — the existing keyframe, same delay pattern already used on the
   intro screen (`0.1s`, `0.18s`, `0.26s`) — on: **«وصلت تهنئتك»** heading, the guest's
   name, and a calm confirmation line.
4. Secondary actions fade in last: "اصنع بطاقة تهنئة" (continues into the existing
   template picker) and the contact block.

Reasoning: confetti or a bouncy spring would fight this design system — it is a restrained
modernist system in muted neutrals with a single oxblood accent, and `AGENTS.md` explicitly
asks for "no unnecessary animation." The satisfaction comes from precise timing and a drawn
line, not from particles.

Accessibility: the existing `prefers-reduced-motion` block already neutralizes animation
durations globally, so the reduced-motion path renders the final state instantly with no
extra code. The heading gets `role="status"` / `aria-live="polite"` so screen readers
announce the confirmation.

**No new dependency.** CSS keyframes plus one inline SVG. Framer Motion would be ~30 KB for
one checkmark.

---

## 4. File-level changes

New:

- `supabase/migrations/0001_wishes.sql` — schema, RLS, storage policies
- `src/lib/supabase.ts` — single browser client from env vars
- `src/lib/wishes.ts` + `.test.ts` — insert/upload, validation, pending-queue helpers
- `src/lib/image-resize.ts` — canvas downscale before upload
- `src/components/steps/wish-form.tsx`, `wish-sent.tsx` — form (now with photo) and
  success moment
- `src/app/admin/page.tsx` + `src/components/admin-wishes.tsx` + `admin-gate.tsx`
- `.env.example` — documents the two public env vars

Modified:

- `src/components/wedding-greeting.tsx` — new `sent` step, submit now persists, WhatsApp
  text button removed; step bodies extracted to keep this file readable
- `src/config/wedding.ts` — admin account email
- `src/app/globals.css` — checkmark-draw and rule-wipe keyframes
- `AGENTS.md`, `ROADMAP.md`, `README.md`, `PLAN.md` — boundaries genuinely changed; docs
  must follow

---

## 5. Admin page and access protection

`/admin` — a static route, `noindex`, unlinked from the home page.

### Recommendation: Supabase Auth, one account, password-only UI

The groom's email lives in config; the login screen asks for **just a password**, then
calls `signInWithPassword`. It *feels* like a shared password link; underneath it is real
auth, and `select` on `wishes` is gated by the `authenticated` role in RLS.

### Trade-offs

| Approach | Security | Cost |
|---|---|---|
| **Supabase Auth, single account** *(recommended)* | Real. Enforced by Postgres. Rotatable by changing the password; session expires on its own. | One extra screen; groom types a password once, session persists in `localStorage`. |
| Shared secret in the URL + `SECURITY DEFINER` RPC | Decent. The link *is* the credential — forwarded once and it is public forever; no expiry, rotation means reissuing the link. | No login screen, but custom SQL and a secret in browser history and referrer headers. |
| Password compared in client JS | **Not viable — rejected.** For the page to render wishes, the publishable key would need `SELECT` on `wishes`, which makes every wish readable by anyone with the key, password screen or not. The gate would be theatre. | — |
| Vercel Deployment Protection / middleware | Strong, but middleware requires abandoning `output: "export"`, and password protection is a paid Vercel plan feature. | Changes the deployment architecture for one page. |

The third row is why the "simple shared password" option is not proposed: with a static
export, a client-side password check cannot protect the data — only the database can.
Supabase Auth is barely more work and is actually secure.

### Layout

Newest first, CSS `columns` masonry (no library). Each wish: guest name in the display
face, the message, a relative Arabic timestamp, and the photo thumbnail if present — tap
for a lightbox reusing the existing modal pattern. Sticky header with a live count.
Client-side search and a "with photos only" filter. Single
`select(...).order('created_at', {ascending: false}).limit(500)` — a wedding produces
hundreds of rows, not millions, so pagination is unwarranted.

Optional, pending your call: a Supabase Realtime subscription so wishes appear live during
the reception (genuinely lovely on a big screen), and a "copy all as text" export for a
keepsake.

---

## 6. New dependencies

**`@supabase/supabase-js`** — that is the entire list. No animation library, no UI kit, no
state manager.

Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`):
Supabase has moved from `anon` keys to `sb_publishable_...` keys — the current naming was
verified against their docs rather than trusted from memory. These are inlined into the
static bundle and are *designed* to be public; RLS is what protects the data. Note this
reverses the current "deliberately no environment-variable setup" decision in `AGENTS.md`.
Nothing secret ever reaches client code — the service role key is never added to this
project.

---

## 7. Verification

`npm run check` (lint → typecheck → test → build), then, at mobile width: submit without a
photo, submit with a photo, submit with airplane mode on and confirm the retry recovers it,
confirm from a browser console that the publishable key **cannot** read `wishes`, and
confirm `/admin` shows nothing until login. 320px and reduced-motion passes as `AGENTS.md`
requires.

---

## 8. Build order

Each step is independently verifiable.

1. Migration + Supabase project setup, verify RLS by hand from a console
2. Client + `wishes.ts` + tests (no UI)
3. Form submit → persistence, with the pending-queue retry
4. Success moment
5. Photo field + downscaling
6. Admin gate, then admin layout
7. Docs (`AGENTS.md`, `ROADMAP.md`, `README.md`, `PLAN.md`)

---

## Decisions needed before implementation

1. Does the card generation / sharing flow stay? (assumed **yes**)
2. Realtime on the admin page — wanted, or skip?
