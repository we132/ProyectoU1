-- update_schema_phase17.sql
-- Add due_date column to tasks to support deadlines and Calendar view.

ALTER TABLE public.tasks 
ADD COLUMN due_date TIMESTAMP WITH TIME ZONE NULL;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
