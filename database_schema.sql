-- Supabase SQL Schema for "The Forge: Task Odyssey"

-- 1. Create Profiles Table (Extended Auth User Data)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  level integer default 1,
  xp integer default 0,
  updated_at timestamp with time zone
);

-- Turn on Row Level Security (RLS) for Profiles
alter table public.profiles enable row level security;

-- Create Policies for Profiles
-- Users can read their own profile
create policy "Users can view own profile." on profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Function to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create Tasks Table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'done')),
  difficulty text default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  xp_reward integer default 10,
  created_at timestamp with time zone default now()
);

-- Turn on RLS for Tasks
alter table public.tasks enable row level security;

-- Create Policies for Tasks
-- Users can only read their own tasks
create policy "Users can view own tasks." on tasks
  for select using (auth.uid() = user_id);

-- Users can only insert their own tasks
create policy "Users can insert own tasks." on tasks
  for insert with check (auth.uid() = user_id);

-- Users can only update their own tasks
create policy "Users can update own tasks." on tasks
  for update using (auth.uid() = user_id);

-- Users can only delete their own tasks
create policy "Users can delete own tasks." on tasks
  for delete using (auth.uid() = user_id);
