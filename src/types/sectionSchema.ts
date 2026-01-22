import type { Json } from '@/integrations/supabase/types';
import type { JSONSchemaType } from 'ajv';

export interface SectionSchema {
  fields?: string[];
  items_schema?: Record<string, string>;
  [key: string]: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    instancePath?: string;
  }>;
}

export interface JsonSchemaDefinition {
  schema: JSONSchemaType<unknown>;
  example: Record<string, unknown>;
}
