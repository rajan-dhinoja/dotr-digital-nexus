import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import type { Json } from '@/integrations/supabase/types';
import type { JSONSchemaType } from 'ajv';
import type { SectionSchema, ValidationResult, JsonSchemaDefinition } from '@/types/sectionSchema';

// Initialize AJV with formats support
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Converts a database section schema to JSON Schema format
 */
export function convertToJsonSchema(sectionSchema: Json | null | undefined): JSONSchemaType<unknown> {
  if (!sectionSchema || typeof sectionSchema !== 'object') {
    // Fallback: permissive schema that allows any object
    return {
      type: 'object',
      additionalProperties: true,
    } as JSONSchemaType<unknown>;
  }

  const schema = sectionSchema as SectionSchema;
  const properties: Record<string, JSONSchemaType<unknown>> = {};
  const required: string[] = [];

  // Handle top-level fields
  if (Array.isArray(schema.fields) && schema.fields.length > 0) {
    for (const field of schema.fields) {
      if (typeof field !== 'string') continue;
      
      // Skip 'items' field if it exists, handle separately
      if (field === 'items') continue;
      
      // Determine field type from context or default to string
      let fieldType: 'string' | 'number' | 'boolean' | 'array' | 'object' = 'string';
      
      // Special handling for known field patterns
      if (field.includes('_url') || field.includes('_link') || field.includes('_image') || field.includes('url')) {
        fieldType = 'string';
      } else if (field === 'autoplay' || field.includes('_active') || field.includes('is_') || field === 'show_filters' || field === 'show_featured_only') {
        fieldType = 'boolean';
      } else if (field === 'count' || field.includes('_order') || field.includes('display_order') || field.includes('rating')) {
        fieldType = 'number';
      } else if (field.includes('_links') || field.includes('platforms') || field.includes('options') || field.includes('features')) {
        fieldType = 'array';
      }

      properties[field] = {
        type: fieldType,
      } as JSONSchemaType<unknown>;
    }
  }

  // Handle items array schema
  if (schema.items_schema && typeof schema.items_schema === 'object') {
    const itemProperties: Record<string, JSONSchemaType<unknown>> = {};
    
    for (const [key, typeStr] of Object.entries(schema.items_schema)) {
      if (typeof key !== 'string' || typeof typeStr !== 'string') continue;
      
      let itemType: 'string' | 'number' | 'boolean' | 'array' | 'object' = 'string';
      
      if (typeStr === 'string') itemType = 'string';
      else if (typeStr === 'number') itemType = 'number';
      else if (typeStr === 'boolean') itemType = 'boolean';
      else if (typeStr === 'array') itemType = 'array';
      else if (typeStr === 'object') itemType = 'object';

      itemProperties[key] = {
        type: itemType,
      } as JSONSchemaType<unknown>;
    }

    // Only add items property if we have item properties or if 'items' is in fields
    if (Object.keys(itemProperties).length > 0 || (Array.isArray(schema.fields) && schema.fields.includes('items'))) {
      properties.items = {
        type: 'array',
        items: {
          type: 'object',
          properties: itemProperties,
          additionalProperties: true, // Allow extra fields in items
        },
      } as JSONSchemaType<unknown>;
    }
  }

  return {
    type: 'object',
    properties,
    additionalProperties: true, // Allow extra fields not in schema
  } as JSONSchemaType<unknown>;
}

/**
 * Generates a realistic example value for a field based on its name
 */
function getFieldExampleValue(field: string): unknown {
  const fieldLower = field.toLowerCase();

  // URLs and Links
  if (fieldLower.includes('video_url') || fieldLower === 'video_url') {
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }
  if (fieldLower.includes('poster_image') || fieldLower === 'poster_image') {
    return 'https://example.com/poster.jpg';
  }
  if (fieldLower.includes('background_image') || fieldLower === 'background_image') {
    return 'https://example.com/background.jpg';
  }
  if (fieldLower.includes('image_url') || fieldLower === 'image_url') {
    return 'https://example.com/image.jpg';
  }
  if (fieldLower.includes('_url') || fieldLower.includes('_link') || fieldLower.includes('url') || fieldLower.includes('link')) {
    return 'https://example.com';
  }
  if (fieldLower.includes('_image') || fieldLower === 'image') {
    return 'https://example.com/image.jpg';
  }

  // Boolean fields
  if (fieldLower === 'autoplay') {
    return false;
  }
  if (fieldLower === 'show_filters' || fieldLower === 'show_featured_only' || fieldLower === 'animate') {
    return true;
  }
  if (fieldLower.includes('_active') || fieldLower.includes('is_') || fieldLower.includes('has_')) {
    return false;
  }

  // Number fields
  if (fieldLower === 'count' || fieldLower === 'rating') {
    return 5;
  }
  if (fieldLower.includes('_order') || fieldLower.includes('display_order') || fieldLower === 'step') {
    return 1;
  }

  // Text fields with specific patterns
  if (fieldLower === 'headline' || fieldLower === 'form_title') {
    return 'Welcome to Our Platform';
  }
  if (fieldLower === 'subtitle' || fieldLower === 'content_subtitle') {
    return 'Build amazing experiences with our services';
  }
  if (fieldLower === 'description' || fieldLower === 'form_description') {
    return 'This is a detailed description of the section content. You can add multiple lines of text here to provide more information to your visitors.';
  }
  if (fieldLower.includes('cta_text') || fieldLower === 'button_text' || fieldLower === 'submit_button_text') {
    return 'Get Started';
  }
  if (fieldLower.includes('primary_cta_text')) {
    return 'Learn More';
  }
  if (fieldLower.includes('secondary_cta_text')) {
    return 'Contact Us';
  }
  if (fieldLower.includes('cta_link') || fieldLower === 'button_url' || fieldLower.includes('primary_cta_link')) {
    return '/signup';
  }
  if (fieldLower.includes('secondary_cta_link')) {
    return '/contact';
  }
  if (fieldLower === 'success_message') {
    return 'Thank you! Your submission has been received.';
  }
  if (fieldLower === 'image_position') {
    return 'left';
  }
  if (fieldLower === 'layout') {
    return 'grid';
  }
  if (fieldLower === 'placeholder_text') {
    return 'Enter your email address';
  }
  if (fieldLower === 'button_text' && !fieldLower.includes('submit')) {
    return 'Subscribe';
  }
  if (fieldLower === 'email') {
    return 'contact@example.com';
  }
  if (fieldLower === 'phone') {
    return '+1 (555) 123-4567';
  }
  if (fieldLower === 'address') {
    return '123 Main Street, City, State 12345';
  }
  if (fieldLower === 'map_embed_url') {
    return 'https://www.google.com/maps/embed?pb=...';
  }
  if (fieldLower.includes('title') && !fieldLower.includes('form')) {
    return 'Section Title';
  }
  if (fieldLower.includes('text') && !fieldLower.includes('cta') && !fieldLower.includes('button')) {
    return 'Example text content';
  }
  if (fieldLower.includes('name')) {
    return 'Example Name';
  }
  if (fieldLower.includes('bio')) {
    return 'Brief biography or description';
  }
  if (fieldLower.includes('quote')) {
    return 'This is an example quote or testimonial text.';
  }
  if (fieldLower.includes('author')) {
    return 'John Doe';
  }
  if (fieldLower.includes('role')) {
    return 'CEO';
  }
  if (fieldLower.includes('company')) {
    return 'Example Company';
  }
  if (fieldLower.includes('question')) {
    return 'What is your question?';
  }
  if (fieldLower.includes('answer')) {
    return 'This is the answer to the question.';
  }
  if (fieldLower.includes('value')) {
    return '100';
  }
  if (fieldLower.includes('label')) {
    return 'Example Label';
  }
  if (fieldLower.includes('suffix')) {
    return '+';
  }
  if (fieldLower.includes('prefix')) {
    return '$';
  }
  if (fieldLower.includes('icon')) {
    return 'Zap';
  }
  if (fieldLower.includes('category')) {
    return 'Web Design';
  }
  if (fieldLower.includes('year')) {
    return '2024';
  }
  if (fieldLower.includes('price')) {
    return '$99';
  }
  if (fieldLower.includes('features') && !fieldLower.includes('show')) {
    return ['Feature 1', 'Feature 2', 'Feature 3'];
  }
  if (fieldLower.includes('platforms') || fieldLower.includes('social_links')) {
    return ['twitter', 'facebook', 'linkedin'];
  }
  if (fieldLower.includes('options')) {
    return ['Option 1', 'Option 2', 'Option 3'];
  }
  if (fieldLower === 'field_type') {
    return 'text';
  }
  if (fieldLower === 'label' && !fieldLower.includes('suffix') && !fieldLower.includes('prefix')) {
    return 'Field Label';
  }
  if (fieldLower === 'name' && !fieldLower.includes('company') && !fieldLower.includes('author')) {
    return 'field_name';
  }
  if (fieldLower === 'placeholder') {
    return 'Enter value...';
  }
  if (fieldLower === 'width') {
    return 'full';
  }
  if (fieldLower === 'validation') {
    return {};
  }

  // Default for unknown string fields
  return '';
}

/**
 * Generates an example JSON object from a section schema
 */
export function generateExampleJson(sectionSchema: Json | null | undefined): Record<string, unknown> {
  if (!sectionSchema || typeof sectionSchema !== 'object') {
    return {};
  }

  const schema = sectionSchema as SectionSchema;
  const example: Record<string, unknown> = {};

  // Generate examples for top-level fields
  if (Array.isArray(schema.fields) && schema.fields.length > 0) {
    for (const field of schema.fields) {
      if (typeof field !== 'string') continue;
      if (field === 'items') {
        // Skip items, handle separately
        continue;
      }

      example[field] = getFieldExampleValue(field);
    }
  }

  // Generate example items array if items_schema exists
  if (schema.items_schema && typeof schema.items_schema === 'object') {
    const itemExample: Record<string, unknown> = {};
    
    for (const [key, typeStr] of Object.entries(schema.items_schema)) {
      if (typeof key !== 'string' || typeof typeStr !== 'string') continue;
      
      if (typeStr === 'string') {
        // Use the same field example value function for consistency
        itemExample[key] = getFieldExampleValue(key);
      } else if (typeStr === 'number') {
        // Generate contextual number examples
        if (key.includes('step') || key.includes('order')) {
          itemExample[key] = 1;
        } else if (key.includes('rating') || key.includes('value')) {
          itemExample[key] = 5;
        } else {
          itemExample[key] = 0;
        }
      } else if (typeStr === 'boolean') {
        // Generate contextual boolean examples
        if (key.includes('required') || key.includes('featured') || key.includes('active')) {
          itemExample[key] = true;
        } else {
          itemExample[key] = false;
        }
      } else if (typeStr === 'array') {
        // Generate contextual array examples
        if (key.includes('options')) {
          itemExample[key] = ['Option 1', 'Option 2', 'Option 3'];
        } else if (key.includes('features')) {
          itemExample[key] = ['Feature 1', 'Feature 2', 'Feature 3'];
        } else if (key.includes('links') || key.includes('platforms')) {
          itemExample[key] = ['twitter', 'facebook', 'linkedin'];
        } else if (key.includes('technologies')) {
          itemExample[key] = ['React', 'TypeScript', 'Node.js'];
        } else {
          itemExample[key] = [];
        }
      } else if (typeStr === 'object') {
        // Generate contextual object examples
        if (key.includes('validation')) {
          itemExample[key] = { min: 0, max: 100 };
        } else {
          itemExample[key] = {};
        }
      } else {
        itemExample[key] = '';
      }
    }

    // Only add items example if we have item properties
    if (Object.keys(itemExample).length > 0) {
      // Generate 2-3 example items to show array structure
      const itemsArray = [];
      for (let i = 0; i < 2; i++) {
        const item = { ...itemExample };
        // Make items slightly different for better examples
        Object.keys(item).forEach(k => {
          if (typeof item[k] === 'string' && !item[k].toString().includes('http')) {
            item[k] = `${item[k]} ${i + 1}`;
          } else if (typeof item[k] === 'number') {
            item[k] = (item[k] as number) + i;
          }
        });
        itemsArray.push(item);
      }
      example.items = itemsArray;
    }
  }

  return example;
}

/**
 * Validates JSON against a section schema
 */
export function validateJson(
  json: unknown,
  sectionSchema: Json | null | undefined
): ValidationResult {
  try {
    // First, ensure json is an object
    if (typeof json !== 'object' || json === null) {
      return {
        valid: false,
        errors: [
          {
            path: '/',
            message: 'JSON must be an object',
          },
        ],
      };
    }

    // Handle empty object case
    if (Object.keys(json).length === 0) {
      // Empty object is valid, but warn if schema expects fields
      if (sectionSchema && typeof sectionSchema === 'object') {
        const schema = sectionSchema as SectionSchema;
        if (Array.isArray(schema.fields) && schema.fields.length > 0) {
          // Empty is still valid, just informational
        }
      }
    }

    const jsonSchema = convertToJsonSchema(sectionSchema);
    const validate: ValidateFunction = ajv.compile(jsonSchema);

    const valid = validate(json);

    if (!valid && validate.errors) {
      return {
        valid: false,
        errors: validate.errors.map((error) => {
          // Improve error messages
          let message = error.message || 'Validation error';
          if (error.keyword === 'type') {
            message = `Expected ${error.params?.type || 'valid type'}, got ${error.params?.type || 'invalid type'}`;
          } else if (error.keyword === 'required') {
            message = `Missing required field: ${error.params?.missingProperty || 'unknown'}`;
          }
          
          return {
            path: error.instancePath || error.schemaPath || '/',
            message,
            instancePath: error.instancePath,
          };
        }),
      };
    }

    return {
      valid: true,
      errors: [],
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: '/',
          message: error instanceof Error ? error.message : 'Unknown validation error',
        },
      ],
    };
  }
}

/**
 * Gets both JSON Schema and example JSON for a section type
 */
export function getSchemaDefinition(sectionSchema: Json | null | undefined): JsonSchemaDefinition {
  return {
    schema: convertToJsonSchema(sectionSchema),
    example: generateExampleJson(sectionSchema),
  };
}
