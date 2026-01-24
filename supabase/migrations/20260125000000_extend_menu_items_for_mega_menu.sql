-- Extend menu_items table for mega menu support
-- Adds fields for descriptions, icons, menu types, mega menu summary content, and item levels

-- Add mega menu support fields
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon_name TEXT, -- Lucide icon name (e.g., 'Globe', 'Palette')
ADD COLUMN IF NOT EXISTS menu_type TEXT DEFAULT 'simple', -- 'simple' | 'mega'
ADD COLUMN IF NOT EXISTS mega_summary_title TEXT,
ADD COLUMN IF NOT EXISTS mega_summary_text TEXT,
ADD COLUMN IF NOT EXISTS mega_cta_label TEXT,
ADD COLUMN IF NOT EXISTS mega_cta_href TEXT,
ADD COLUMN IF NOT EXISTS item_level INTEGER DEFAULT 0; -- 0=top-level, 1=category, 2=item

-- Add index for efficient mega menu queries
CREATE INDEX IF NOT EXISTS menu_items_location_level_idx 
ON public.menu_items(menu_location, item_level, display_order);

-- Add index for menu type queries
CREATE INDEX IF NOT EXISTS menu_items_location_type_idx 
ON public.menu_items(menu_location, menu_type, is_active);

-- Add comment for documentation
COMMENT ON COLUMN public.menu_items.item_level IS '0 = top-level nav item, 1 = category section header, 2 = item within category';
COMMENT ON COLUMN public.menu_items.menu_type IS 'simple = regular link, mega = shows mega menu dropdown';
COMMENT ON COLUMN public.menu_items.icon_name IS 'Lucide icon name matching iconMap keys (e.g., Globe, Palette, Code)';
