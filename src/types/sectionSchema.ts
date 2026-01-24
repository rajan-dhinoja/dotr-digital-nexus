import type { Json } from '@/integrations/supabase/types';

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

// Plain JSON schema type (no strictNullChecks required)
export type PlainJsonSchema = {
  type: string;
  properties?: Record<string, unknown>;
  additionalProperties?: boolean;
  items?: unknown;
  required?: string[];
};

export interface JsonSchemaDefinition {
  schema: PlainJsonSchema;
  example: Record<string, unknown>;
}
