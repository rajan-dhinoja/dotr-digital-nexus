-- Insert 10 new section types for the agency website
INSERT INTO section_types (name, slug, description, icon, schema, allowed_pages, is_active) VALUES
(
  'Logo Cloud',
  'logo-cloud',
  'Display client/partner logos in a grid or scrolling marquee',
  'Building2',
  '{"fields": ["items"], "items_schema": {"logo_url": "string", "name": "string", "link": "string"}}',
  ARRAY['home', 'about', 'services', 'portfolio', 'blog', 'contact', 'testimonials'],
  true
),
(
  'Services Grid',
  'services-grid',
  'Showcase services with icons, titles, and descriptions in a card grid',
  'Grid3X3',
  '{"fields": ["items"], "items_schema": {"icon": "string", "title": "string", "description": "string", "link": "string"}}',
  ARRAY['home', 'about', 'services', 'portfolio', 'blog', 'contact', 'testimonials'],
  true
),
(
  'Portfolio Grid',
  'portfolio-grid',
  'Display projects with category filtering and hover effects',
  'LayoutGrid',
  '{"fields": ["show_filters", "items"], "items_schema": {"image": "string", "title": "string", "category": "string", "link": "string"}}',
  ARRAY['home', 'about', 'services', 'portfolio', 'blog', 'contact', 'testimonials'],
  true
),
(
  'Video',
  'video',
  'Embed YouTube/Vimeo videos with optional overlay text',
  'Play',
  '{"fields": ["video_url", "poster_image", "autoplay"]}',
  ARRAY['home', 'about', 'services', 'portfolio', 'blog', 'contact', 'testimonials'],
  true
),
(
  'Image Text',
  'image-text',
  'Side-by-side image and text content block',
  'LayoutPanelLeft',
  '{"fields": ["image_url", "image_position", "description", "cta_text", "cta_link"]}',
  ARRAY['home', 'about', 'services', 'portfolio', 'blog', 'contact', 'testimonials'],
  true
),
(
  'Timeline',
  'timeline',
  'Vertical timeline for company history or project milestones',
  'Clock',
  '{"fields": ["items"], "items_schema": {"year": "string", "title": "string", "description": "string", "icon": "string"}}',
  ARRAY['home', 'about', 'services', 'portfolio', 'blog', 'contact', 'testimonials'],
  true
),
(
  'Counters',
  'counters',
  'Animated number counters with icons',
  'Hash',
  '{"fields": ["items"], "items_schema": {"value": "number", "label": "string", "prefix": "string", "suffix": "string", "icon": "string"}}',
  ARRAY['home', 'about', 'services', 'portfolio', 'blog', 'contact', 'testimonials'],
  true
),
(
  'Newsletter',
  'newsletter',
  'Email signup section with compelling copy',
  'Mail',
  '{"fields": ["placeholder_text", "button_text", "success_message"]}',
  ARRAY['home', 'about', 'services', 'portfolio', 'blog', 'contact', 'testimonials'],
  true
),
(
  'Blog Posts',
  'blog-posts',
  'Dynamically display latest blog posts from database',
  'Newspaper',
  '{"fields": ["count", "show_featured_only", "layout"]}',
  ARRAY['home', 'about', 'services', 'portfolio', 'blog', 'contact', 'testimonials'],
  true
),
(
  'Contact Info',
  'contact-info',
  'Display contact details with optional map embed',
  'MapPin',
  '{"fields": ["email", "phone", "address", "map_embed_url", "social_links"]}',
  ARRAY['home', 'about', 'services', 'portfolio', 'blog', 'contact', 'testimonials'],
  true
);