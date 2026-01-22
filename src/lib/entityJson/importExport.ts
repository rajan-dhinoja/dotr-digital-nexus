import type { EntityType } from '@/types/entitySchema';

export interface ExportData {
  version: string;
  exported_at: string;
  entity_type: EntityType;
  entities: Array<{
    id?: string;
    [key: string]: unknown;
  }>;
}

/**
 * Export a single entity as JSON
 */
export function exportEntity(
  entityType: EntityType,
  entity: Record<string, unknown>,
  entityId?: string
): void {
  const exportData: ExportData = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    entity_type: entityType,
    entities: [{
      ...(entityId && { id: entityId }),
      ...entity,
    }],
  };

  const formatted = JSON.stringify(exportData, null, 2);
  const blob = new Blob([formatted], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const name = entity.name || entity.title || entityType;
  const id = entityId ? `-${entityId.slice(0, 8)}` : '';
  link.download = `${entityType}-${name}${id}-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export multiple entities as JSON
 */
export function exportEntities(
  entityType: EntityType,
  entities: Array<Record<string, unknown>>
): void {
  const exportData: ExportData = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    entity_type: entityType,
    entities: entities.map((entity) => ({
      ...entity,
    })),
  };

  const formatted = JSON.stringify(exportData, null, 2);
  const blob = new Blob([formatted], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${entityType}-bulk-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse import file and validate structure
 */
export function parseImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as ExportData;
        
        // Validate structure
        if (!parsed.version || !parsed.entity_type || !Array.isArray(parsed.entities)) {
          reject(new Error('Invalid import file format. Expected version, entity_type, and entities array.'));
          return;
        }
        
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Validate import data matches expected entity type
 */
export function validateImportData(
  data: ExportData,
  expectedEntityType: EntityType
): { valid: boolean; error?: string } {
  if (data.entity_type !== expectedEntityType) {
    return {
      valid: false,
      error: `Entity type mismatch. Expected ${expectedEntityType}, got ${data.entity_type}`,
    };
  }
  
  if (!data.entities || data.entities.length === 0) {
    return {
      valid: false,
      error: 'Import file contains no entities',
    };
  }
  
  return { valid: true };
}
