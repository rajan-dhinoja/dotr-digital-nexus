-- Ensure pages table has navigation-related fields
-- This migration ensures compatibility even if 20260123090000_navigation_menus.sql wasn't run

ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS show_in_navigation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS default_menu_type TEXT DEFAULT 'header',
ADD COLUMN IF NOT EXISTS navigation_label_override TEXT,
ADD COLUMN IF NOT EXISTS navigation_priority INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN public.pages.show_in_navigation IS 'Whether this page should appear in navigation menus';
COMMENT ON COLUMN public.pages.default_menu_type IS 'Default menu type for this page (header, footer, mobile)';
COMMENT ON COLUMN public.pages.navigation_label_override IS 'Custom label for navigation (overrides page title)';
COMMENT ON COLUMN public.pages.navigation_priority IS 'Priority for navigation ordering (higher = appears first)';
