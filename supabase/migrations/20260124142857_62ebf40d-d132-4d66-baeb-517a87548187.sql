-- Add show_in_navigation column to pages table if it doesn't exist
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS show_in_navigation BOOLEAN DEFAULT true;