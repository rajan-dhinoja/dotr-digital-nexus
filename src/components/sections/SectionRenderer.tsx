import { PageSection } from '@/hooks/usePageSections';
import type { Json } from '@/integrations/supabase/types';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { ProcessSection } from './ProcessSection';
import { TestimonialsSection } from './TestimonialsSection';
import { StatsSection } from './StatsSection';
import { FAQSection } from './FAQSection';
import { CTASection } from './CTASection';
import { GallerySection } from './GallerySection';
import { TeamSection } from './TeamSection';
import { PricingSection } from './PricingSection';
import { FormSection } from './FormSection';
import { LogoCloudSection } from './LogoCloudSection';
import { ServicesGridSection } from './ServicesGridSection';
import { PortfolioGridSection } from './PortfolioGridSection';
import { VideoSection } from './VideoSection';
import { ImageTextSection } from './ImageTextSection';
import { TimelineSection } from './TimelineSection';
import { CountersSection } from './CountersSection';
import { NewsletterSection } from './NewsletterSection';
import { BlogPostsSection } from './BlogPostsSection';
import { ContactInfoSection } from './ContactInfoSection';

interface SectionRendererProps {
  sections: PageSection[];
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <>
      {sections.map((section) => (
        <DynamicSection key={section.id} section={section} />
      ))}
    </>
  );
}

interface DynamicSectionProps {
  section: PageSection;
}

function DynamicSection({ section }: DynamicSectionProps) {
  const { section_type, title, subtitle, content, id } = section;
  const contentObj = (content || {}) as Record<string, unknown>;

  switch (section_type) {
    case 'hero':
      return <HeroSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'features':
      return <FeaturesSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'process':
      return <ProcessSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'testimonials':
      return <TestimonialsSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'stats':
      return <StatsSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'faq':
      return <FAQSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'cta':
      return <CTASection title={title} subtitle={subtitle} content={contentObj} />;
    case 'gallery':
      return <GallerySection title={title} subtitle={subtitle} content={contentObj} />;
    case 'team':
      return <TeamSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'pricing':
      return <PricingSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'form':
      return <FormSection title={title} subtitle={subtitle} content={contentObj} sectionId={id} />;
    case 'logo-cloud':
      return <LogoCloudSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'services-grid':
      return <ServicesGridSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'portfolio-grid':
      return <PortfolioGridSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'video':
      return <VideoSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'image-text':
      return <ImageTextSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'timeline':
      return <TimelineSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'counters':
      return <CountersSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'newsletter':
      return <NewsletterSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'blog-posts':
      return <BlogPostsSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'contact-info':
      return <ContactInfoSection title={title} subtitle={subtitle} content={contentObj} />;
    default:
      return null;
  }
}
