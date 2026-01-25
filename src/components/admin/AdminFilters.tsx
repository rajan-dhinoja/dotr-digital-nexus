import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { FilterConfig } from '@/lib/types/admin';

interface AdminFiltersProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (filterId: string, value: any) => void;
}

export function AdminFilters({ filters, values, onChange }: AdminFiltersProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {filters.map((filter) => {
        const value = values[filter.id] || 'all';

        if (filter.type === 'select') {
          return (
            <div key={filter.id} className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">{filter.label}</Label>
              <Select value={value} onValueChange={(val) => onChange(filter.id, val)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  {filter.queryFn && <DynamicFilterOptions filter={filter} />}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (filter.type === 'multiselect') {
          // For now, treat multiselect as select - can be enhanced later
          return (
            <div key={filter.id} className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">{filter.label}</Label>
              <Select value={value} onValueChange={(val) => onChange(filter.id, val)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  {filter.queryFn && <DynamicFilterOptions filter={filter} />}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (filter.type === 'boolean') {
          return (
            <div key={filter.id} className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">{filter.label}</Label>
              <Select value={value} onValueChange={(val) => onChange(filter.id, val)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

// Component for dynamically loaded filter options
function DynamicFilterOptions({ filter }: { filter: FilterConfig }) {
  const { data: options = [] } = useQuery({
    queryKey: ['filter-options', filter.id],
    queryFn: filter.queryFn!,
    enabled: !!filter.queryFn,
  });

  return (
    <>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </>
  );
}
