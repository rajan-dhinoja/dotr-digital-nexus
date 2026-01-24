export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    instancePath?: string;
  }>;
}

export interface JsonSchemaDefinition {
  schema: Record<string, unknown>;
  example: Record<string, unknown>;
}

export type EntityType = 
  | 'page'
  | 'blog_post'
  | 'service'
  | 'project'
  | 'team_member'
  | 'testimonial'
  | 'site_setting'
  | 'blog_category'
  | 'service_category'
  | 'menu_item'
  | 'page_section';

export interface EntitySchema {
  entityType: EntityType;
  version: string;
  schema: Record<string, unknown>;
  example: Record<string, unknown>;
  description?: string;
}
