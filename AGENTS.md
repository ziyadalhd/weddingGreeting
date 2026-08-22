# Abdullah Wedding Greetings — Codex Instructions

## Purpose

Build and maintain one excellent, very small Arabic-first greeting experience for the wedding of Abdullah Yahya Al-hdriti. A guest arrives from a venue QR code, writes their name and congratulations, then sends plain text through WhatsApp/email or creates and shares a greeting-card image.

This is a wedding-specific MVP, not a reusable events platform.

## Non-negotiable MVP boundaries

- Frontend-only, statically exported Next.js application.
- No database, backend, API route, authentication, account, dashboard, CMS, payment, analytics, or paid API.
- No WhatsApp Business/API integration. Use a prefilled WhatsApp deep link; the guest presses Send.
- No email backend. Use `mailto:`; the guest presses Send.
- No server-side card generation. Generate PNG files locally with the browser Canvas API.
- Do not implement roadmap ideas without explicit approval.
- Do not add a dependency when a browser or framework feature is sufficient.
- Never place secrets in client code. The current public contact details are not secrets.

## Architecture and important decisions

- Next.js App Router, TypeScript, React, Tailwind CSS, static export via `output: "export"`.
- Development and production scripts use Next.js' built-in Webpack mode because the current local sandbox blocks the internal port Turbopack opens while evaluating Tailwind/PostCSS. This does not change the static output or Vercel architecture.
- One public route (`/`) and one focused client-side, state-driven flow. No router is needed for steps.
- `src/app/page.tsx` remains a Server Component; interactive behavior lives below `src/components/wedding-greeting.tsx`.
- Wedding/contact copy is centralized in `src/config/wedding.ts`; never repeat the phone number, email, groom name, or link copy around the app.
- Link construction is isolated in `src/lib/message-links.ts` and must use `URLSearchParams`/`encodeURIComponent` behavior safely.
- Card definitions live in `src/config/card-templates.ts`. Keep the set to 2–3 explicit templates; do not build a generic template engine.
- `src/lib/card-renderer.ts` draws a 1080×1350 PNG on an off-screen canvas. It waits for browser fonts, uses RTL canvas direction, wraps Arabic by words, reduces font size for long messages, and truncates only as a last resort.
- Native sharing uses `navigator.share()` with a `File` and the formatted greeting text only when `navigator.canShare({ files })` confirms file support. The OS target picker—not the website—chooses WhatsApp; WhatsApp may treat the supplied text as an image caption depending on the device/version. Otherwise the generated image remains visible and a download/save fallback is shown.
- Generated object URLs must be revoked when replaced/unmounted.
- There is deliberately no environment-variable setup. Public wedding data is edited directly in the central config.

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
  app/                    # Root layout, metadata, global styles, home page
  components/             # Interactive flow and focused presentation components
  config/                 # Central wedding data and the three card definitions
  lib/                    # URL builders, card canvas renderer, focused tests
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
6. Confirm short/long Arabic copy, field errors, back navigation, WhatsApp encoding, email encoding, no console error, and no horizontal overflow at 320px.

Browser-native file sharing varies by browser and requires HTTPS (localhost is permitted). Automated desktop browsers usually exercise the documented download fallback; final iPhone Safari and Android Chrome share-sheet checks require physical devices before the wedding.

## Configuration checklist before production

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
