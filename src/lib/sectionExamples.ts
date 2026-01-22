/**
 * Section JSON Examples
 * 
 * This file imports all section example JSON files and provides
 * a mapping from section slug to example JSON.
 */

// Import all section examples
import heroExample from '../../examples/sections/hero.json';
import featuresExample from '../../examples/sections/features.json';
import processExample from '../../examples/sections/process.json';
import testimonialsExample from '../../examples/sections/testimonials.json';
import statsExample from '../../examples/sections/stats.json';
import faqExample from '../../examples/sections/faq.json';
import ctaExample from '../../examples/sections/cta.json';
import galleryExample from '../../examples/sections/gallery.json';
import teamExample from '../../examples/sections/team.json';
import pricingExample from '../../examples/sections/pricing.json';
import formExample from '../../examples/sections/form.json';
import logoCloudExample from '../../examples/sections/logo-cloud.json';
import servicesGridExample from '../../examples/sections/services-grid.json';
import portfolioGridExample from '../../examples/sections/portfolio-grid.json';
import videoExample from '../../examples/sections/video.json';
import imageTextExample from '../../examples/sections/image-text.json';
import timelineExample from '../../examples/sections/timeline.json';
import countersExample from '../../examples/sections/counters.json';
import newsletterExample from '../../examples/sections/newsletter.json';
import blogPostsExample from '../../examples/sections/blog-posts.json';
import contactInfoExample from '../../examples/sections/contact-info.json';
import dividerExample from '../../examples/sections/divider.json';
import uspStripExample from '../../examples/sections/usp-strip.json';
import kpiStripExample from '../../examples/sections/kpi-strip.json';
import socialProofBarExample from '../../examples/sections/social-proof-bar.json';
import successMetricsExample from '../../examples/sections/success-metrics.json';
import awardsBadgesExample from '../../examples/sections/awards-badges.json';
import pressMentionsExample from '../../examples/sections/press-mentions.json';
import ratingsReviewsExample from '../../examples/sections/ratings-reviews.json';
import trustBadgesExample from '../../examples/sections/trust-badges.json';
import differentiatorsExample from '../../examples/sections/differentiators.json';
import problemStatementExample from '../../examples/sections/problem-statement.json';
import agitateSolveExample from '../../examples/sections/agitate-solve.json';
import valuePropositionExample from '../../examples/sections/value-proposition.json';
import elevatorPitchExample from '../../examples/sections/elevator-pitch.json';
import outcomesBenefitsExample from '../../examples/sections/outcomes-benefits.json';
import whoItsForExample from '../../examples/sections/who-its-for.json';
import beforeAfterExample from '../../examples/sections/before-after.json';
import videoDemoExample from '../../examples/sections/video-demo.json';
import screenshotGalleryExample from '../../examples/sections/screenshot-gallery.json';
import deviceFramesExample from '../../examples/sections/device-frames.json';
import featureListExample from '../../examples/sections/feature-list.json';
import featureHighlightsExample from '../../examples/sections/feature-highlights.json';
import primaryCtaBannerExample from '../../examples/sections/primary-cta-banner.json';
import secondaryCtaExample from '../../examples/sections/secondary-cta.json';
import exitIntentCtaExample from '../../examples/sections/exit-intent-cta.json';
import aboutUsExample from '../../examples/sections/about-us.json';
import valuesCultureExample from '../../examples/sections/values-culture.json';

/**
 * Mapping of section slugs to their example JSON
 */
export const sectionExamples: Record<string, Record<string, unknown>> = {
  'hero': heroExample as Record<string, unknown>,
  'features': featuresExample as Record<string, unknown>,
  'process': processExample as Record<string, unknown>,
  'testimonials': testimonialsExample as Record<string, unknown>,
  'stats': statsExample as Record<string, unknown>,
  'faq': faqExample as Record<string, unknown>,
  'cta': ctaExample as Record<string, unknown>,
  'gallery': galleryExample as Record<string, unknown>,
  'team': teamExample as Record<string, unknown>,
  'pricing': pricingExample as Record<string, unknown>,
  'form': formExample as Record<string, unknown>,
  'logo-cloud': logoCloudExample as Record<string, unknown>,
  'services-grid': servicesGridExample as Record<string, unknown>,
  'portfolio-grid': portfolioGridExample as Record<string, unknown>,
  'video': videoExample as Record<string, unknown>,
  'image-text': imageTextExample as Record<string, unknown>,
  'timeline': timelineExample as Record<string, unknown>,
  'counters': countersExample as Record<string, unknown>,
  'newsletter': newsletterExample as Record<string, unknown>,
  'blog-posts': blogPostsExample as Record<string, unknown>,
  'contact-info': contactInfoExample as Record<string, unknown>,
  'divider': dividerExample as Record<string, unknown>,
  'usp-strip': uspStripExample as Record<string, unknown>,
  'kpi-strip': kpiStripExample as Record<string, unknown>,
  'social-proof-bar': socialProofBarExample as Record<string, unknown>,
  'success-metrics': successMetricsExample as Record<string, unknown>,
  'awards-badges': awardsBadgesExample as Record<string, unknown>,
  'press-mentions': pressMentionsExample as Record<string, unknown>,
  'ratings-reviews': ratingsReviewsExample as Record<string, unknown>,
  'trust-badges': trustBadgesExample as Record<string, unknown>,
  'differentiators': differentiatorsExample as Record<string, unknown>,
  'problem-statement': problemStatementExample as Record<string, unknown>,
  'agitate-solve': agitateSolveExample as Record<string, unknown>,
  'value-proposition': valuePropositionExample as Record<string, unknown>,
  'elevator-pitch': elevatorPitchExample as Record<string, unknown>,
  'outcomes-benefits': outcomesBenefitsExample as Record<string, unknown>,
  'who-its-for': whoItsForExample as Record<string, unknown>,
  'before-after': beforeAfterExample as Record<string, unknown>,
  'video-demo': videoDemoExample as Record<string, unknown>,
  'screenshot-gallery': screenshotGalleryExample as Record<string, unknown>,
  'device-frames': deviceFramesExample as Record<string, unknown>,
  'feature-list': featureListExample as Record<string, unknown>,
  'feature-highlights': featureHighlightsExample as Record<string, unknown>,
  'primary-cta-banner': primaryCtaBannerExample as Record<string, unknown>,
  'secondary-cta': secondaryCtaExample as Record<string, unknown>,
  'exit-intent-cta': exitIntentCtaExample as Record<string, unknown>,
  'about-us': aboutUsExample as Record<string, unknown>,
  'values-culture': valuesCultureExample as Record<string, unknown>,
};

/**
 * Gets the example JSON for a section by its slug
 * @param sectionSlug The slug of the section type
 * @returns The example JSON object, or undefined if not found
 */
export function getSectionExample(sectionSlug: string): Record<string, unknown> | undefined {
  return sectionExamples[sectionSlug];
}
