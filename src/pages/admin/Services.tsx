import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { serviceSchema, validateFormData } from '@/lib/validations/admin';
import type { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;
type Category = Tables<'services_categories'>;

export default function AdminServices() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data } = await supabase.from('services').select('*').order('display_order');
      return data ?? [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('services_categories').select('*').order('display_order');
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (service: Partial<Service>) => {
      if (editing) {
        const { error } = await supabase.from('services').update(service).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert(service as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Service updated' : 'Service created' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({ title: 'Service deleted' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    const validation = validateFormData(serviceSchema, form, {
      title: (v) => v?.toString() ?? '',
      slug: (v) => v?.toString() ?? '',
      category_id: (v) => v?.toString() ?? '',
      short_summary: (v) => v?.toString() || null,
      description: (v) => v?.toString() || null,
      image_url: (v) => v?.toString() || null,
      display_order: (v) => Number(v) || 0,
    });

    if (!validation.success) {
      toast({ title: 'Validation Error', description: (validation as { success: false; error: string }).error, variant: 'destructive' });
      return;
    }

    saveMutation.mutate((validation as { success: true; data: typeof validation.data }).data);
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'category_id',
      label: 'Category',
      render: (s: Service) => categories.find(c => c.id === s.category_id)?.name ?? '-',
    },
    { key: 'display_order', label: 'Order' },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Service
        </Button>
      </div>

      <DataTable
        data={services}
        columns={columns}
        loading={isLoading}
        onEdit={(s) => { setEditing(s); setOpen(true); }}
        onDelete={(s) => deleteMutation.mutate(s.id)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input name="title" defaultValue={editing?.title} required maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input name="slug" defaultValue={editing?.slug} required maxLength={100} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select name="category_id" defaultValue={editing?.category_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Short Summary</Label>
              <Input name="short_summary" defaultValue={editing?.short_summary ?? ''} maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" defaultValue={editing?.description ?? ''} rows={4} maxLength={10000} />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload
                bucket="service-images"
                value={editing?.image_url ?? undefined}
                onChange={(url) => {
                  const input = document.querySelector<HTMLInputElement>('input[name="image_url"]');
                  if (input) input.value = url ?? '';
                }}
              />
              <input type="hidden" name="image_url" defaultValue={editing?.image_url ?? ''} />
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
