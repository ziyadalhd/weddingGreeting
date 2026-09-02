# Plan — fold template choice into submission, drop selfie upload

Status: **approved and implemented.**

Approved flow, as amended in review: `form (name+message) → pick (template,
no save) → card (preview, freely switchable) → [send button saves] → sent
(checkmark + save/share keepsake + contact)`. Nothing is written to Supabase
until the guest taps "إرسال التهنئة" on the preview screen, so template
switching before that point never risks a save/DB mismatch — this is why the
"تغيير التصميم" button stays on the preview step, unlike the version of this
plan floated before the flow-order amendment.

## What changed

- **Guest photo upload removed entirely.** `src/lib/image-resize.ts` deleted;
  `wish-photos` Storage bucket, its policies, and the `photo_path` column are
  dropped by `supabase/migrations/0002_wishes_card_style.sql`.
- **`card_style` reintroduced**, this time `NOT NULL` with a `CHECK`
  constraint — the wish is only ever saved after the guest has picked a
  design, so it's always known at insert time. No `UPDATE` policy is needed.
- **Flow reordered.** `WishForm` no longer saves anything — it's pure
  validate-and-navigate. The new `WishCard` step (replacing the old
  keepsake-only `card` step) owns the actual `saveWish` call, plus its
  pending/error/retry state. `WishPick` was extracted from inline JSX in
  `wedding-greeting.tsx` for consistency with the other step components.
  `WishSent` grew to include the save/share keepsake buttons and the contact
  block, both moved from the old `card` step now that saving happens earlier.
- **Two pre-existing test rows deleted, not backfilled** — explicit
  correction from the reviewer: `delete from public.wishes where card_style
  is null;` runs before the column goes `NOT NULL`.
- **Admin "مع صورة" filter → "عرض كبطاقات" view-mode toggle.** No more
  photo thumbnails or lightbox. Off shows the existing plain list; on renders
  each wish through the same `GreetingCardDisplay` component the guest sees,
  using the wish's own saved `card_style`.

One small addition beyond the literal spec: an "تعديل التهنئة" (edit
message) button was restored on the preview step alongside "تغيير
التصميم" — both are safe pre-send actions now that nothing is saved until
the guest taps send, and it matches the app's original pre-Supabase pattern.

## Remaining, requires credentials I don't have

- Run `supabase/migrations/0002_wishes_card_style.sql` against the real
  project. It permanently deletes the two test rows, any uploaded test
  photos, and the `photo_path` column — review before running.
- Re-verify end-to-end against the live project: submit, retry-on-failure,
  and confirm the admin card view renders correctly for real data.
