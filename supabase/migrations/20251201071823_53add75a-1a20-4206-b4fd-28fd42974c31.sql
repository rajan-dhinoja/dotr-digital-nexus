-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'client', 'guest');
CREATE TYPE public.contact_status AS ENUM ('new', 'contacted', 'closed');
CREATE TYPE public.blog_status AS ENUM ('draft', 'published', 'archived');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'guest',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Team Members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services Categories table
CREATE TABLE public.services_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.services_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_summary TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects / Portfolio table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  description TEXT,
  cover_image_url TEXT,
  client_name TEXT,
  project_url TEXT,
  achievements TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project Gallery Images table
CREATE TABLE public.project_gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project-Service junction table (many-to-many)
CREATE TABLE public.project_services (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, service_id)
);

-- Blog Categories table
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blog Posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  author_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  status blog_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BlogPost-Category junction table (many-to-many)
CREATE TABLE public.blog_post_categories (
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, category_id)
);

-- Testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT,
  company TEXT,
  testimonial_text TEXT NOT NULL,
  photo_url TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact Leads / Inquiries table
CREATE TABLE public.contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  status contact_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site Settings table (key-value store)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_services_category ON public.services(category_id);
CREATE INDEX idx_services_slug ON public.services(slug);
CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published_at) WHERE status = 'published';
CREATE INDEX idx_contact_leads_status ON public.contact_leads(status);
CREATE INDEX idx_contact_leads_created ON public.contact_leads(created_at DESC);
CREATE INDEX idx_project_services_project ON public.project_services(project_id);
CREATE INDEX idx_project_services_service ON public.project_services(service_id);
CREATE INDEX idx_blog_post_categories_post ON public.blog_post_categories(blog_post_id);
CREATE INDEX idx_blog_post_categories_category ON public.blog_post_categories(category_id);

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin or editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'editor')
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_categories_updated_at BEFORE UPDATE ON public.services_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON public.blog_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_leads_updated_at BEFORE UPDATE ON public.contact_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert user roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update user roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete user roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for team_members (public read, admin/editor write)
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert team members" ON public.team_members FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can update team members" ON public.team_members FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete team members" ON public.team_members FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for services_categories (public read, admin/editor write)
CREATE POLICY "Anyone can view service categories" ON public.services_categories FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert service categories" ON public.services_categories FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can update service categories" ON public.services_categories FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete service categories" ON public.services_categories FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for services (public read, admin/editor write)
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert services" ON public.services FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can update services" ON public.services FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete services" ON public.services FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for projects (public read, admin/editor write)
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert projects" ON public.projects FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can update projects" ON public.projects FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete projects" ON public.projects FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for project_gallery_images (public read, admin/editor write)
CREATE POLICY "Anyone can view project gallery images" ON public.project_gallery_images FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert project gallery images" ON public.project_gallery_images FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can update project gallery images" ON public.project_gallery_images FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete project gallery images" ON public.project_gallery_images FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for project_services (public read, admin/editor write)
CREATE POLICY "Anyone can view project services" ON public.project_services FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert project services" ON public.project_services FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete project services" ON public.project_services FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for blog_categories (public read, admin/editor write)
CREATE POLICY "Anyone can view blog categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert blog categories" ON public.blog_categories FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can update blog categories" ON public.blog_categories FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete blog categories" ON public.blog_categories FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for blog_posts (public read published, admin/editor write all)
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT USING (status = 'published' OR public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can insert blog posts" ON public.blog_posts FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can update blog posts" ON public.blog_posts FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete blog posts" ON public.blog_posts FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for blog_post_categories (public read, admin/editor write)
CREATE POLICY "Anyone can view blog post categories" ON public.blog_post_categories FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert blog post categories" ON public.blog_post_categories FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete blog post categories" ON public.blog_post_categories FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for testimonials (public read, admin/editor write)
CREATE POLICY "Anyone can view testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can update testimonials" ON public.testimonials FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete testimonials" ON public.testimonials FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for contact_leads (anyone can insert, only admin/editor can view/manage)
CREATE POLICY "Anyone can insert contact leads" ON public.contact_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins and editors can view contact leads" ON public.contact_leads FOR SELECT USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can update contact leads" ON public.contact_leads FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins and editors can delete contact leads" ON public.contact_leads FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for site_settings (public read, admin only write)
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete site settings" ON public.site_settings FOR DELETE USING (public.has_role(auth.uid(), 'admin'));