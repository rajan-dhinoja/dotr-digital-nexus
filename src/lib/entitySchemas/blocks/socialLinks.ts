// Plain schema object - avoids AJV JSONSchemaType strictNullChecks requirement
export const socialLinksSchema = {
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
} as const;

export const socialLinksExample = {
  facebook: 'https://facebook.com/username',
  twitter: 'https://twitter.com/username',
  instagram: 'https://instagram.com/username',
  linkedin: 'https://linkedin.com/in/username',
  youtube: 'https://youtube.com/username',
  github: 'https://github.com/username',
  website: 'https://example.com',
};
