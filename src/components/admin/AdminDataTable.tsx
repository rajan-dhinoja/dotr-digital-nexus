import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ColumnHeader } from './ColumnHeader';
import type { AdminColumn, BaseEntity, SortConfig } from '@/lib/types/admin';

interface AdminDataTableProps<T extends BaseEntity> {
  data: T[];
  columns: AdminColumn<T>[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  sortConfig?: SortConfig | null;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export function AdminDataTable<T extends BaseEntity>({
  data,
  columns,
  selectedIds,
  onSelectionChange,
  sortConfig,
  onSortChange,
  loading = false,
  onEdit,
  onDelete,
  actions,
  emptyMessage = 'No data found',
}: AdminDataTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(data.map((item) => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleSort = (field: string) => {
    if (!onSortChange) return;

    const currentField = sortConfig?.field;
    const currentDirection = sortConfig?.direction;

    if (currentField === field) {
      // Toggle direction
      onSortChange(field, currentDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to asc
      onSortChange(field, 'asc');
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              {columns.map((col) => (
                <TableHead key={String(col.key)}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
              {(onEdit || onDelete || actions) && (
                <TableHead className="w-24">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
                {(onEdit || onDelete || actions) && <TableCell />}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            {columns.map((col) => (
              <TableHead key={String(col.key)} style={{ width: col.width }}>
                <ColumnHeader
                  label={col.label}
                  sortable={col.sortable && !!onSortChange}
                  sortConfig={sortConfig}
                  field={String(col.key)}
                  onSort={handleSort}
                />
              </TableHead>
            ))}
            {(onEdit || onDelete || actions) && (
              <TableHead className="w-24">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <TableRow key={item.id} data-state={isSelected ? 'selected' : undefined}>
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                    aria-label={`Select ${item.id}`}
                  />
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={String(col.key)} style={{ width: col.width }}>
                    {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                  </TableCell>
                ))}
                {(onEdit || onDelete || actions) && (
                  <TableCell>
                    <div className="flex gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {actions && actions(item)}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
