-- Wedding wishes: durable storage for guest congratulations.
--
-- Security model, in one sentence: guests hold a public publishable key and may
-- only INSERT; reading is limited to the signed-in groom. Postgres enforces
-- this, not the client, because the key ships inside a static bundle.

create table if not exists public.wishes (
  id          uuid primary key default gen_random_uuid(),
  guest_name  text not null check (char_length(btrim(guest_name)) between 1 and 50),
  message     text not null check (char_length(btrim(message)) between 1 and 280),
  photo_path  text check (photo_path ~ '^[0-9a-f-]{36}\.(jpg|webp)$'),
  created_at  timestamptz not null default now()
);

create index if not exists wishes_created_at_idx
  on public.wishes (created_at desc);

alter table public.wishes enable row level security;

-- Guests: append-only. No select/update/delete policy exists for anon, and with
-- RLS enabled "no policy" means denied.
drop policy if exists "guests can add a wish" on public.wishes;
create policy "guests can add a wish"
  on public.wishes for insert to anon, authenticated with check (true);

-- Groom (signed in): read everything.
drop policy if exists "admin can read wishes" on public.wishes;
create policy "admin can read wishes"
  on public.wishes for select to authenticated using (true);

-- Guest photos live in a private bucket. Size and MIME limits are enforced by
-- the bucket itself, since the client-side form cannot be trusted.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wish-photos', 'wish-photos', false, 5242880, array['image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "guests can upload a photo" on storage.objects;
create policy "guests can upload a photo"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'wish-photos');

drop policy if exists "admin can read photos" on storage.objects;
create policy "admin can read photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'wish-photos');
