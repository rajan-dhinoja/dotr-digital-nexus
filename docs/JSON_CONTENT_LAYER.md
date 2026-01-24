# JSON Content Layer - Platform Documentation

## Overview

The JSON Content Layer is a unified system that enables JSON-based editing, import/export, and validation across all admin entities. This system provides a consistent interface for content management, enabling faster content entry, bulk operations, and AI-generated content.

## Architecture

### Core Components

1. **EntityJsonEditor** (`src/components/admin/EntityJsonEditor.tsx`)
   - Generic JSON editor component for all entities
   - Features: Monaco editor, live validation, import/export, schema examples
   - Extends the pattern from `SectionJsonEditor`

2. **Schema Registry** (`src/lib/entitySchemas/`)
   - Code-based schema definitions for all entities
   - Reusable schema blocks (SEO, media, CTA, metadata, social links, contact)
   - Type-safe schema definitions using JSON Schema (AJV)

3. **Validation System** (`src/lib/entityJson/validators.ts`)
   - Client-side validation using AJV
   - Real-time error highlighting
   - Schema-based validation

4. **Import/Export Utilities** (`src/lib/entityJson/importExport.ts`)
   - Single entity export
   - Bulk entity export
   - Import with conflict resolution
   - Standardized export format

5. **Audit Logging** (`src/lib/entityJson/audit.ts`)
   - Logs all JSON operations to activity_logs
   - Tracks imports, exports, and edits

### Hooks

- **useEntityFormSync** - Bidirectional form/JSON synchronization
- **useEntitySchema** - Load entity schemas
- **useEntityImportExport** - Import/export operations with audit logging

## Supported Entities

All major admin entities support JSON editing:

- ✅ Pages
- ✅ Blog Posts
- ✅ Services (with import/export)
- ✅ Projects
- ✅ Team Members
- ✅ Testimonials
- ✅ Site Settings

## Page section animation (`content.animation`)

Page Builder sections support optional animation config via `content.animation` (stored in `page_sections.content` JSONB). Configurable in the section edit form (Animation card) or via JSON.

**Shape:**

```json
{
  "animation": {
    "enabled": true,
    "preset": "subtle",
    "stagger": true
  }
}
```

- **`enabled`** (boolean, default `true`): Enable/disable entrance animation for the section.
- **`preset`** (`"subtle"` | `"smooth"` | `"scale"` | `"none"`, default `"subtle"`): Animation style. `"none"` disables entrance.
- **`stagger`** (boolean, default `true`): Whether to stagger child animations where applicable.

Form sections always use `enabled: false` and `preset: "none"`. Safe defaults apply when `animation` is omitted.

**Accessibility:** Entrance animations respect `prefers-reduced-motion: reduce` (disabled when set). Content is always visible on first paint; animations are optional enhancement. Above-the-fold sections use emphasis-only or no entrance.

## Usage

### Adding JSON Editing to a New Entity

1. **Add Schema Definition**
   ```typescript
   // In src/lib/entitySchemas/index.ts
   const myEntitySchema: JSONSchemaType<{...}> = {
     type: 'object',
     properties: { ... },
   };
   
   entitySchemas.set('my_entity', {
     entityType: 'my_entity',
     version: '1.0',
     schema: myEntitySchema,
     example: { ... },
   });
   ```

2. **Add JSON Tab to Entity Edit Dialog**
   ```typescript
   import { EntityJsonEditor } from '@/components/admin/EntityJsonEditor';
   
   // Add state
   const [activeTab, setActiveTab] = useState('form');
   const [jsonIsValid, setJsonIsValid] = useState(true);
   const [jsonData, setJsonData] = useState<Record<string, unknown>>({});
   
   // Add tab
   <Tabs value={activeTab} onValueChange={setActiveTab}>
     <TabsList>
       <TabsTrigger value="form">Form</TabsTrigger>
       <TabsTrigger value="json">JSON</TabsTrigger>
     </TabsList>
     
     <TabsContent value="json">
       <EntityJsonEditor
         entityType="my_entity"
         entityId={editing?.id}
         value={jsonData}
         onChange={setJsonData}
         onValidationChange={setJsonIsValid}
       />
     </TabsContent>
   </Tabs>
   ```

3. **Handle JSON Data in Submit**
   ```typescript
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     
     if (activeTab === 'json' && !jsonIsValid) {
       toast({ title: 'Validation Error', ... });
       return;
     }
     
     const data = activeTab === 'json' 
       ? jsonData 
       : formData;
     
     saveMutation.mutate(data);
   };
   ```

### Import/Export

**Single Entity Export:**
```typescript
const { exportSingle } = useEntityImportExport({
  entityType: 'service',
  tableName: 'services',
  queryKey: ['admin-services'],
});

exportSingle(entityData, entityId);
```

**Bulk Export:**
```typescript
const { exportBulk } = useEntityImportExport({...});
exportBulk(entitiesArray);
```

**Import:**
```typescript
const { importFromFile } = useEntityImportExport({...});

const handleImport = async (file: File) => {
  await importFromFile(file, {
    onConflict: 'overwrite', // 'skip' | 'overwrite' | 'merge'
    createNew: true,
  });
};
```

## Export Format

All exports follow this structure:

```json
{
  "version": "1.0",
  "exported_at": "2024-01-15T10:00:00Z",
  "entity_type": "service",
  "entities": [
    {
      "id": "uuid-optional",
      "name": "...",
      "data": { ... }
    }
  ]
}
```

## Schema Blocks

Reusable schema blocks are available in `src/lib/entitySchemas/blocks/`:

- **seo.ts** - SEO metadata (meta_title, meta_description, OG tags)
- **media.ts** - Media fields (image_url, video_url, etc.)
- **cta.ts** - Call-to-action buttons
- **metadata.ts** - Display order, featured flags, tags
- **socialLinks.ts** - Social media URLs
- **contact.ts** - Contact information

## Validation

Validation happens at multiple levels:

1. **Client-side** - Real-time validation in JSON editor
2. **Pre-save** - Validation before database write
3. **Database** - JSONB constraints (if configured)

Validation errors are displayed inline in the JSON editor with:
- Error path
- Error message
- Line highlighting in Monaco editor

## Audit Logging

All JSON operations are logged to `activity_logs`:

- JSON edits (with change details)
- Imports (with counts)
- Exports (with counts)

Logs include:
- User ID and email
- Action type
- Entity type and ID
- Timestamp
- Additional details (JSON)

## Best Practices

1. **Always validate before save** - Check `jsonIsValid` before submitting
2. **Use schemas** - Define schemas for all entities for better validation
3. **Handle conflicts** - Use appropriate conflict resolution strategy for imports
4. **Export before major changes** - Encourage users to export before bulk edits
5. **Test imports** - Always test import files in a safe environment first

## Troubleshooting

### JSON validation errors
- Check schema definition matches data structure
- Verify required fields are present
- Check data types match schema expectations

### Import failures
- Verify export file format matches expected structure
- Check entity type matches
- Review conflict resolution settings
- Check database constraints

### Sync issues
- Ensure form and JSON tabs are properly synchronized
- Check that onChange handlers are called correctly
- Verify state management is correct

## Future Enhancements

- Schema versioning and migration
- Advanced conflict resolution UI
- JSON diff viewer
- Schema-aware autocomplete in editor
- Bulk operations UI
- Template system for common JSON structures
