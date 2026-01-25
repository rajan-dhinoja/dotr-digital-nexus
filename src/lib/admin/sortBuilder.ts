import type { SortConfig } from '@/lib/types/admin';

/**
 * Applies sorting to a Supabase query
 */
export function applySort<T>(
  query: any,
  sortConfig: SortConfig | null | undefined
): any {
  if (!sortConfig) {
    return query;
  }

  return query.order(sortConfig.field, { ascending: sortConfig.direction === 'asc' });
}
