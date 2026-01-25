-- 1. Add navigation fields to pages table
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS default_menu_type TEXT DEFAULT 'header',
ADD COLUMN IF NOT EXISTS navigation_label_override TEXT,
ADD COLUMN IF NOT EXISTS navigation_priority INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN public.pages.show_in_navigation IS 'Whether this page should appear in navigation menus';
COMMENT ON COLUMN public.pages.default_menu_type IS 'Default menu type for this page (header, footer, mobile)';
COMMENT ON COLUMN public.pages.navigation_label_override IS 'Custom label for navigation (overrides page title)';
COMMENT ON COLUMN public.pages.navigation_priority IS 'Priority for navigation ordering (higher = appears first)';

-- 2. Add mega menu support fields to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon_name TEXT,
ADD COLUMN IF NOT EXISTS menu_type TEXT DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS mega_summary_title TEXT,
ADD COLUMN IF NOT EXISTS mega_summary_text TEXT,
ADD COLUMN IF NOT EXISTS mega_cta_label TEXT,
ADD COLUMN IF NOT EXISTS mega_cta_href TEXT,
ADD COLUMN IF NOT EXISTS item_level INTEGER DEFAULT 0;

-- Add indexes for efficient mega menu queries
CREATE INDEX IF NOT EXISTS menu_items_location_level_idx 
ON public.menu_items(menu_location, item_level, display_order);

CREATE INDEX IF NOT EXISTS menu_items_location_type_idx 
ON public.menu_items(menu_location, menu_type, is_active);

-- Add comments for documentation
COMMENT ON COLUMN public.menu_items.item_level IS '0 = top-level nav item, 1 = category section header, 2 = item within category';
COMMENT ON COLUMN public.menu_items.menu_type IS 'simple = regular link, mega = shows mega menu dropdown';
COMMENT ON COLUMN public.menu_items.icon_name IS 'Lucide icon name matching iconMap keys (e.g., Globe, Palette, Code)';