-- Insert Service Categories
INSERT INTO public.services_categories (id, name, slug, description, display_order) VALUES
  ('a1b2c3d4-1111-1111-1111-111111111111', 'Development', 'development', 'Web and mobile application development services', 1),
  ('a1b2c3d4-2222-2222-2222-222222222222', 'Designing', 'designing', 'UI/UX design, branding, and visual identity services', 2),
  ('a1b2c3d4-3333-3333-3333-333333333333', 'Marketing', 'marketing', 'Digital marketing, SEO, and growth strategies', 3),
  ('a1b2c3d4-4444-4444-4444-444444444444', 'Creative', 'creative', 'Video production, animation, and creative content', 4);

-- Insert Services
INSERT INTO public.services (id, title, slug, short_summary, description, category_id, display_order) VALUES
  (gen_random_uuid(), 'Web Development', 'web-development', 'Custom websites and web applications', 'We build modern, responsive websites and web applications using cutting-edge technologies. From simple landing pages to complex enterprise solutions, our team delivers scalable and maintainable code.', 'a1b2c3d4-1111-1111-1111-111111111111', 1),
  (gen_random_uuid(), 'Mobile App Development', 'mobile-app-development', 'iOS and Android applications', 'Native and cross-platform mobile applications that provide seamless user experiences. We develop apps that are fast, reliable, and user-friendly.', 'a1b2c3d4-1111-1111-1111-111111111111', 2),
  (gen_random_uuid(), 'E-commerce Solutions', 'ecommerce-solutions', 'Online stores and marketplaces', 'Complete e-commerce solutions including payment integration, inventory management, and customer portals. Built for scale and conversion.', 'a1b2c3d4-1111-1111-1111-111111111111', 3),
  (gen_random_uuid(), 'UI/UX Design', 'ui-ux-design', 'User interface and experience design', 'User-centered design that combines aesthetics with functionality. We create intuitive interfaces that delight users and drive engagement.', 'a1b2c3d4-2222-2222-2222-222222222222', 1),
  (gen_random_uuid(), 'Brand Identity', 'brand-identity', 'Logo design and brand guidelines', 'Comprehensive brand identity packages including logo design, color palettes, typography, and brand guidelines that tell your story.', 'a1b2c3d4-2222-2222-2222-222222222222', 2),
  (gen_random_uuid(), 'Graphic Design', 'graphic-design', 'Visual content and marketing materials', 'Eye-catching graphics for digital and print media. From social media assets to brochures and packaging design.', 'a1b2c3d4-2222-2222-2222-222222222222', 3),
  (gen_random_uuid(), 'SEO Optimization', 'seo-optimization', 'Search engine visibility and rankings', 'Data-driven SEO strategies that improve your search rankings and drive organic traffic. Technical SEO, content optimization, and link building.', 'a1b2c3d4-3333-3333-3333-333333333333', 1),
  (gen_random_uuid(), 'Social Media Marketing', 'social-media-marketing', 'Social media strategy and management', 'Engaging social media campaigns that build community and drive conversions. Content creation, scheduling, and analytics.', 'a1b2c3d4-3333-3333-3333-333333333333', 2),
  (gen_random_uuid(), 'Video Production', 'video-production', 'Professional video content creation', 'High-quality video production from concept to delivery. Commercials, explainer videos, corporate films, and social content.', 'a1b2c3d4-4444-4444-4444-444444444444', 1),
  (gen_random_uuid(), 'Motion Graphics', 'motion-graphics', 'Animated visual content', 'Dynamic motion graphics and animations that bring your brand to life. Logo animations, infographics, and promotional content.', 'a1b2c3d4-4444-4444-4444-444444444444', 2);

-- Insert Projects
INSERT INTO public.projects (id, title, slug, summary, description, client_name, project_url, achievements, display_order) VALUES
  ('b1c2d3e4-1111-1111-1111-111111111111', 'TechFlow Dashboard', 'techflow-dashboard', 'Enterprise analytics dashboard for data visualization', 'A comprehensive analytics dashboard built for TechFlow Inc. Features real-time data visualization, custom reporting, and user management. Built with React and Node.js with PostgreSQL backend.', 'TechFlow Inc.', 'https://techflow.example.com', '50% improvement in data processing speed, 10,000+ daily active users', 1),
  ('b1c2d3e4-2222-2222-2222-222222222222', 'GreenLife E-commerce', 'greenlife-ecommerce', 'Sustainable products marketplace', 'Full-featured e-commerce platform for eco-friendly products. Includes payment processing, inventory management, and a custom CMS for product management.', 'GreenLife Co.', 'https://greenlife.example.com', '200% increase in online sales, 4.8 star customer rating', 2),
  ('b1c2d3e4-3333-3333-3333-333333333333', 'FitTrack Mobile App', 'fittrack-mobile-app', 'Fitness tracking and workout planning app', 'Cross-platform mobile application for fitness enthusiasts. Features workout tracking, nutrition logging, and social challenges.', 'FitTrack Health', 'https://fittrack.example.com', '500,000+ downloads, Featured in App Store', 3),
  ('b1c2d3e4-4444-4444-4444-444444444444', 'Artisan Brand Identity', 'artisan-brand-identity', 'Complete rebrand for artisan coffee company', 'Comprehensive brand identity project including logo design, packaging, and marketing collateral for a premium coffee brand.', 'Artisan Coffee Co.', NULL, 'Award-winning packaging design, 40% brand recognition increase', 4),
  ('b1c2d3e4-5555-5555-5555-555555555555', 'CloudSync Platform', 'cloudsync-platform', 'Enterprise file sharing and collaboration', 'Secure cloud platform for enterprise file sharing with advanced permissions, version control, and real-time collaboration features.', 'CloudSync Technologies', 'https://cloudsync.example.com', '99.99% uptime, SOC 2 compliant, 50+ enterprise clients', 5);

-- Insert Team Members
INSERT INTO public.team_members (id, name, title, bio, social_links, display_order) VALUES
  (gen_random_uuid(), 'Sarah Johnson', 'CEO & Founder', 'With over 15 years of experience in digital innovation, Sarah leads our team with a vision for creating impactful digital solutions.', '{"linkedin": "https://linkedin.com/in/sarahjohnson", "twitter": "https://twitter.com/sarahj"}', 1),
  (gen_random_uuid(), 'Michael Chen', 'Technical Director', 'A full-stack developer with expertise in cloud architecture and scalable systems. Michael ensures our technical solutions are robust and future-proof.', '{"linkedin": "https://linkedin.com/in/michaelchen", "github": "https://github.com/mchen"}', 2),
  (gen_random_uuid(), 'Emily Rodriguez', 'Creative Director', 'Award-winning designer with a passion for creating memorable brand experiences. Emily leads our design team with creativity and precision.', '{"linkedin": "https://linkedin.com/in/emilyrodriguez", "dribbble": "https://dribbble.com/emilyr"}', 3),
  (gen_random_uuid(), 'David Kim', 'Lead Developer', 'Expert in React, Node.js, and modern web technologies. David brings technical excellence to every project he touches.', '{"linkedin": "https://linkedin.com/in/davidkim", "github": "https://github.com/dkim"}', 4),
  (gen_random_uuid(), 'Lisa Thompson', 'Marketing Director', 'Digital marketing strategist with expertise in SEO, content marketing, and growth hacking. Lisa drives our clients visibility and growth.', '{"linkedin": "https://linkedin.com/in/lisathompson", "twitter": "https://twitter.com/lisat"}', 5);

-- Insert Testimonials
INSERT INTO public.testimonials (id, name, designation, company, testimonial_text, project_id, display_order) VALUES
  (gen_random_uuid(), 'James Wilson', 'CTO', 'TechFlow Inc.', 'Working with DOTR was a game-changer for our business. They delivered a dashboard that exceeded our expectations and transformed how we visualize data.', 'b1c2d3e4-1111-1111-1111-111111111111', 1),
  (gen_random_uuid(), 'Amanda Foster', 'CEO', 'GreenLife Co.', 'The e-commerce platform DOTR built for us is beautiful, fast, and has significantly increased our online sales. Their team is professional and responsive.', 'b1c2d3e4-2222-2222-2222-222222222222', 2),
  (gen_random_uuid(), 'Robert Martinez', 'Product Manager', 'FitTrack Health', 'The mobile app DOTR developed has received amazing user feedback. Their attention to UX details made all the difference.', 'b1c2d3e4-3333-3333-3333-333333333333', 3),
  (gen_random_uuid(), 'Jennifer Lee', 'Marketing Director', 'Artisan Coffee Co.', 'Our new brand identity perfectly captures our companys essence. DOTR understood our vision and brought it to life beautifully.', 'b1c2d3e4-4444-4444-4444-444444444444', 4),
  (gen_random_uuid(), 'Thomas Brown', 'VP of Engineering', 'CloudSync Technologies', 'DOTR delivered a secure, scalable platform that our enterprise clients trust. Their technical expertise is outstanding.', 'b1c2d3e4-5555-5555-5555-555555555555', 5);

-- Insert Site Settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('company_name', '"DOTR Digital Agency"', 'Company display name'),
  ('contact_email', '"hello@dotr.agency"', 'Primary contact email'),
  ('contact_phone', '"+1 (555) 123-4567"', 'Primary contact phone'),
  ('address', '"123 Innovation Street, Tech City, TC 12345"', 'Company address'),
  ('social_links', '{"facebook": "https://facebook.com/dotr", "twitter": "https://twitter.com/dotr", "linkedin": "https://linkedin.com/company/dotr", "instagram": "https://instagram.com/dotr"}', 'Social media links'),
  ('meta_description', '"DOTR is a full-service digital agency specializing in web development, design, and digital marketing."', 'Default meta description for SEO');