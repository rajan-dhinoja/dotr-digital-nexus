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
import { useActivityLog } from '@/hooks/useActivityLog';
import { Plus } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type BlogCategory = Tables<'blog_categories'>;

export default function AdminBlogCategories() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogCategory | null>(null);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-blog-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_categories').select('*').order('name');
      return data ?? [];
    },
  });

  // Get post counts for each category
  const { data: postCounts = {} } = useQuery({
    queryKey: ['blog-category-counts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_post_categories')
        .select('category_id');
      
      const counts: Record<string, number> = {};
      (data || []).forEach((item) => {
        counts[item.category_id] = (counts[item.category_id] || 0) + 1;
      });
      return counts;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (category: Partial<BlogCategory>) => {
      if (editing) {
        const { error } = await supabase.from('blog_categories').update(category).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_categories').insert(category as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] });
      logActivity({
        action: editing ? 'update' : 'create',
        entity_type: 'blog_category',
        entity_id: editing?.id,
        entity_name: editing?.name,
      });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Category updated' : 'Category created' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] });
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

    const data: Partial<BlogCategory> = {
      name,
      slug,
      description: form.get('description')?.toString() || null,
    };

    saveMutation.mutate(data);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { 
      key: 'posts', 
      label: 'Posts',
      render: (c: BlogCategory) => postCounts[c.id] || 0,
    },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Categories</h1>
          <p className="text-muted-foreground">Organize your blog posts into categories</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        loading={isLoading}
        onEdit={(c) => { setEditing(c); setOpen(true); }}
        onDelete={(c) => {
          if (postCounts[c.id] > 0) {
            toast({ 
              title: 'Cannot Delete', 
              description: 'Remove all posts from this category first', 
              variant: 'destructive' 
            });
            return;
          }
          deleteMutation.mutate(c.id);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input name="name" defaultValue={editing?.name} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input name="slug" defaultValue={editing?.slug} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" defaultValue={editing?.description ?? ''} rows={3} maxLength={500} />
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
