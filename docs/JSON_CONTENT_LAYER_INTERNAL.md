# JSON Content Layer - Internal Standards Guide

## For Developers

### Adding JSON Support to a New Entity

#### Step 1: Define Schema

Create or update schema in `src/lib/entitySchemas/index.ts`:

```typescript
import { mergeSchemas } from './index';
import { seoSchema, seoExample } from './blocks/seo';

const myEntitySchema: JSONSchemaType<{
  title?: string;
  description?: string;
  // ... other fields
}> = mergeSchemas(seoSchema, {
  type: 'object',
  properties: {
    title: { type: 'string', nullable: true },
    description: { type: 'string', nullable: true },
    // ... other properties
  },
  additionalProperties: true,
});

entitySchemas.set('my_entity', {
  entityType: 'my_entity',
  version: '1.0',
  schema: myEntitySchema,
  example: mergeExamples(seoExample, {
    title: 'Example Title',
    description: 'Example description',
  }),
  description: 'My entity description',
});
```

#### Step 2: Update Entity Type

Add to `EntityType` union in `src/types/entitySchema.ts`:

```typescript
export type EntityType = 
  | 'page'
  | 'blog_post'
  | 'service'
  | 'project'
  | 'team_member'
  | 'testimonial'
  | 'site_setting'
  | 'my_entity'; // Add here
```

#### Step 3: Add JSON Tab to Admin Page

1. Import `EntityJsonEditor`
2. Add state for JSON data and validation
3. Add JSON tab to Tabs component
4. Handle JSON data in submit handler

See `src/pages/admin/Services.tsx` for complete example.

#### Step 4: Add Import/Export (Optional)

```typescript
import { useEntityImportExport } from '@/hooks/useEntityImportExport';

const { exportSingle, exportBulk, importFromFile } = useEntityImportExport({
  entityType: 'my_entity',
  tableName: 'my_entities',
  queryKey: ['admin-my-entities'],
});
```

### Schema Design Guidelines

1. **Use nullable fields** - Most fields should be nullable unless truly required
2. **Leverage schema blocks** - Reuse existing blocks (SEO, media, etc.)
3. **Provide examples** - Always include realistic example data
4. **Document fields** - Add descriptions to schemas
5. **Version schemas** - Include version number for future migrations

### Validation Best Practices

1. **Client-side first** - Validate in editor before save
2. **Clear error messages** - Make errors actionable
3. **Graceful degradation** - Handle validation failures without breaking UI
4. **Type safety** - Use TypeScript types alongside JSON Schema

### Import/Export Guidelines

1. **Standard format** - Always use the standard export format
2. **Include metadata** - Version, timestamp, entity type
3. **Handle relationships** - Include IDs for foreign keys
4. **Conflict resolution** - Provide clear options (skip, overwrite, merge)
5. **Error handling** - Report partial failures clearly

### Testing Checklist

- [ ] JSON editor loads correctly
- [ ] Schema validation works
- [ ] Form ↔ JSON sync works
- [ ] Save from JSON tab works
- [ ] Import/export works
- [ ] Error handling works
- [ ] Audit logging works
- [ ] Edge cases handled (empty data, invalid JSON, etc.)

### Performance Considerations

1. **Debounce validation** - Don't validate on every keystroke
2. **Lazy load schemas** - Load schemas only when needed
3. **Optimize large JSON** - Consider pagination for very large entities
4. **Cache schemas** - Cache schema definitions to avoid re-parsing

### Security Considerations

1. **Validate on server** - Don't trust client-side validation alone
2. **Sanitize imports** - Validate imported data before saving
3. **Audit all changes** - Log all JSON operations
4. **Role-based access** - Restrict JSON editing to appropriate roles

## Code Examples

### Complete Entity Integration

See `src/pages/admin/Services.tsx` for a complete example including:
- JSON tab integration
- Form/JSON sync
- Import/export
- Validation handling
- Error handling

### Custom Schema Block

```typescript
// src/lib/entitySchemas/blocks/myBlock.ts
import type { JSONSchemaType } from 'ajv';

export const myBlockSchema: JSONSchemaType<{
  field1?: string;
  field2?: number;
}> = {
  type: 'object',
  properties: {
    field1: { type: 'string', nullable: true },
    field2: { type: 'number', nullable: true },
  },
  additionalProperties: false,
};

export const myBlockExample = {
  field1: 'Example value',
  field2: 42,
};
```

## Migration Guide

When migrating existing entities to JSON:

1. **Add JSONB column** (if needed) - Keep existing columns for backward compatibility
2. **Dual-write phase** - Write to both old and new fields
3. **Migration script** - Migrate existing data to JSONB
4. **Read from JSONB** - Update read logic to prefer JSONB
5. **Remove old columns** - After full migration (future)

## Common Patterns

### Handling Arrays in JSON

```typescript
features: {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
    },
    required: ['title', 'description'],
  },
  nullable: true,
}
```

### Handling Relationships

Store relationship IDs in JSON:
```json
{
  "category_id": "uuid-here",
  "author_id": "uuid-here"
}
```

Resolve relationships during import/export.

### Partial Updates

Support partial JSON updates by merging:
```typescript
const merged = { ...existingData, ...jsonUpdates };
```

## Troubleshooting

### Schema not found
- Check entity type is registered in schema registry
- Verify EntityType includes the entity
- Check schema file is imported

### Validation always fails
- Check schema definition matches data structure
- Verify AJV is properly configured
- Check for type mismatches

### Import doesn't work
- Verify export file format
- Check entity type matches
- Review conflict resolution logic
- Check database constraints
