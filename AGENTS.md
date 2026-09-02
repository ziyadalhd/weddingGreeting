# Abdullah Wedding Greetings — Codex Instructions

## Purpose

Build and maintain one excellent, very small Arabic-first greeting experience for the wedding of Abdullah Yahya Al-hdriti. A guest arrives from a venue QR code, writes their name and congratulations, picks one of three greeting-card designs, previews it, and sends. The wish (name, message, chosen design) is stored in Supabase in that single submission; the guest may then save or share the same designed card as a keepsake.

This is a wedding-specific MVP, not a reusable events platform.

## Non-negotiable MVP boundaries

- Statically exported Next.js application. There is still no server: no API route, Server Action, or middleware. The browser talks to Supabase directly.
- Supabase (Postgres + Storage) is the only backend. No API route, CMS, payment, analytics, or paid API.
- Guests never send the wish themselves. The old prefilled WhatsApp/`mailto:` submission path was removed; wishes are written straight to the database.
- Exactly one authenticated account exists, for the groom's `/admin` view. No guest accounts, no roles, no teams.
- No server-side card generation. Generate PNG files locally with the browser Canvas API.
- Do not implement roadmap ideas without explicit approval.
- Do not add a dependency when a browser or framework feature is sufficient.
- Never place secrets in client code. The contact details and the Supabase publishable key are public by design; the service-role key must never enter this repo.

## Architecture and important decisions

- Next.js App Router, TypeScript, React, Tailwind CSS, static export via `output: "export"`.
- Development and production scripts use Next.js' built-in Webpack mode because the current local sandbox blocks the internal port Turbopack opens while evaluating Tailwind/PostCSS. This does not change the static output or Vercel architecture.
- One public route (`/`) and one focused client-side, state-driven flow. No router is needed for steps.
- `src/app/page.tsx` remains a Server Component; interactive behavior lives below `src/components/wedding-greeting.tsx`.
- Wedding/contact copy is centralized in `src/config/wedding.ts`; never repeat the phone number, email, groom name, or link copy around the app.
- Data access is isolated in `src/lib/wishes.ts` (network) and `src/lib/wish-draft.ts` (pure helpers: validation, pending-queue). Only the pure module is unit-tested, and it must stay free of runtime imports so `node --experimental-strip-types` can load it.
- The chosen card design is captured in the same `INSERT` as the name and message, on the preview screen, after the guest has freely tried all three designs. There is no `UPDATE` policy and none is needed: nothing is written until the guest taps send, so the design is always known upfront.
- Security lives in the database, not the client: `supabase/migrations/0001_wishes.sql` grants `anon` INSERT only, and SELECT solely to an authenticated session. Length limits are `CHECK` constraints because the publishable key ships inside the bundle and the form cannot be trusted.
- Card definitions live in `src/config/card-templates.ts`. Keep the set to 2–3 explicit templates; do not build a generic template engine.
- `src/lib/card-renderer.ts` draws a 1080×1350 PNG on an off-screen canvas. It waits for browser fonts, uses RTL canvas direction, wraps Arabic by words, reduces font size for long messages, and truncates only as a last resort.
- Native sharing uses `navigator.share()` with a `File` and the formatted greeting text only when `navigator.canShare({ files })` confirms file support. The OS target picker—not the website—chooses WhatsApp; WhatsApp may treat the supplied text as an image caption depending on the device/version. Otherwise the generated image remains visible with a full-screen save fallback.
- Browsers cannot write directly to the device photo library. The card page keeps the PNG as a real image and offers an accessible full-screen view for long-press “Save Image/Add to Photos.” Do not reintroduce a file-download link unless explicitly requested; it saves to Files rather than Photos on common mobile browsers and confused users in testing.
- Card sharing is a keepsake for the guest, not the submission mechanism: the wish is already stored by the time the card screen appears. Native sharing attaches the PNG but cannot prefill a recipient, so the card screen shows the configured phone number beside the share action.
- Generated object URLs must be revoked when replaced/unmounted.
- Two public environment variables are required (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), documented in `.env.example`. Public wedding data stays in the central config.
- A wish is saved to `localStorage` before the request and cleared only on a confirmed insert, so a submission that fails on venue Wi-Fi is retried on the guest's next visit.

## UX principles

- Arabic is primary; root HTML is `lang="ar" dir="rtl"`.
- Saudi copy should be warm, clean, broadly understandable, and brief—never stiff, childish, or heavily slangy.
- Optimize for completion in 20–30 seconds while standing at the venue.
- Mobile first, one clear decision per screen, large touch targets (at least 44px), visible focus, and no unnecessary navigation or animation.
- Preserve user input while going backward. Use inline Arabic validation and focus the first invalid field.
- Handle 320px-wide devices, iPhone Safari safe areas, mobile keyboards, long names, and long Arabic messages.
- Prefer calm neutrals, strong typography, generous spacing, subtle borders, and restrained decoration.
- Respect `prefers-reduced-motion`.

## Typography and local fonts

- Required licensed Thmanyah WOFF2 files are in `public/fonts/thmanyah/`; unused OTF files, weights, and families were intentionally removed.
- Exact filenames are documented in `public/fonts/thmanyah/README.md` and referenced by `@font-face` in `src/app/globals.css`.
- Fonts intentionally use local `@font-face` declarations instead of generated `next/font` family names. Canvas needs stable, explicit family names so the exported PNG matches the DOM preview; all files are still self-hosted with no CDN request.
- UI uses `Thmanyah Sans`; cards use `Thmanyah Serif Display` for the groom name and `Thmanyah Serif Text` for the greeting.
- Canvas explicitly waits for these families before drawing. `Tahoma`, `Arial`, and system serif/sans fonts remain safe fallbacks.
- If filenames change, update both `globals.css` and the font directory README.

## Coding conventions

- Strict TypeScript; no `any` unless a browser compatibility edge makes it unavoidable and is documented.
- Small components with semantic HTML, native buttons/inputs, explicit labels, and useful ARIA only where native semantics are insufficient.
- Components use PascalCase; helpers and values use camelCase; constants use camelCase unless truly global constants.
- Keep browser-only code inside client components or functions invoked from the client.
- Prefer derived state during render over synchronization effects.
- Avoid barrel files and heavy icon/component libraries.
- User-visible errors and status messages must be Arabic.

## Current structure

```text
src/
  app/                    # Root layout, metadata, global styles, home and admin pages
  components/             # Interactive flow and focused presentation components
  config/                 # Central wedding data and the three card definitions
  lib/                    # Supabase client, wish persistence, card renderer, tests
supabase/
  migrations/             # Schema, row level security, and storage policies
public/
  fonts/thmanyah/         # Six required owner-supplied local WOFF2 files
```

## Testing expectations

Before marking work complete:

1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
5. Browser check at mobile width for the full form, text, card, native-share/fallback paths.
6. Confirm short/long Arabic copy, field errors, back navigation, no console error, and no horizontal overflow at 320px.
7. Confirm a wish actually lands in the `wishes` table, that a submission made offline is retried on the next visit, and that the publishable key alone cannot read `wishes`.

Browser-native file sharing varies by browser and requires HTTPS (localhost is permitted). Automated desktop browsers may exercise the documented full-screen save fallback; final iPhone Safari and Android Chrome share-sheet checks require physical devices before the wedding.

## Configuration checklist before production

- Apply `supabase/migrations/0001_wishes.sql` to the production Supabase project.
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` locally and in Vercel.
- Create the single admin account matching `adminEmail` in `src/config/wedding.ts`, with a strong password, and disable public sign-ups in Supabase Auth.
- Confirm the current `whatsappNumber` and `email` in `src/config/wedding.ts` before production.
- Confirm the groom spelling and any event date.
- Confirm licensed font files remain available at the documented paths.
- Run the complete check suite and physical-device share tests.
- Generate/print the venue QR only after the production URL is final.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
