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
import { testimonialSchema, validateFormData } from '@/lib/validations/admin';
import type { Tables } from '@/integrations/supabase/types';

type Testimonial = Tables<'testimonials'>;

export default function AdminTestimonials() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const { data } = await supabase.from('testimonials').select('*').order('display_order');
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (testimonial: Partial<Testimonial>) => {
      if (editing) {
        const { error } = await supabase.from('testimonials').update(testimonial).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials').insert(testimonial as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Testimonial updated' : 'Testimonial added' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      toast({ title: 'Testimonial deleted' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    const validation = validateFormData(testimonialSchema, form, {
      name: (v) => v?.toString() ?? '',
      designation: (v) => v?.toString() || null,
      company: (v) => v?.toString() || null,
      testimonial_text: (v) => v?.toString() ?? '',
      photo_url: (v) => v?.toString() || null,
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
    { key: 'company', label: 'Company' },
    {
      key: 'testimonial_text',
      label: 'Testimonial',
      render: (t: Testimonial) => t.testimonial_text.slice(0, 50) + '...',
    },
    { key: 'display_order', label: 'Order' },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Testimonial
        </Button>
      </div>

      <DataTable
        data={testimonials}
        columns={columns}
        loading={isLoading}
        onEdit={(t) => { setEditing(t); setOpen(true); }}
        onDelete={(t) => deleteMutation.mutate(t.id)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" defaultValue={editing?.name} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input name="designation" defaultValue={editing?.designation ?? ''} maxLength={100} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input name="company" defaultValue={editing?.company ?? ''} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Testimonial</Label>
              <Textarea name="testimonial_text" defaultValue={editing?.testimonial_text} rows={4} required maxLength={2000} />
            </div>
            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input name="photo_url" defaultValue={editing?.photo_url ?? ''} type="url" />
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
