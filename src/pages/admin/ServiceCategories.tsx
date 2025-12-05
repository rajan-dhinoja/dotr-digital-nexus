import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { serviceCategorySchema, validateFormData } from '@/lib/validations/admin';
import type { Tables } from '@/integrations/supabase/types';

type ServiceCategory = Tables<'services_categories'>;

export default function AdminServiceCategories() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-service-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('services_categories').select('*').order('display_order');
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (category: Partial<ServiceCategory>) => {
      if (editing) {
        const { error } = await supabase.from('services_categories').update(category).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services_categories').insert(category as any);
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
      const { error } = await supabase.from('services_categories').delete().eq('id', id);
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
    
    const validation = validateFormData(serviceCategorySchema, form, {
      name: (v) => v?.toString() ?? '',
      slug: (v) => v?.toString() ?? '',
      description: (v) => v?.toString() || null,
      display_order: (v) => Number(v) || 0,
    });

    if (!validation.success) {
      toast({ title: 'Validation Error', description: (validation as { success: false; error: string }).error, variant: 'destructive' });
      return;
    }

    saveMutation.mutate((validation as { success: true; data: typeof validation.data }).data);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'display_order', label: 'Order' },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Categories</h1>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        loading={isLoading}
        onEdit={(c) => { setEditing(c); setOpen(true); }}
        onDelete={(c) => deleteMutation.mutate(c.id)}
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
