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
  const { section_type, title, subtitle, content } = section;
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
    default:
      return null;
  }
}
