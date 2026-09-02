-- Bring the chosen card design into the same INSERT as the wish itself, and
-- remove the guest photo upload feature entirely.
--
-- The wish is now only ever written once the guest has picked a template on
-- the preview screen, so card_style is always known at insert time -- unlike
-- the original design, this needs no UPDATE policy.

alter table public.wishes add column card_style text;

-- These two rows predate card_style and were test submissions, not real
-- guest wishes; deleting rather than backfilling per explicit instruction.
delete from public.wishes where card_style is null;

alter table public.wishes alter column card_style set not null;
alter table public.wishes add constraint wishes_card_style_check
  check (card_style in ('grid', 'poster', 'ledger'));

-- Guest photo upload is removed: delete any uploaded files before dropping
-- the bucket and its policies, then drop the now-unused column.
delete from storage.objects where bucket_id = 'wish-photos';
delete from storage.buckets where id = 'wish-photos';

drop policy if exists "guests can upload a photo" on storage.objects;
drop policy if exists "admin can read photos" on storage.objects;

alter table public.wishes drop column if exists photo_path;
