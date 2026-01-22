import type { JSONSchemaType } from 'ajv';

export const seoSchema: JSONSchemaType<{
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_card?: string;
  canonical_url?: string;
}> = {
  type: 'object',
  properties: {
    meta_title: { type: 'string', nullable: true },
    meta_description: { type: 'string', nullable: true },
    og_title: { type: 'string', nullable: true },
    og_description: { type: 'string', nullable: true },
    og_image: { type: 'string', nullable: true },
    og_type: { type: 'string', nullable: true },
    twitter_card: { type: 'string', nullable: true },
    canonical_url: { type: 'string', nullable: true },
  },
  additionalProperties: false,
};

export const seoExample = {
  meta_title: 'Page Title - SEO Optimized',
  meta_description: 'A compelling meta description that summarizes the page content in 150-160 characters.',
  og_title: 'Page Title for Social Sharing',
  og_description: 'Description for social media preview cards',
  og_image: 'https://example.com/og-image.jpg',
  og_type: 'website',
  twitter_card: 'summary_large_image',
  canonical_url: 'https://example.com/page',
};
