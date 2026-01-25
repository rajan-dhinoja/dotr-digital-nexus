import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminToolbar } from '@/components/admin/AdminToolbar';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { BulkDeleteDialog } from '@/components/admin/BulkDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAdminList } from '@/hooks/useAdminList';
import { useBulkActions } from '@/hooks/useBulkActions';
import { getModuleConfig } from '@/config/adminModules';
import type { Tables } from '@/integrations/supabase/types';

type ServiceCategory = Tables<'service_categories'>;

export default function AdminServiceCategories() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const moduleConfig = getModuleConfig('service-categories');
  const {
    data: categories = [],
    isLoading,
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
    filters,
    setFilter,
    clearFilters,
    page,
    totalPages,
    totalCount,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
  } = useAdminList<ServiceCategory>({
    tableName: 'service_categories',
    queryKey: ['admin-service-categories'],
    searchFields: moduleConfig?.searchFields || ['name', 'slug'],
    defaultSort: moduleConfig?.defaultSort,
    pageSize: moduleConfig?.pageSize || 20,
  });

  const { bulkDelete, isPending: isBulkDeleting } = useBulkActions({
    tableName: 'service_categories',
    queryKey: ['admin-service-categories'],
    onSuccess: (action, count) => {
      toast({ title: `Deleted ${count} categories` });
      setSelectedIds([]);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (category: Partial<ServiceCategory>) => {
      if (editing) {
        const { error } = await supabase.from('service_categories').update(category).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('service_categories').insert(category as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-categories'] });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Category updated' : 'Category created' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-categories'] });
      toast({ title: 'Category deleted' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    const name = form.get('name')?.toString() ?? '';
    const slug = form.get('slug')?.toString() ?? '';

    if (!name || !slug) {
      toast({ title: 'Validation Error', description: 'Name and slug are required', variant: 'destructive' });
      return;
    }

    const data: Partial<ServiceCategory> = {
      name,
      slug,
      description: form.get('description')?.toString() || null,
      icon: form.get('icon')?.toString() || null,
      display_order: Number(form.get('display_order')) || 0,
    };

    saveMutation.mutate(data);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await bulkDelete(selectedIds);
    setBulkDeleteOpen(false);
    if (result.failed > 0) {
      toast({
        title: 'Some deletions failed',
        description: `${result.success} deleted, ${result.failed} failed`,
        variant: 'destructive',
      });
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'slug', label: 'Slug' },
    { key: 'display_order', label: 'Order', sortable: true },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Service Categories</h1>
      </div>

      <AdminToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={moduleConfig?.filters || []}
        filterValues={filters}
        onFilterChange={setFilter}
        selectedCount={selectedIds.length}
        onBulkDelete={() => setBulkDeleteOpen(true)}
        onAddNew={() => { setEditing(null); setOpen(true); }}
        addButtonLabel="Add Category"
        onClearFilters={clearFilters}
      />

      <div className="mt-6">
        <AdminDataTable
          data={categories}
          columns={columns}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          sortConfig={sortConfig}
          onSortChange={(field, direction) => setSortConfig({ field, direction })}
          loading={isLoading}
          onEdit={(c) => { setEditing(c); setOpen(true); }}
          onDelete={(c) => deleteMutation.mutate(c.id)}
          emptyMessage="No categories found"
        />
        {totalPages > 1 && (
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={goToPage}
            onPrevious={previousPage}
            onNext={nextPage}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
          />
        )}
      </div>

      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        count={selectedIds.length}
        onConfirm={handleBulkDelete}
        isLoading={isBulkDeleting}
        itemName="categories"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input name="name" defaultValue={editing?.name} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input name="slug" defaultValue={editing?.slug} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Input name="icon" defaultValue={editing?.icon ?? ''} maxLength={50} placeholder="e.g., Palette, Code" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" defaultValue={editing?.description ?? ''} rows={3} maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input name="display_order" type="number" defaultValue={editing?.display_order ?? 0} min={0} max={9999} />
            </div>
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}