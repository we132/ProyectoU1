-- MIGRATION: Phase 6 - Noteit Sketchpad
-- Run this in your Supabase SQL Editor!

-- 1. Create Notes Table
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on notes
alter table public.notes enable row level security;

create policy "Users can insert their own notes."
  on public.notes for insert
  with check ( auth.uid() = user_id );

create policy "Users can view their own notes."
  on public.notes for select
  using ( auth.uid() = user_id );

create policy "Users can delete their own notes."
  on public.notes for delete
  using ( auth.uid() = user_id );

-- 3. Create Storage Bucket for Note Images
insert into storage.buckets (id, name, public) 
values ('note_images', 'note_images', true)
on conflict (id) do nothing;

-- 4. Set up Storage Security Policies for 'note_images'
create policy "Public Access note_images" 
on storage.objects for select 
using ( bucket_id = 'note_images' );

create policy "Auth Upload note_images" 
on storage.objects for insert 
with check ( bucket_id = 'note_images' and auth.role() = 'authenticated' );

create policy "Auth Delete note_images" 
on storage.objects for delete 
using ( bucket_id = 'note_images' and auth.uid() = owner);
