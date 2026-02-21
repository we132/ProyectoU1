-- SQL Patch for Phase 4: Media Uploads Support
-- Run this in your Supabase SQL Editor!

-- 1. Add image_url to Tasks table
alter table public.tasks 
add column if not exists image_url text;

-- 2. Create the Storage Bucket for Task Images
insert into storage.buckets (id, name, public) 
values ('task_images', 'task_images', true)
on conflict (id) do nothing;

-- 3. Set up Storage Security Policies (RLS) for the bucket
-- Allow public access to view images
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'task_images' );

-- Allow authenticated users to upload images
create policy "Auth Upload" 
on storage.objects for insert 
with check ( bucket_id = 'task_images' and auth.role() = 'authenticated' );

-- Allow users to delete their own images
create policy "Auth Delete" 
on storage.objects for delete 
using ( bucket_id = 'task_images' and auth.uid() = owner);
