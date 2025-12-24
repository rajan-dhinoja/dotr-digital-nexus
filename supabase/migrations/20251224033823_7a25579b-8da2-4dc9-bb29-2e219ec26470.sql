-- Create section_types table for available section types
CREATE TABLE public.section_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  allowed_pages TEXT[] DEFAULT '{}',
  schema JSONB DEFAULT '{}',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create page_sections table for dynamic sections
CREATE TABLE public.page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT NOT NULL,
  entity_id UUID,
  section_type TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  content JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.section_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- RLS policies for section_types
CREATE POLICY "Anyone can view section types" 
ON public.section_types 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage section types" 
ON public.section_types 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for page_sections
CREATE POLICY "Anyone can view active page sections" 
ON public.page_sections 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage page sections" 
ON public.page_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at on page_sections
CREATE TRIGGER update_page_sections_updated_at
BEFORE UPDATE ON public.page_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed section types with the 10 most versatile sections
INSERT INTO public.section_types (name, slug, description, allowed_pages, icon, schema) VALUES
('Hero', 'hero', 'Main hero section with headline, subtitle, and CTA buttons', 
  ARRAY['services', 'service_categories', 'projects', 'about', 'contact'], 
  'Sparkles',
  '{"fields": ["headline", "subtitle", "cta_text", "cta_link", "background_image"]}'::jsonb),

('Features', 'features', 'Grid of features or benefits with icons', 
  ARRAY['services', 'service_categories', 'projects', 'about'], 
  'LayoutGrid',
  '{"fields": ["items"], "items_schema": {"title": "string", "description": "string", "icon": "string"}}'::jsonb),

('Process', 'process', 'Step-by-step process or workflow timeline', 
  ARRAY['services', 'service_categories', 'about'], 
  'Route',
  '{"fields": ["items"], "items_schema": {"step": "number", "title": "string", "description": "string", "icon": "string"}}'::jsonb),

('Testimonials', 'testimonials', 'Customer testimonials and reviews', 
  ARRAY['services', 'service_categories', 'projects', 'about'], 
  'Quote',
  '{"fields": ["items"], "items_schema": {"quote": "string", "author": "string", "role": "string", "company": "string", "image": "string"}}'::jsonb),

('Stats', 'stats', 'Key statistics and metrics with counters', 
  ARRAY['services', 'service_categories', 'projects', 'about'], 
  'BarChart3',
  '{"fields": ["items"], "items_schema": {"value": "string", "label": "string", "suffix": "string"}}'::jsonb),

('FAQ', 'faq', 'Frequently asked questions accordion', 
  ARRAY['services', 'service_categories', 'about', 'contact'], 
  'HelpCircle',
  '{"fields": ["items"], "items_schema": {"question": "string", "answer": "string"}}'::jsonb),

('CTA', 'cta', 'Call-to-action section with buttons', 
  ARRAY['services', 'service_categories', 'projects', 'about', 'contact'], 
  'MousePointerClick',
  '{"fields": ["headline", "description", "primary_cta_text", "primary_cta_link", "secondary_cta_text", "secondary_cta_link"]}'::jsonb),

('Gallery', 'gallery', 'Image or video gallery grid', 
  ARRAY['services', 'projects', 'about'], 
  'Images',
  '{"fields": ["items"], "items_schema": {"image_url": "string", "caption": "string", "alt": "string"}}'::jsonb),

('Team', 'team', 'Team members showcase', 
  ARRAY['about', 'services'], 
  'Users',
  '{"fields": ["items"], "items_schema": {"name": "string", "role": "string", "image": "string", "bio": "string"}}'::jsonb),

('Pricing', 'pricing', 'Pricing tiers and packages', 
  ARRAY['services', 'service_categories'], 
  'DollarSign',
  '{"fields": ["items"], "items_schema": {"name": "string", "price": "string", "description": "string", "features": "array", "cta_text": "string", "is_featured": "boolean"}}'::jsonb);