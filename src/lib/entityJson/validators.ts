import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import type { JSONSchemaType } from 'ajv';
import type { ValidationResult } from '@/types/entitySchema';

// Initialize AJV with formats support
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Validates JSON against a JSON Schema
 */
export function validateEntityJson(
  json: unknown,
  schema: JSONSchemaType<unknown>
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

    const validate: ValidateFunction = ajv.compile(schema);
    const valid = validate(json);

    if (!valid && validate.errors) {
      return {
        valid: false,
        errors: validate.errors.map((error) => {
          // Improve error messages
          let message = error.message || 'Validation error';
          if (error.keyword === 'type') {
            message = `Expected ${error.params?.type || 'valid type'}, got ${typeof (json as any)[error.instancePath?.replace('/', '') || '']}`;
          } else if (error.keyword === 'required') {
            message = `Missing required field: ${error.params?.missingProperty || 'unknown'}`;
          } else if (error.keyword === 'format') {
            message = `Invalid format for ${error.instancePath || 'field'}: ${error.message}`;
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
