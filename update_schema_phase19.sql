-- Flashcards Phase 19 Updates
-- Execute this in the Supabase SQL Editor

-- Create Flashcard Decks Table
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Elevate security
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

-- Allow users to fully manage their own decks
CREATE POLICY "Users can manage their own decks" ON public.flashcard_decks
    FOR ALL USING (auth.uid() = user_id);

-- Create Flashcards Table
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Elevate security
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Allow users to fully manage cards belonging to their decks
CREATE POLICY "Users can manage cards in their decks" ON public.flashcards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.flashcard_decks
            WHERE flashcard_decks.id = flashcards.deck_id
            AND flashcard_decks.user_id = auth.uid()
        )
    );
