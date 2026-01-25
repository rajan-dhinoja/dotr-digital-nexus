import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLog } from './useActivityLog';
import type { UseBulkActionsOptions, UseBulkActionsResult, BulkActionResult } from '@/lib/types/admin';

const BATCH_SIZE = 50; // Process in batches to avoid overwhelming the database

/**
 * Hook for bulk operations (delete, update) on admin entities
 */
export function useBulkActions(options: UseBulkActionsOptions): UseBulkActionsResult {
  const { tableName, queryKey, onSuccess, onError } = options;
  const queryClient = useQueryClient();
  const { logActivity } = useActivityLog();
  const [isPending, setIsPending] = useState(false);

  /**
   * Bulk delete items by IDs
   */
  const bulkDelete = async (ids: string[]): Promise<BulkActionResult> => {
    if (ids.length === 0) {
      return { success: 0, failed: 0 };
    }

    setIsPending(true);
    let successCount = 0;
    let failedCount = 0;
    const failedIds: string[] = [];

    try {
      // Process in batches
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        
        const { error } = await (supabase.from as any)(tableName)
          .delete()
          .in('id', batch);

        if (error) {
          // If batch fails, try individual deletes to identify which ones failed
          for (const id of batch) {
            const { error: individualError } = await (supabase.from as any)(tableName)
              .delete()
              .eq('id', id);

            if (individualError) {
              failedCount++;
              failedIds.push(id);
            } else {
              successCount++;
            }
          }
        } else {
          successCount += batch.length;
        }
      }

      // Log activity
      if (successCount > 0) {
        await logActivity({
          action: 'bulk_delete',
          entity_type: tableName,
          entity_name: `${successCount} items`,
          details: { count: successCount, table: tableName },
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey });

      onSuccess?.('delete', successCount);

      return {
        success: successCount,
        failed: failedCount,
        failedIds: failedIds.length > 0 ? failedIds : undefined,
      };
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  /**
   * Bulk update items by IDs
   */
  const bulkUpdate = async (
    ids: string[],
    updates: Record<string, any>
  ): Promise<BulkActionResult> => {
    if (ids.length === 0) {
      return { success: 0, failed: 0 };
    }

    setIsPending(true);
    let successCount = 0;
    let failedCount = 0;
    const failedIds: string[] = [];

    try {
      // Process in batches
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        
        const { error } = await (supabase.from as any)(tableName)
          .update(updates)
          .in('id', batch);

        if (error) {
          // If batch fails, try individual updates
          for (const id of batch) {
            const { error: individualError } = await (supabase.from as any)(tableName)
              .update(updates)
              .eq('id', id);

            if (individualError) {
              failedCount++;
              failedIds.push(id);
            } else {
              successCount++;
            }
          }
        } else {
          successCount += batch.length;
        }
      }

      // Log activity
      if (successCount > 0) {
        await logActivity({
          action: 'bulk_update',
          entity_type: tableName,
          entity_name: `${successCount} items`,
          details: { count: successCount, updates, table: tableName },
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey });

      onSuccess?.('update', successCount);

      return {
        success: successCount,
        failed: failedCount,
        failedIds: failedIds.length > 0 ? failedIds : undefined,
      };
    } catch (error) {
      const err = error as Error;
      onError?.(err);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    bulkDelete,
    bulkUpdate,
    isPending,
  };
}
