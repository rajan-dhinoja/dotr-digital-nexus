import type { EntitySchema, EntityType } from '@/types/entitySchema';
import { seoSchema, seoExample } from './blocks/seo';
import { mediaSchema, mediaExample } from './blocks/media';
import { ctaSchema, ctaExample } from './blocks/cta';
import { metadataSchema, metadataExample } from './blocks/metadata';
import { socialLinksSchema, socialLinksExample } from './blocks/socialLinks';
import { contactSchema, contactExample } from './blocks/contact';

// Plain JSON schema type for use without strictNullChecks
type PlainJsonSchema = {
  type: string;
  properties?: Record<string, unknown>;
  additionalProperties?: boolean;
  items?: unknown;
  required?: string[];
  nullable?: boolean;
};

// Schema registry for all entities
const entitySchemas: Map<EntityType, EntitySchema> = new Map();

/**
 * Merge multiple schemas into one
 */
function mergeSchemas(...schemas: PlainJsonSchema[]): PlainJsonSchema {
  const merged: PlainJsonSchema = {
    type: 'object',
    properties: {},
    additionalProperties: true,
  };

  for (const schema of schemas) {
    if (schema.type === 'object' && schema.properties) {
      merged.properties = {
        ...merged.properties,
        ...schema.properties,
      };
    }
  }

  return merged;
}

/**
 * Merge multiple example objects
 */
function mergeExamples(...examples: Record<string, unknown>[]): Record<string, unknown> {
  return Object.assign({}, ...examples);
}

// Register Page schema
const pageSchema = mergeSchemas(seoSchema, {
  type: 'object',
  properties: {
    title: { type: 'string', nullable: true },
    description: { type: 'string', nullable: true },
    content: { type: 'object', nullable: true, additionalProperties: true },
  },
  additionalProperties: true,
});

entitySchemas.set('page', {
  entityType: 'page',
  version: '1.0',
  schema: pageSchema as EntitySchema['schema'],
  example: mergeExamples(seoExample, {
    title: 'Page Title',
    description: 'Page description',
    content: {},
  }),
  description: 'Page entity with SEO and content',
});

// Register Service schema
const serviceSchema = mergeSchemas(mediaSchema, {
  type: 'object',
  properties: {
    name: { type: 'string', nullable: true },
    slug: { type: 'string', nullable: true },
    tagline: { type: 'string', nullable: true },
    description: { type: 'string', nullable: true },
    features: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string', nullable: true },
        },
        required: ['title', 'description'],
        additionalProperties: true,
      },
      nullable: true,
    },
    process_steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string', nullable: true },
        },
        required: ['title', 'description'],
        additionalProperties: true,
      },
      nullable: true,
    },
    faqs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
        required: ['question', 'answer'],
        additionalProperties: true,
      },
      nullable: true,
    },
    technologies: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
    pricing: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'string' },
          features: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['name', 'price', 'features'],
        additionalProperties: true,
      },
      nullable: true,
    },
  },
  additionalProperties: true,
});

entitySchemas.set('service', {
  entityType: 'service',
  version: '1.0',
  schema: serviceSchema as EntitySchema['schema'],
  example: mergeExamples(mediaExample, {
    name: 'Service Name',
    slug: 'service-slug',
    tagline: 'Service tagline',
    description: 'Service description',
    features: [
      { title: 'Feature 1', description: 'Description 1', icon: 'Zap' },
      { title: 'Feature 2', description: 'Description 2', icon: 'Star' },
    ],
    process_steps: [
      { title: 'Step 1', description: 'Step description', icon: 'ArrowRight' },
    ],
    faqs: [
      { question: 'Question?', answer: 'Answer' },
    ],
    technologies: ['React', 'TypeScript'],
    pricing: [
      { name: 'Basic', price: '$99', features: ['Feature 1', 'Feature 2'] },
    ],
  }),
  description: 'Service entity with features, process steps, FAQs, and pricing',
});

// Register Blog Post schema
const blogPostSchema = mergeSchemas(seoSchema, mediaSchema, {
  type: 'object',
  properties: {
    title: { type: 'string', nullable: true },
    slug: { type: 'string', nullable: true },
    excerpt: { type: 'string', nullable: true },
    content: { type: 'string', nullable: true },
    cover_image: { type: 'string', nullable: true },
    author_id: { type: 'string', nullable: true },
    categories: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
  },
  additionalProperties: true,
});

entitySchemas.set('blog_post', {
  entityType: 'blog_post',
  version: '1.0',
  schema: blogPostSchema as EntitySchema['schema'],
  example: mergeExamples(seoExample, mediaExample, {
    title: 'Blog Post Title',
    slug: 'blog-post-slug',
    excerpt: 'Blog post excerpt',
    content: 'Blog post content in markdown or HTML',
    cover_image: 'https://example.com/cover.jpg',
    author_id: 'author-uuid',
    categories: ['category-1', 'category-2'],
  }),
  description: 'Blog post entity with content, SEO, and metadata',
});

// Register Project schema
const projectSchema = mergeSchemas(mediaSchema, {
  type: 'object',
  properties: {
    title: { type: 'string', nullable: true },
    slug: { type: 'string', nullable: true },
    client: { type: 'string', nullable: true },
    description: { type: 'string', nullable: true },
    challenge: { type: 'string', nullable: true },
    solution: { type: 'string', nullable: true },
    results: { type: 'string', nullable: true },
    project_url: { type: 'string', nullable: true },
    technologies: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
  },
  additionalProperties: true,
});

entitySchemas.set('project', {
  entityType: 'project',
  version: '1.0',
  schema: projectSchema as EntitySchema['schema'],
  example: mergeExamples(mediaExample, {
    title: 'Project Title',
    slug: 'project-slug',
    client: 'Client Name',
    description: 'Project description',
    challenge: 'Project challenge',
    solution: 'Project solution',
    results: 'Project results',
    project_url: 'https://example.com/project',
    technologies: ['React', 'Node.js', 'PostgreSQL'],
  }),
  description: 'Project/Portfolio entity with case study details',
});

// Register Team Member schema
const teamMemberSchema = mergeSchemas(socialLinksSchema, contactSchema, {
  type: 'object',
  properties: {
    name: { type: 'string', nullable: true },
    role: { type: 'string', nullable: true },
    bio: { type: 'string', nullable: true },
    email: { type: 'string', format: 'email', nullable: true },
    image_url: { type: 'string', nullable: true },
  },
  additionalProperties: true,
});

entitySchemas.set('team_member', {
  entityType: 'team_member',
  version: '1.0',
  schema: teamMemberSchema as EntitySchema['schema'],
  example: mergeExamples(socialLinksExample, contactExample, {
    name: 'John Doe',
    role: 'Senior Developer',
    bio: 'Team member biography',
    email: 'john@example.com',
    image_url: 'https://example.com/profile.jpg',
  }),
  description: 'Team member entity with profile and social links',
});

// Register Testimonial schema
const testimonialSchema = mergeSchemas(mediaSchema, {
  type: 'object',
  properties: {
    author_name: { type: 'string', nullable: true },
    author_role: { type: 'string', nullable: true },
    author_company: { type: 'string', nullable: true },
    content: { type: 'string', nullable: true },
    rating: { type: 'number', nullable: true },
    author_image: { type: 'string', nullable: true },
  },
  additionalProperties: true,
});

entitySchemas.set('testimonial', {
  entityType: 'testimonial',
  version: '1.0',
  schema: testimonialSchema as EntitySchema['schema'],
  example: mergeExamples(mediaExample, {
    author_name: 'Jane Smith',
    author_role: 'CEO',
    author_company: 'Company Inc',
    content: 'Testimonial content',
    rating: 5,
    author_image: 'https://example.com/author.jpg',
  }),
  description: 'Testimonial entity with author information',
});

// Register Site Setting schema (flexible key-value)
const siteSettingSchema = {
  type: 'object',
  additionalProperties: true,
};

entitySchemas.set('site_setting', {
  entityType: 'site_setting',
  version: '1.0',
  schema: siteSettingSchema as EntitySchema['schema'],
  example: {
    site_name: 'My Site',
    tagline: 'Site tagline',
    admin_email: 'admin@example.com',
  },
  description: 'Site settings as flexible key-value pairs',
});

/**
 * Get schema for an entity type
 */
export function getEntitySchema(entityType: EntityType): EntitySchema | null {
  return entitySchemas.get(entityType) || null;
}

/**
 * Get all registered entity schemas
 */
export function getAllEntitySchemas(): EntitySchema[] {
  return Array.from(entitySchemas.values());
}

/**
 * Register a custom entity schema (for extensions)
 */
export function registerEntitySchema(schema: EntitySchema): void {
  entitySchemas.set(schema.entityType, schema);
}
