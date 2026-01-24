// Plain schema object - avoids AJV JSONSchemaType strictNullChecks requirement
export const ctaSchema = {
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
} as const;

export const ctaExample = {
  cta_text: 'Get Started',
  cta_link: '/signup',
  cta_style: 'primary',
  primary_cta_text: 'Learn More',
  primary_cta_link: '/about',
  secondary_cta_text: 'Contact Us',
  secondary_cta_link: '/contact',
};
