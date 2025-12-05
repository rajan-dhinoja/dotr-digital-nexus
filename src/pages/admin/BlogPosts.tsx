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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { blogPostSchema, validateFormData } from '@/lib/validations/admin';
import type { Tables } from '@/integrations/supabase/types';

type BlogPost = Tables<'blog_posts'>;

export default function AdminBlogPosts() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (post: Partial<BlogPost> & { published_at?: string | null }) => {
      if (editing) {
        const { error } = await supabase.from('blog_posts').update(post).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_posts').insert(post as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Post updated' : 'Post created' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast({ title: 'Post deleted' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    const validation = validateFormData(blogPostSchema, form, {
      title: (v) => v?.toString() ?? '',
      slug: (v) => v?.toString() ?? '',
      excerpt: (v) => v?.toString() || null,
      content: (v) => v?.toString() ?? '',
      cover_image_url: (v) => v?.toString() || null,
      status: (v) => v?.toString() ?? 'draft',
    });

    if (!validation.success) {
      toast({ title: 'Validation Error', description: (validation as { success: false; error: string }).error, variant: 'destructive' });
      return;
    }

    const validatedData = (validation as { success: true; data: typeof validation.data }).data;
    const data = {
      ...validatedData,
      published_at: validatedData.status === 'published' ? new Date().toISOString() : null,
    };

    saveMutation.mutate(data);
  };

  const columns = [
    {
      key: 'cover_image_url',
      label: 'Image',
      render: (p: BlogPost) => p.cover_image_url ? (
        <img src={p.cover_image_url} alt="" className="h-10 w-16 object-cover rounded" />
      ) : '-',
    },
    { key: 'title', label: 'Title' },
    {
      key: 'status',
      label: 'Status',
      render: (p: BlogPost) => (
        <Badge variant={p.status === 'published' ? 'default' : 'secondary'}>{p.status}</Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (p: BlogPost) => new Date(p.created_at).toLocaleDateString(),
    },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Post
        </Button>
      </div>

      <DataTable
        data={posts}
        columns={columns}
        loading={isLoading}
        onEdit={(p) => { setEditing(p); setOpen(true); }}
        onDelete={(p) => deleteMutation.mutate(p.id)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Post' : 'Add Post'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input name="title" defaultValue={editing?.title} required maxLength={300} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input name="slug" defaultValue={editing?.slug} required maxLength={100} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue={editing?.status ?? 'draft'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea name="excerpt" defaultValue={editing?.excerpt ?? ''} rows={2} maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea name="content" defaultValue={editing?.content ?? ''} rows={10} required maxLength={100000} />
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload
                bucket="blog-images"
                value={editing?.cover_image_url ?? undefined}
                onChange={(url) => {
                  const input = document.querySelector<HTMLInputElement>('input[name="cover_image_url"]');
                  if (input) input.value = url ?? '';
                }}
              />
              <input type="hidden" name="cover_image_url" defaultValue={editing?.cover_image_url ?? ''} />
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
