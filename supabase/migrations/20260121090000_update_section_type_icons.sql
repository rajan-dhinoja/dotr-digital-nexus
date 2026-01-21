-- Ensure every section type has a unique Lucide icon
-- This updates the existing section_types records by slug.

-- Core / generic sections
UPDATE public.section_types SET icon = 'Sparkles'       WHERE slug = 'hero';
UPDATE public.section_types SET icon = 'ListChecks'     WHERE slug = 'features';
UPDATE public.section_types SET icon = 'Workflow'       WHERE slug = 'process';
UPDATE public.section_types SET icon = 'Quote'          WHERE slug = 'testimonials';
UPDATE public.section_types SET icon = 'BarChart3'      WHERE slug = 'stats';
UPDATE public.section_types SET icon = 'HelpCircle'     WHERE slug = 'faq';
UPDATE public.section_types SET icon = 'Megaphone'      WHERE slug = 'cta';
UPDATE public.section_types SET icon = 'Images'         WHERE slug = 'gallery';
UPDATE public.section_types SET icon = 'Users'          WHERE slug = 'team';
UPDATE public.section_types SET icon = 'Banknote'       WHERE slug = 'pricing';
UPDATE public.section_types SET icon = 'FileText'       WHERE slug = 'form';

-- Visual / media & grids
UPDATE public.section_types SET icon = 'PanelsTopLeft'  WHERE slug = 'logo-cloud';
UPDATE public.section_types SET icon = 'Briefcase'      WHERE slug = 'services-grid';
UPDATE public.section_types SET icon = 'LayoutGrid'     WHERE slug = 'portfolio-grid';
UPDATE public.section_types SET icon = 'Video'          WHERE slug = 'video';
UPDATE public.section_types SET icon = 'Image'          WHERE slug = 'image-text';
UPDATE public.section_types SET icon = 'Timeline'       WHERE slug = 'timeline';
UPDATE public.section_types SET icon = 'Gauge'          WHERE slug = 'counters';
UPDATE public.section_types SET icon = 'Mail'           WHERE slug = 'newsletter';
UPDATE public.section_types SET icon = 'ScrollText'     WHERE slug = 'blog-posts';
UPDATE public.section_types SET icon = 'PhoneCall'      WHERE slug = 'contact-info';

-- Layout / utility strips
UPDATE public.section_types SET icon = 'Minus'          WHERE slug = 'divider';
UPDATE public.section_types SET icon = 'Star'           WHERE slug = 'usp-strip';
UPDATE public.section_types SET icon = 'TrendingUp'     WHERE slug = 'kpi-strip';

-- Trust & social proof
UPDATE public.section_types SET icon = 'UserCheck'      WHERE slug = 'social-proof-bar';
UPDATE public.section_types SET icon = 'Target'         WHERE slug = 'success-metrics';
UPDATE public.section_types SET icon = 'Award'          WHERE slug = 'awards-badges';
UPDATE public.section_types SET icon = 'Newspaper'      WHERE slug = 'press-mentions';
UPDATE public.section_types SET icon = 'BadgeCheck'     WHERE slug = 'ratings-reviews';
UPDATE public.section_types SET icon = 'ShieldCheck'    WHERE slug = 'trust-badges';
UPDATE public.section_types SET icon = 'Shuffle'        WHERE slug = 'differentiators';

-- Value & narrative
UPDATE public.section_types SET icon = 'AlertTriangle'  WHERE slug = 'problem-statement';
UPDATE public.section_types SET icon = 'Lightbulb'      WHERE slug = 'agitate-solve';
UPDATE public.section_types SET icon = 'Gem'            WHERE slug = 'value-proposition';
UPDATE public.section_types SET icon = 'Mic'            WHERE slug = 'elevator-pitch';
UPDATE public.section_types SET icon = 'CheckCircle2'   WHERE slug = 'outcomes-benefits';
UPDATE public.section_types SET icon = 'UserCog'        WHERE slug = 'who-its-for';

-- Visual showcase
UPDATE public.section_types SET icon = 'ArrowLeftRight' WHERE slug = 'before-after';
UPDATE public.section_types SET icon = 'Clapperboard'   WHERE slug = 'video-demo';
UPDATE public.section_types SET icon = 'MonitorSmartphone' WHERE slug = 'screenshot-gallery';
UPDATE public.section_types SET icon = 'Smartphone'     WHERE slug = 'device-frames';

-- Feature variants & CTAs
UPDATE public.section_types SET icon = 'List'           WHERE slug = 'feature-list';
UPDATE public.section_types SET icon = 'PanelTop'       WHERE slug = 'feature-highlights';
UPDATE public.section_types SET icon = 'Rocket'         WHERE slug = 'primary-cta-banner';
UPDATE public.section_types SET icon = 'ArrowRight'     WHERE slug = 'secondary-cta';
UPDATE public.section_types SET icon = 'DoorOpen'       WHERE slug = 'exit-intent-cta';

-- Company / about
UPDATE public.section_types SET icon = 'Building2'      WHERE slug = 'about-us';
UPDATE public.section_types SET icon = 'HeartHandshake' WHERE slug = 'values-culture';

