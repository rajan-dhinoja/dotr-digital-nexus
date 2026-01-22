import type { JSONSchemaType } from 'ajv';

export const ctaSchema: JSONSchemaType<{
  cta_text?: string;
  cta_link?: string;
  cta_style?: string;
  primary_cta_text?: string;
  primary_cta_link?: string;
  secondary_cta_text?: string;
  secondary_cta_link?: string;
}> = {
  type: 'object',
  properties: {
    cta_text: { type: 'string', nullable: true },
    cta_link: { type: 'string', nullable: true },
    cta_style: { type: 'string', nullable: true },
    primary_cta_text: { type: 'string', nullable: true },
    primary_cta_link: { type: 'string', nullable: true },
    secondary_cta_text: { type: 'string', nullable: true },
    secondary_cta_link: { type: 'string', nullable: true },
  },
  additionalProperties: false,
};

export const ctaExample = {
  cta_text: 'Get Started',
  cta_link: '/signup',
  cta_style: 'primary',
  primary_cta_text: 'Learn More',
  primary_cta_link: '/about',
  secondary_cta_text: 'Contact Us',
  secondary_cta_link: '/contact',
};
