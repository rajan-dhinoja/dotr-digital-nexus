import type { JSONSchemaType } from 'ajv';

export const socialLinksSchema: JSONSchemaType<{
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  github?: string;
  website?: string;
}> = {
  type: 'object',
  properties: {
    facebook: { type: 'string', nullable: true },
    twitter: { type: 'string', nullable: true },
    instagram: { type: 'string', nullable: true },
    linkedin: { type: 'string', nullable: true },
    youtube: { type: 'string', nullable: true },
    github: { type: 'string', nullable: true },
    website: { type: 'string', nullable: true },
  },
  additionalProperties: false,
};

export const socialLinksExample = {
  facebook: 'https://facebook.com/username',
  twitter: 'https://twitter.com/username',
  instagram: 'https://instagram.com/username',
  linkedin: 'https://linkedin.com/in/username',
  youtube: 'https://youtube.com/username',
  github: 'https://github.com/username',
  website: 'https://example.com',
};
