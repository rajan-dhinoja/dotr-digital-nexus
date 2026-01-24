// Plain schema object - avoids AJV JSONSchemaType strictNullChecks requirement
export const contactSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', nullable: true },
    phone: { type: 'string', nullable: true },
    address: { type: 'string', nullable: true },
    city: { type: 'string', nullable: true },
    state: { type: 'string', nullable: true },
    zip: { type: 'string', nullable: true },
    country: { type: 'string', nullable: true },
  },
  additionalProperties: false,
} as const;

export const contactExample = {
  email: 'contact@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  country: 'USA',
};
