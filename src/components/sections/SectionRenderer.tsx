import { PageSection } from '@/hooks/usePageSections';
import { AnimateInView, type AnimateInViewPreset } from '@/components/interactive/AnimateInView';
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
import { DividerSection } from './DividerSection';
import { UspStripSection } from './UspStripSection';
import { KpiStripSection } from './KpiStripSection';
import { SocialProofBarSection } from './SocialProofBarSection';
import { SuccessMetricsSection } from './SuccessMetricsSection';
import { AwardsBadgesSection } from './AwardsBadgesSection';
import { PressMentionsSection } from './PressMentionsSection';
import { RatingsReviewsSection } from './RatingsReviewsSection';
import { TrustBadgesSection } from './TrustBadgesSection';
import { DifferentiatorsSection } from './DifferentiatorsSection';
import { ProblemStatementSection } from './ProblemStatementSection';
import { AgitateSolveSection } from './AgitateSolveSection';
import { ValuePropositionSection } from './ValuePropositionSection';
import { ElevatorPitchSection } from './ElevatorPitchSection';
import { OutcomesBenefitsSection } from './OutcomesBenefitsSection';
import { WhoItsForSection } from './WhoItsForSection';
import { BeforeAfterSection } from './BeforeAfterSection';
import { VideoDemoSection } from './VideoDemoSection';
import { ScreenshotGallerySection } from './ScreenshotGallerySection';
import { DeviceFramesSection } from './DeviceFramesSection';
import { FeatureListSection } from './FeatureListSection';
import { FeatureHighlightsSection } from './FeatureHighlightsSection';
import { PrimaryCtaBannerSection } from './PrimaryCtaBannerSection';
import { SecondaryCtaSection } from './SecondaryCtaSection';
import { ExitIntentCtaSection } from './ExitIntentCtaSection';
import { AboutUsSection } from './AboutUsSection';
import { ValuesCultureSection } from './ValuesCultureSection';

export interface SectionAnimationConfig {
  enabled?: boolean;
  preset?: AnimateInViewPreset;
  stagger?: boolean;
}

function getSectionAnimationConfig(section: PageSection): {
  enabled: boolean;
  preset: AnimateInViewPreset;
  stagger: boolean;
} {
  const raw = (section.content as Record<string, unknown>)?.animation as SectionAnimationConfig | undefined;
  const preset = raw?.preset ?? "subtle";
  const validPreset: AnimateInViewPreset =
    preset === "smooth" || preset === "scale" || preset === "none" ? preset : "subtle";
  const formNoAnimation = section.section_type === "form";
  return {
    enabled: formNoAnimation ? false : (raw?.enabled !== false),
    preset: formNoAnimation ? "none" : validPreset,
    stagger: raw?.stagger !== false,
  };
}

interface SectionRendererProps {
  sections: PageSection[];
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <>
      {sections.map((section) => (
        <SectionAnimationWrapper key={section.id} section={section} />
      ))}
    </>
  );
}

interface SectionAnimationWrapperProps {
  section: PageSection;
}

function SectionAnimationWrapper({ section }: SectionAnimationWrapperProps) {
  const config = getSectionAnimationConfig(section);
  const child = <DynamicSection section={section} />;

  if (!config.enabled || config.preset === "none") {
    return child;
  }

  return (
    <AnimateInView
      animation={config.preset}
      disabled={!config.enabled}
      staggerMax={6}
    >
      {child}
    </AnimateInView>
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
    case 'divider':
      return <DividerSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'usp-strip':
      return <UspStripSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'kpi-strip':
      return <KpiStripSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'social-proof-bar':
      return <SocialProofBarSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'success-metrics':
      return <SuccessMetricsSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'awards-badges':
      return <AwardsBadgesSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'press-mentions':
      return <PressMentionsSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'ratings-reviews':
      return <RatingsReviewsSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'trust-badges':
      return <TrustBadgesSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'differentiators':
      return <DifferentiatorsSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'problem-statement':
      return <ProblemStatementSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'agitate-solve':
      return <AgitateSolveSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'value-proposition':
      return <ValuePropositionSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'elevator-pitch':
      return <ElevatorPitchSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'outcomes-benefits':
      return <OutcomesBenefitsSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'who-its-for':
      return <WhoItsForSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'before-after':
      return <BeforeAfterSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'video-demo':
      return <VideoDemoSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'screenshot-gallery':
      return <ScreenshotGallerySection title={title} subtitle={subtitle} content={contentObj} />;
    case 'device-frames':
      return <DeviceFramesSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'feature-list':
      return <FeatureListSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'feature-highlights':
      return <FeatureHighlightsSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'primary-cta-banner':
      return <PrimaryCtaBannerSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'secondary-cta':
      return <SecondaryCtaSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'exit-intent-cta':
      return <ExitIntentCtaSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'about-us':
      return <AboutUsSection title={title} subtitle={subtitle} content={contentObj} />;
    case 'values-culture':
      return <ValuesCultureSection title={title} subtitle={subtitle} content={contentObj} />;
    default:
      return null;
  }
}
