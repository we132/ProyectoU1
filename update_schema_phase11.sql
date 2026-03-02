-- MIGRATION: Phase 11 - Personalization & Avatars
-- Run this in your Supabase SQL Editor!

-- 1. Create Storage Bucket for Custom Avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Set up Storage Security Policies for 'avatars'
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public Access avatars'
  ) then
    create policy "Public Access avatars" 
    on storage.objects for select 
    using ( bucket_id = 'avatars' );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Auth Upload avatars'
  ) then
    create policy "Auth Upload avatars" 
    on storage.objects for insert 
    with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Auth Update avatars'
  ) then
    create policy "Auth Update avatars" 
    on storage.objects for update 
    using ( bucket_id = 'avatars' and auth.uid() = owner);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Auth Delete avatars'
  ) then
    create policy "Auth Delete avatars" 
    on storage.objects for delete 
    using ( bucket_id = 'avatars' and auth.uid() = owner);
  end if;
end
$$;
