import type { PostgrestQueryBuilder } from '@supabase/supabase-js';
import type { SortConfig } from '@/lib/types/admin';

/**
 * Applies sorting to a Supabase query
 */
export function applySort<T>(
  query: PostgrestQueryBuilder<any, any, any, any>,
  sortConfig: SortConfig | null | undefined
): PostgrestQueryBuilder<any, any, any, any> {
  if (!sortConfig) {
    return query;
  }

  return query.order(sortConfig.field, { ascending: sortConfig.direction === 'asc' });
}
