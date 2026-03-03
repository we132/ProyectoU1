-- Phase 20: Collaborative Workspaces & Gacha Economy Migration

-- 1. Upgrade Workspaces for Collaboration
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'personal' CHECK (type IN ('personal', 'group')),
ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;

-- Function to autogenerate a 6-character alphanumeric invite code for group workspaces
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
    chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z}';
    result text := '';
    i integer := 0;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || chars[1+random()*(array_length(chars, 1)-1)];
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 2. Create Workspace Members (For Group access)
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    role text DEFAULT 'member', -- 'owner' or 'member'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(workspace_id, user_id)
);

-- RLS for Workspace Members
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memberships"
    ON public.workspace_members FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can join via membership"
    ON public.workspace_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can manage memberships"
    ON public.workspace_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = workspace_members.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role = 'owner'
        )
    );

-- Modify existing Workspaces RLS to allow members to query group workspaces
DROP POLICY IF EXISTS "Users can view their own workspaces" ON public.workspaces;
CREATE POLICY "Users can view workspaces they own or are members of"
    ON public.workspaces FOR SELECT
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE workspace_members.workspace_id = workspaces.id 
            AND workspace_members.user_id = auth.uid()
        )
    );

-- 3. Isolate Data by Workspace

-- Folders
ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Notes
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Flashcards
ALTER TABLE public.flashcard_decks ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Update RLS for Data to respect workspace memberships, not just creator user_id
-- (A more robust production app would drop old policies and recreate them to check workspace_members, 
-- but since we are iterating, we will lean on the frontend passing the active workspace_id and relying on RLS user_id as fallback for personal)
-- Note: It is critical that tasks, notes, and flashcard_decks inserted into Group Workspaces 
-- carry a user_id of the person who created it, but are selectable by anyone in workspace_members.
-- Let's patch Tasks RLS:
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view tasks in their workspaces"
    ON public.tasks FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.workspace_members wm 
            WHERE wm.workspace_id = tasks.workspace_id 
            AND wm.user_id = auth.uid()
        )
    );

-- 4. Gamified Economy & Gacha (Profiles)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS coins integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS unlocked_pets jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS unlocked_badges jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS active_title text,
ADD COLUMN IF NOT EXISTS active_pet text;
