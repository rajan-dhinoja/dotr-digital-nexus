import type { JSONSchemaType } from 'ajv';

export const contactSchema: JSONSchemaType<{
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}> = {
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
};

export const contactExample = {
  email: 'contact@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  country: 'USA',
};
