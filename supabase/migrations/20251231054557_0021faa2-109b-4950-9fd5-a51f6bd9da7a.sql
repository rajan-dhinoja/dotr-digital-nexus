-- Insert Form section type
INSERT INTO section_types (name, slug, description, icon, allowed_pages, schema, is_active)
VALUES (
  'Form',
  'form',
  'Customizable contact or inquiry form with dynamic fields',
  'FileText',
  ARRAY['home', 'about', 'services', 'service_categories', 'contact', 'projects'],
  '{
    "fields": ["form_title", "form_description", "submit_button_text", "success_message", "fields"],
    "items_schema": {
      "field_type": "string",
      "label": "string",
      "name": "string",
      "placeholder": "string",
      "required": "boolean",
      "options": "array",
      "validation": "object",
      "width": "string"
    }
  }'::jsonb,
  true
);

-- Create form_submissions table for storing dynamic form submissions
CREATE TABLE public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES page_sections(id) ON DELETE SET NULL,
  page_type text NOT NULL,
  form_data jsonb NOT NULL DEFAULT '{}',
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit forms (public insert)
CREATE POLICY "Anyone can submit forms"
ON public.form_submissions
FOR INSERT
WITH CHECK (true);

-- Admins can view all form submissions
CREATE POLICY "Admins can view form submissions"
ON public.form_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage form submissions
CREATE POLICY "Admins can manage form submissions"
ON public.form_submissions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_form_submissions_updated_at
BEFORE UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();