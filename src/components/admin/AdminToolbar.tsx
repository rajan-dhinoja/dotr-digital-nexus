import { Search, Plus, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdminFilters } from './AdminFilters';
import type { FilterConfig, BulkActionConfig } from '@/lib/types/admin';

interface AdminToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterConfig[];
  filterValues: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  selectedCount: number;
  onBulkDelete?: () => void;
  onAddNew?: () => void;
  bulkActions?: BulkActionConfig[];
  addButtonLabel?: string;
  onClearFilters?: () => void;
}

export function AdminToolbar({
  searchQuery,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  selectedCount,
  onBulkDelete,
  onAddNew,
  bulkActions = [],
  addButtonLabel = 'Add New',
  onClearFilters,
}: AdminToolbarProps) {
  const hasActiveFilters = Object.values(filterValues).some(
    (v) => v !== null && v !== undefined && v !== '' && v !== 'all'
  );

  return (
    <div className="space-y-4">
      {/* Top row: Search and Add button */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            {addButtonLabel}
          </Button>
        )}
      </div>

      {/* Filters row */}
      {filters.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          <AdminFilters
            filters={filters}
            values={filterValues}
            onChange={onFilterChange}
          />
          {hasActiveFilters && onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-9"
            >
              <X className="h-4 w-4 mr-2" />
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Bulk actions row */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
          <span className="text-sm text-muted-foreground">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex gap-2">
            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            )}
            {bulkActions.map((action) => {
              if (action.action === 'delete' && !onBulkDelete) {
                // Skip if delete is already shown
                return null;
              }
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => action.handler?.([])} // IDs should be passed from parent
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
