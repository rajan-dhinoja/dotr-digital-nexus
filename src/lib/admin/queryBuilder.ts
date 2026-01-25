import type { QueryBuilderOptions, SortConfig } from '@/lib/types/admin';
import { applySort } from './sortBuilder';
import { applyFilters } from './filterBuilder';

/**
 * Builds a Supabase query with search, sort, filter, and pagination
 */
export function buildListQuery<T>(
  query: any,
  options: QueryBuilderOptions
): any {
  let builtQuery: any = query;

  // Apply search across multiple fields
  if (options.search && options.search.trim() && options.searchFields && options.searchFields.length > 0) {
    const searchTerm = options.search.trim();
    // Use OR conditions for multiple search fields
    // Format: "(field1.ilike.%value%,field2.ilike.%value%)"
    if (options.searchFields.length === 1) {
      // Single field - use simple ilike
      builtQuery = builtQuery.ilike(options.searchFields[0], `%${searchTerm}%`);
    } else {
      // Multiple fields - use OR
      // Supabase OR format: "field1.ilike.%value%,field2.ilike.%value%"
      const orConditions = options.searchFields
        .map((field) => `${field}.ilike.%${searchTerm}%`)
        .join(',');
      builtQuery = builtQuery.or(orConditions);
    }
  }

  // Apply filters
  if (options.filters) {
    builtQuery = applyFilters(builtQuery, options.filters);
  }

  // Apply sorting
  if (options.sort) {
    builtQuery = applySort(builtQuery, options.sort);
  }

  // Apply pagination
  if (options.pageSize) {
    const page = options.page || 1;
    const from = (page - 1) * options.pageSize;
    const to = from + options.pageSize - 1;
    builtQuery = builtQuery.range(from, to);
  }

  return builtQuery;
}

/**
 * Builds a count query for pagination
 */
export function buildCountQuery<T>(
  query: any,
  options: Omit<QueryBuilderOptions, 'sort' | 'page' | 'pageSize'>
): any {
  let builtQuery: any = query.select('*', { count: 'exact', head: true });

  // Apply search
  if (options.search && options.search.trim() && options.searchFields && options.searchFields.length > 0) {
    const searchTerm = options.search.trim();
    if (options.searchFields.length === 1) {
      builtQuery = builtQuery.ilike(options.searchFields[0], `%${searchTerm}%`);
    } else {
      const orConditions = options.searchFields
        .map((field) => `${field}.ilike.%${searchTerm}%`)
        .join(',');
      builtQuery = builtQuery.or(orConditions);
    }
  }

  // Apply filters
  if (options.filters) {
    builtQuery = applyFilters(builtQuery, options.filters);
  }

  return builtQuery;
}
