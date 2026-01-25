import type { ReactNode } from 'react';

// Base entity type - all admin entities must have an id
export interface BaseEntity {
  id: string;
}

// Sort configuration
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Column configuration for AdminDataTable
export interface AdminColumn<T extends BaseEntity> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Sortable field configuration
export interface SortableField {
  key: string;
  label: string;
  defaultDirection?: 'asc' | 'desc';
}

// Filter option
export interface FilterOption {
  value: string;
  label: string;
}

// Filter configuration
export interface FilterConfig {
  id: string;
  type: 'select' | 'multiselect' | 'date-range' | 'boolean';
  label: string;
  field: string;
  options?: FilterOption[];
  queryFn?: () => Promise<FilterOption[]>;
  placeholder?: string;
}

// Bulk action configuration
export interface BulkActionConfig {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  action: 'delete' | 'status-update' | 'custom';
  requiresConfirmation?: boolean;
  handler?: (ids: string[]) => Promise<{ success: number; failed: number }>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

// Admin module configuration
export interface AdminModuleConfig {
  id: string;
  tableName: string;
  displayName: string;
  searchFields: string[];
  sortableFields: SortableField[];
  filters: FilterConfig[];
  columns: AdminColumnConfig[];
  bulkActions?: BulkActionConfig[];
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  defaultFilters?: Record<string, any>;
  pageSize?: number;
}

// Column configuration for module config
export interface AdminColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  render?: 'status-badge' | 'date' | 'boolean' | 'custom';
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Query builder options
export interface QueryBuilderOptions {
  search?: string;
  searchFields?: string[];
  sort?: SortConfig;
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
}

// Bulk action result
export interface BulkActionResult {
  success: number;
  failed: number;
  failedIds?: string[];
}

// Admin list hook options
export interface UseAdminListOptions<T extends BaseEntity> {
  tableName: string;
  queryKey: string[];
  columns?: string;
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  defaultFilters?: Record<string, any>;
  pageSize?: number;
  enabled?: boolean;
  searchFields?: string[];
}

// Admin list hook result
export interface UseAdminListResult<T extends BaseEntity> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortConfig: SortConfig | null;
  setSortConfig: (config: SortConfig | null) => void;
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  refetch: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

// Bulk actions hook options
export interface UseBulkActionsOptions {
  tableName: string;
  queryKey: string[];
  onSuccess?: (action: string, count: number) => void;
  onError?: (error: Error) => void;
}

// Bulk actions hook result
export interface UseBulkActionsResult {
  bulkDelete: (ids: string[]) => Promise<BulkActionResult>;
  bulkUpdate: (ids: string[], updates: Record<string, any>) => Promise<BulkActionResult>;
  isPending: boolean;
}
