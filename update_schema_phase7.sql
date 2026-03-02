-- MIGRATION: Phase 7 - Folders & Rich Text Notes
-- Run this in your Supabase SQL Editor!

-- 1. Create Folders Table
create table if not exists public.folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on Folders
alter table public.folders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'folders' and policyname = 'Users can do all on their own folders.'
  ) then
    create policy "Users can do all on their own folders."
      on public.folders for all
      using ( auth.uid() = user_id );
  end if;
end
$$;

-- 3. Update Notes Table
alter table public.notes
add column if not exists folder_id uuid references public.folders(id) on delete cascade,
add column if not exists title text default 'Untitled Note',
add column if not exists content text default '',
alter column image_url drop not null; -- Drawings are now optional since notes can just be text

-- 4. Enable full access on Notes for the owner
-- Previously we only added insert/select/delete. Let's ensure UPDATE is allowed.
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'notes' and policyname = 'Users can update their own notes.'
  ) then
    create policy "Users can update their own notes."
      on public.notes for update
      using ( auth.uid() = user_id );
  end if;
end
$$;
