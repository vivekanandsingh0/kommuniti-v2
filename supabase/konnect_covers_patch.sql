-- SQL migration patch to support cover images for Konnect Events.
-- Run in the Supabase SQL editor to apply.

-- 1. Add cover_image_url column to konnect_events
alter table konnect_events add column if not exists cover_image_url text;

-- 2. Create the storage bucket for event covers if it does not exist
insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do nothing;

-- 3. Configure storage objects policies for 'event-covers' bucket
drop policy if exists "Public Access for Event Covers" on storage.objects;
create policy "Public Access for Event Covers"
  on storage.objects for select
  using (bucket_id = 'event-covers');

drop policy if exists "Authenticated Insert for Event Covers" on storage.objects;
create policy "Authenticated Insert for Event Covers"
  on storage.objects for insert
  with check (
    bucket_id = 'event-covers'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Authenticated Update for Event Covers" on storage.objects;
create policy "Authenticated Update for Event Covers"
  on storage.objects for update
  with check (
    bucket_id = 'event-covers'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Authenticated Delete for Event Covers" on storage.objects;
create policy "Authenticated Delete for Event Covers"
  on storage.objects for delete
  using (
    bucket_id = 'event-covers'
    and auth.role() = 'authenticated'
  );
