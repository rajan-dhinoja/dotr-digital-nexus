import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SortConfig } from '@/lib/types/admin';

interface ColumnHeaderProps {
  label: string;
  sortable?: boolean;
  sortConfig?: SortConfig | null;
  field: string;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export function ColumnHeader({
  label,
  sortable = false,
  sortConfig,
  field,
  onSort,
  className,
}: ColumnHeaderProps) {
  if (!sortable || !onSort) {
    return <div className={cn('font-medium', className)}>{label}</div>;
  }

  const isActive = sortConfig?.field === field;
  const direction = isActive ? sortConfig.direction : undefined;

  const handleClick = () => {
    if (!isActive) {
      onSort(field, 'asc');
    } else if (direction === 'asc') {
      onSort(field, 'desc');
    } else {
      onSort(field, 'asc');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'h-8 -ml-3 hover:bg-transparent',
        isActive && 'text-foreground',
        className
      )}
      onClick={handleClick}
    >
      <span className="font-medium">{label}</span>
      {isActive ? (
        direction === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
}
