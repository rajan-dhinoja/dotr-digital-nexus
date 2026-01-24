// Plain schema object - avoids AJV JSONSchemaType strictNullChecks requirement
export const metadataSchema = {
  type: 'object',
  properties: {
    display_order: { type: 'number', nullable: true },
    is_featured: { type: 'boolean', nullable: true },
    is_active: { type: 'boolean', nullable: true },
    tags: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
    custom_fields: { type: 'object', nullable: true, additionalProperties: true },
  },
  additionalProperties: false,
} as const;

export const metadataExample = {
  display_order: 0,
  is_featured: false,
  is_active: true,
  tags: ['tag1', 'tag2', 'tag3'],
  custom_fields: {
    custom_key: 'custom_value',
  },
};
