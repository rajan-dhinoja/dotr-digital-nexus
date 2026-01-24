import { supabase } from '@/integrations/supabase/client';
import type { EntityType } from '@/types/entitySchema';
import type { Json } from '@/integrations/supabase/types';

interface AuditLogEntry {
  action: 'create' | 'update' | 'delete' | 'import' | 'export';
  entity_type: EntityType | string;
  entity_id?: string;
  entity_name?: string;
  details?: Record<string, unknown>;
}

/**
 * Log JSON-related operations to activity log
 */
export async function logJsonOperation(entry: AuditLogEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('activity_logs').insert({
      user_id: user?.id || null,
      user_email: user?.email || null,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id || null,
      entity_name: entry.entity_name || null,
      details: (entry.details || {}) as Json,
    });
  } catch (error) {
    // Fail silently - audit logging should not break the app
    console.error('Failed to log JSON operation:', error);
  }
}

/**
 * Log JSON import operation
 */
export async function logJsonImport(
  entityType: EntityType,
  importedCount: number,
  failedCount: number
): Promise<void> {
  await logJsonOperation({
    action: 'import',
    entity_type: entityType,
    details: {
      imported_count: importedCount,
      failed_count: failedCount,
    },
  });
}

/**
 * Log JSON export operation
 */
export async function logJsonExport(
  entityType: EntityType,
  exportedCount: number
): Promise<void> {
  await logJsonOperation({
    action: 'export',
    entity_type: entityType,
    details: {
      exported_count: exportedCount,
    },
  });
}

/**
 * Log JSON edit operation
 */
export async function logJsonEdit(
  entityType: EntityType,
  entityId: string,
  entityName?: string,
  changes?: Record<string, unknown>
): Promise<void> {
  await logJsonOperation({
    action: 'update',
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    details: {
      edited_via_json: true,
      changes,
    },
  });
}
