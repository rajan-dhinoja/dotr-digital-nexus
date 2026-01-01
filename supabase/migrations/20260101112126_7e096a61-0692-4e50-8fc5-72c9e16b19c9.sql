-- Add is_active columns to existing tables
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.service_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create pages table
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  content JSONB DEFAULT '{}',
  template TEXT DEFAULT 'default',
  parent_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  show_in_nav BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_location TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  target TEXT DEFAULT '_self',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Pages RLS policies
CREATE POLICY "Anyone can view active pages" ON public.pages
FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage pages" ON public.pages
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Menu items RLS policies
CREATE POLICY "Anyone can view active menu items" ON public.menu_items
FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage menu items" ON public.menu_items
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Activity logs RLS policies
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert activity logs" ON public.activity_logs
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger for pages
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert system pages
INSERT INTO public.pages (title, slug, is_system, is_active, display_order) VALUES
('Home', 'home', true, true, 1),
('About', 'about', true, true, 2),
('Services', 'services', true, true, 3),
('Portfolio', 'portfolio', true, true, 4),
('Blog', 'blog', true, true, 5),
('Team', 'team', true, true, 6),
('Contact', 'contact', true, true, 7);