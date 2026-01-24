import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { exportEntity, exportEntities, parseImportFile, validateImportData } from '@/lib/entityJson/importExport';
import { logJsonImport, logJsonExport } from '@/lib/entityJson/audit';
import type { EntityType } from '@/types/entitySchema';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface UseEntityImportExportOptions {
  entityType: EntityType;
  tableName: string;
  queryKey: string[];
}

export function useEntityImportExport({
  entityType,
  tableName,
  queryKey,
}: UseEntityImportExportOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const exportSingle = useCallback(async (entity: Record<string, unknown>, entityId?: string) => {
    try {
      exportEntity(entityType, entity, entityId);
      await logJsonExport(entityType, 1);
      toast({ title: 'Entity exported', description: 'JSON file downloaded' });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export entity',
        variant: 'destructive',
      });
    }
  }, [entityType, toast]);

  const exportBulk = useCallback(async (entities: Array<Record<string, unknown>>) => {
    try {
      exportEntities(entityType, entities);
      await logJsonExport(entityType, entities.length);
      toast({ title: 'Entities exported', description: `${entities.length} entities exported` });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export entities',
        variant: 'destructive',
      });
    }
  }, [entityType, toast]);

  const importFromFile = useCallback(async (file: File, options?: {
    onConflict?: 'skip' | 'overwrite' | 'merge';
    createNew?: boolean;
  }) => {
    try {
      const importData = await parseImportFile(file);
      const validation = validateImportData(importData, entityType);
      
      if (!validation.valid) {
        toast({
          title: 'Import failed',
          description: validation.error,
          variant: 'destructive',
        });
        return { success: false, imported: 0, failed: 0 };
      }

      const { onConflict = 'overwrite', createNew = true } = options || {};
      let successCount = 0;
      let errorCount = 0;

      for (const entity of importData.entities) {
        try {
          const { id, ...entityData } = entity;
          
          if (id) {
            // Check if entity exists - use dynamic table access with proper await
            const { data: existing } = await supabase
              .from(tableName as 'pages')
              .select('id')
              .eq('id', id as string)
              .maybeSingle();

            if (existing) {
              if (onConflict === 'skip') {
                continue;
              } else if (onConflict === 'overwrite') {
                await supabase
                  .from(tableName as 'pages')
                  .update(entityData as Record<string, unknown>)
                  .eq('id', id as string);
              } else if (onConflict === 'merge') {
                const { data: current } = await supabase
                  .from(tableName as 'pages')
                  .select('*')
                  .eq('id', id as string)
                  .single();
                
                if (current) {
                  const merged = { ...current, ...entityData };
                  await supabase
                    .from(tableName as 'pages')
                    .update(merged as Record<string, unknown>)
                    .eq('id', id as string);
                }
              }
            } else if (createNew) {
              await supabase
                .from(tableName as 'pages')
                .insert({ ...entityData, id } as never);
            }
          } else if (createNew) {
            // Create new entity
            await supabase
              .from(tableName as 'pages')
              .insert(entityData as never);
          }
          
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to import entity:`, error);
        }
      }

      queryClient.invalidateQueries({ queryKey });
      
      // Log import operation
      await logJsonImport(entityType, successCount, errorCount);
      
      toast({
        title: 'Import completed',
        description: `${successCount} imported, ${errorCount} failed`,
        variant: errorCount > 0 ? 'destructive' : 'default',
      });

      return { success: true, imported: successCount, failed: errorCount };
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import entities',
        variant: 'destructive',
      });
      return { success: false, imported: 0, failed: 0 };
    }
  }, [entityType, tableName, queryKey, queryClient, toast]);

  return {
    exportSingle,
    exportBulk,
    importFromFile,
  };
}
