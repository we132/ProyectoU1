-- MIGRATION: Phase 5 - Custom Themes & User Avatars
-- Run this in your Supabase SQL Editor!

-- 1. Add theme and avatar columns to profiles
alter table public.profiles 
add column if not exists theme_prefs jsonb default '{"id": "default", "name": "Streaming", "bg": "#0f0f0f", "surface": "#1a1a1a", "accent": "#ff0000"}',
add column if not exists avatar_url text default 'https://api.dicebear.com/7.x/bottts/svg?seed=ArchitectP1&backgroundColor=1a1a1a';
