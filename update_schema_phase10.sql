-- MIGRATION: Phase 10 - Task Workspaces
-- Run this in your Supabase SQL Editor!

-- 1. Create Workspaces Table
create table if not exists public.workspaces (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on Workspaces
alter table public.workspaces enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'workspaces' and policyname = 'Users can do all on their own workspaces.'
  ) then
    create policy "Users can do all on their own workspaces."
      on public.workspaces for all
      using ( auth.uid() = user_id );
  end if;
end
$$;

-- 3. Update Tasks Table
alter table public.tasks
add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

-- Note: Existing tasks will have a NULL workspace_id.
-- We will handle "NULL" in the frontend as a default "General" workspace to prevent data loss.
