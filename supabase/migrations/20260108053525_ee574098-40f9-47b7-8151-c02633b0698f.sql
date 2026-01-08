-- Insert 27 new section types
INSERT INTO public.section_types (name, slug, icon, description, allowed_pages, schema, is_active) VALUES
-- Layout & Utility Sections
('Section Divider', 'divider', 'Minus', 'Visual separator with decorative line, shape, or gradient', '{}', '{"style": "line", "color": "primary", "width": "full", "spacing": "medium"}', true),
('USP Strip', 'usp-strip', 'Zap', 'Horizontal strip highlighting unique selling points with icons', '{}', '{"items": [], "background_color": "primary"}', true),
('KPI/Stats Strip', 'kpi-strip', 'TrendingUp', 'Compact horizontal stats bar with key metrics', '{}', '{"items": [], "animate": true}', true),

-- Trust & Social Proof Sections
('Social Proof Bar', 'social-proof-bar', 'Users', 'Compact bar showing user count, ratings, social followers', '{}', '{"user_count": "", "rating": 5, "platforms": []}', true),
('Success Metrics', 'success-metrics', 'Target', 'Client success stories with measurable results', '{}', '{"items": []}', true),
('Awards & Badges', 'awards-badges', 'Award', 'Display certifications, awards, and achievement badges', '{}', '{"items": []}', true),
('Press Mentions', 'press-mentions', 'Newspaper', 'As seen in logos with quotes from publications', '{}', '{"items": []}', true),
('Ratings & Reviews', 'ratings-reviews', 'Star', 'Star ratings aggregated from platforms', '{}', '{"items": [], "show_aggregate": true}', true),
('Security Trust Badges', 'trust-badges', 'ShieldCheck', 'SSL, payment security, compliance certifications', '{}', '{"items": []}', true),
('Differentiators', 'differentiators', 'Sparkles', 'Why choose us comparison points vs competitors', '{}', '{"items": [], "show_comparison": false}', true),

-- Value Communication Sections
('Problem Statement', 'problem-statement', 'AlertTriangle', 'Identify customer pain points with empathy', '{}', '{"problems": [], "empathy_text": ""}', true),
('Agitate & Solve', 'agitate-solve', 'Lightbulb', 'Problem-agitate-solution copywriting framework', '{}', '{"problem": "", "agitation": "", "solution": ""}', true),
('Value Proposition', 'value-proposition', 'Gem', 'Core value statement with supporting points', '{}', '{"headline": "", "supporting_points": []}', true),
('Elevator Pitch', 'elevator-pitch', 'Mic', 'Quick company/product pitch in 30 seconds', '{}', '{"pitch": "", "tagline": ""}', true),
('Outcomes/Benefits', 'outcomes-benefits', 'CheckCircle', 'List of benefits and outcomes customers achieve', '{}', '{"items": []}', true),
('Who Its For', 'who-its-for', 'UserCheck', 'Target audience personas with descriptions', '{}', '{"personas": []}', true),

-- Visual Showcase Sections
('Before & After', 'before-after', 'ArrowLeftRight', 'Side-by-side comparison with slider', '{}', '{"before_image": "", "after_image": "", "before_label": "Before", "after_label": "After"}', true),
('Video Demo', 'video-demo', 'PlayCircle', 'Product demo video with feature callouts', '{}', '{"video_url": "", "poster_image": "", "callouts": []}', true),
('Screenshot Gallery', 'screenshot-gallery', 'Monitor', 'App/product screenshots in a carousel', '{}', '{"screenshots": [], "show_captions": true}', true),
('Device Frames', 'device-frames', 'Smartphone', 'Screenshots inside device mockups', '{}', '{"device_type": "iphone", "screenshots": []}', true),

-- Feature Sections
('Feature List', 'feature-list', 'List', 'Simple bulleted feature list with icons', '{}', '{"items": [], "columns": 2}', true),
('Feature Highlights', 'feature-highlights', 'LayoutPanelLeft', 'Alternating left/right feature blocks with images', '{}', '{"items": []}', true),

-- CTA Sections
('Primary CTA Banner', 'primary-cta-banner', 'Rocket', 'Full-width high-impact CTA with gradient background', '{}', '{"headline": "", "description": "", "button_text": "", "button_url": ""}', true),
('Secondary CTA', 'secondary-cta', 'ArrowRight', 'Subtle inline CTA for mid-page conversion', '{}', '{"text": "", "button_text": "", "button_url": ""}', true),
('Exit Intent CTA', 'exit-intent-cta', 'DoorOpen', 'Sticky CTA that appears on scroll', '{}', '{"headline": "", "button_text": "", "button_url": "", "show_after_scroll": 50}', true),

-- Company Info Sections
('About Us', 'about-us', 'Building', 'Company story with founder image and mission', '{}', '{"story": "", "mission": "", "founder_image": "", "founder_name": "", "founder_title": ""}', true),
('Values & Culture', 'values-culture', 'Heart', 'Company values with icons and descriptions', '{}', '{"items": []}', true)
ON CONFLICT (slug) DO NOTHING;