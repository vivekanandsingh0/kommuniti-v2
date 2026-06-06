-- SQL migration patch to create the storage bucket for book covers and configure policies.
-- Run in the Supabase SQL editor to enable cover image uploads.

-- 1. Create the bucket if it does not exist
insert into storage.buckets (id, name, public)
values ('book-covers', 'book-covers', true)
on conflict (id) do nothing;

-- 2. Configure bucket-level security policies
drop policy if exists "Public Access for Book Covers" on storage.objects;
create policy "Public Access for Book Covers"
  on storage.objects for select
  using (bucket_id = 'book-covers');

drop policy if exists "Authenticated Insert for Book Covers" on storage.objects;
create policy "Authenticated Insert for Book Covers"
  on storage.objects for insert
  with check (
    bucket_id = 'book-covers' 
    and auth.role() = 'authenticated'
  );

drop policy if exists "Authenticated Update for Book Covers" on storage.objects;
create policy "Authenticated Update for Book Covers"
  on storage.objects for update
  with check (
    bucket_id = 'book-covers'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Authenticated Delete for Book Covers" on storage.objects;
create policy "Authenticated Delete for Book Covers"
  on storage.objects for delete
  using (
    bucket_id = 'book-covers'
    and auth.role() = 'authenticated'
  );
