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

      // Generate example values based on field name
      if (field.includes('_url') || field.includes('_link') || field.includes('url')) {
        example[field] = 'https://example.com';
      } else if (field.includes('_image') || field.includes('image')) {
        example[field] = 'https://example.com/image.jpg';
      } else if (field === 'autoplay' || field.includes('_active') || field.includes('is_') || field === 'show_filters' || field === 'show_featured_only') {
        example[field] = false;
      } else if (field === 'count' || field.includes('_order') || field.includes('display_order') || field.includes('rating')) {
        example[field] = 0;
      } else if (field.includes('text') || field.includes('title') || field.includes('headline') || field.includes('name')) {
        example[field] = 'Example ' + field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      } else if (field.includes('description') || field.includes('subtitle') || field.includes('bio')) {
        example[field] = 'Example description text';
      } else if (field.includes('_links') || field.includes('platforms') || field.includes('options') || field.includes('features')) {
        example[field] = [];
      } else {
        example[field] = '';
      }
    }
  }

  // Generate example items array if items_schema exists
  if (schema.items_schema && typeof schema.items_schema === 'object') {
    const itemExample: Record<string, unknown> = {};
    
    for (const [key, typeStr] of Object.entries(schema.items_schema)) {
      if (typeof key !== 'string' || typeof typeStr !== 'string') continue;
      
      if (typeStr === 'string') {
        // Generate more contextual examples
        if (key.includes('url') || key.includes('link') || key.includes('image')) {
          itemExample[key] = 'https://example.com';
        } else if (key.includes('email')) {
          itemExample[key] = 'example@example.com';
        } else if (key.includes('phone')) {
          itemExample[key] = '+1 (555) 123-4567';
        } else {
          itemExample[key] = `Example ${key.replace(/_/g, ' ')}`;
        }
      } else if (typeStr === 'number') {
        itemExample[key] = 0;
      } else if (typeStr === 'boolean') {
        itemExample[key] = false;
      } else if (typeStr === 'array') {
        itemExample[key] = [];
      } else if (typeStr === 'object') {
        itemExample[key] = {};
      } else {
        itemExample[key] = '';
      }
    }

    // Only add items example if we have item properties
    if (Object.keys(itemExample).length > 0) {
      example.items = [itemExample];
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
