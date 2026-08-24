# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project rules

Read `AGENTS.md` first — it is the authoritative source of MVP boundaries, architecture decisions, UX principles, typography/font setup, and coding conventions for this repo. Do not duplicate or contradict it; this file only adds commands and a quick orientation.

This is a wedding-specific MVP (Arabic-first, mobile-first, single page), not a reusable events platform. Do not implement anything from `ROADMAP.md`'s "Future / Version 2+" list without explicit approval.

## Commands

```bash
npm run dev         # start dev server (Webpack mode, not Turbopack — see below)
npm run lint         # eslint .
npm run typecheck    # tsc --noEmit
npm test             # node --experimental-strip-types --test src/lib/*.test.ts
npm run build        # next build --webpack, static export to out/
npm run check         # lint + typecheck + test + build, in that order
```

Run a single test file directly: `node --experimental-strip-types --test src/lib/message-links.test.ts`.

`dev`/`build` force Next.js' built-in Webpack mode (`--webpack`) because the local sandbox blocks the internal port Turbopack needs for Tailwind/PostCSS. This does not affect the static output or deployment.

Before considering work complete, run `npm run check`, then manually verify in a browser at mobile width (see "Testing expectations" in `AGENTS.md`).

## Architecture

Single-route (`/`), frontend-only, statically exported Next.js app (`output: "export"` in `next.config.ts`). No backend, database, API routes, auth, or analytics — WhatsApp/email sending happens via prefilled deep links (`wa.me`, `mailto:`) that the guest confirms manually.

- `src/app/page.tsx` — Server Component shell; renders the client component.
- `src/components/wedding-greeting.tsx` — the entire interactive flow (name/message form → text-vs-card choice → send/share), as client-side state, no router.
- `src/components/card-template-preview.tsx` — small preview rendering for the 3 fixed card templates.
- `src/config/wedding.ts` — single source of truth for groom name, WhatsApp number, email, and copy. Never hardcode these elsewhere.
- `src/config/card-templates.ts` — the 2–3 fixed card template definitions (colors/layout), not a generic template engine.
- `src/lib/message-links.ts` — builds WhatsApp/`mailto:` URLs safely (`URLSearchParams`/`encodeURIComponent`); has focused tests in `message-links.test.ts`.
- `src/lib/card-renderer.ts` — draws the shareable card as a 1080×1350 PNG on an off-screen Canvas: waits for local fonts to load, sets RTL, wraps Arabic text by word, shrinks/truncates long messages as a last resort, then exports a Blob.

Sharing flow: card PNG is shared via `navigator.share()` with a `File`, gated on `navigator.canShare({ files })`; when unsupported, the image stays visible with a full-screen long-press-to-save fallback (deliberately no download-link fallback, since that saves to Files instead of Photos on mobile browsers). Revoke object URLs when the image is replaced/unmounted.

Fonts: local Thmanyah WOFF2 files in `public/fonts/thmanyah/`, declared via `@font-face` in `src/app/globals.css` (not `next/font`), because Canvas rendering needs stable, explicit font-family names matching the DOM preview exactly. UI uses `Thmanyah Sans`; cards use `Thmanyah Serif Display` (name) and `Thmanyah Serif Text` (message). If filenames change, update both `globals.css` and `public/fonts/thmanyah/README.md`.

All user-visible text, errors, and status messages are Arabic; root HTML is `lang="ar" dir="rtl"`.
