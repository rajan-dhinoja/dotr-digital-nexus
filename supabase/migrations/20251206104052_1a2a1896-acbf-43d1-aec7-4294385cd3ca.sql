-- Add new columns to services table for rich content
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS hero_image_url text,
ADD COLUMN IF NOT EXISTS icon_name text DEFAULT 'Zap',
ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS process_steps jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS technologies text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pricing_info text,
ADD COLUMN IF NOT EXISTS delivery_time text,
ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;

-- Add comments for documentation
COMMENT ON COLUMN public.services.hero_image_url IS 'Large hero banner image URL';
COMMENT ON COLUMN public.services.icon_name IS 'Lucide icon name for the service';
COMMENT ON COLUMN public.services.features IS 'Array of feature objects with title, description, icon';
COMMENT ON COLUMN public.services.process_steps IS 'Array of process step objects with title, description, order';
COMMENT ON COLUMN public.services.technologies IS 'Array of technology/tool names';
COMMENT ON COLUMN public.services.pricing_info IS 'Pricing information or starting price';
COMMENT ON COLUMN public.services.delivery_time IS 'Estimated delivery timeline';
COMMENT ON COLUMN public.services.faqs IS 'Array of FAQ objects with question and answer';
COMMENT ON COLUMN public.services.meta_title IS 'SEO meta title';
COMMENT ON COLUMN public.services.meta_description IS 'SEO meta description';