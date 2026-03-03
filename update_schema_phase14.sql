-- Phase 14: Global Audio & Custom Music Playlists

-- 1. Create Storage Bucket for Music (limit 50MB per file)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('music', 'music', true, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a']);

-- Set up Storage Policies for the music bucket
CREATE POLICY "Public Music Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'music' );

CREATE POLICY "Users can upload their own music"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'music' AND auth.uid() = owner );

CREATE POLICY "Users can update their own music"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'music' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own music"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'music' AND auth.uid() = owner );


-- 2. Create Table for Track Metadata
CREATE TABLE IF NOT EXISTS public.user_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_tracks ENABLE ROW LEVEL SECURITY;

-- Set up Row Level Security Policies
CREATE POLICY "Users can view their own tracks"
    ON public.user_tracks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracks"
    ON public.user_tracks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks"
    ON public.user_tracks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracks"
    ON public.user_tracks FOR DELETE
    USING (auth.uid() = user_id);
