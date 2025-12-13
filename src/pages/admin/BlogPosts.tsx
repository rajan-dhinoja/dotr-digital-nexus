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
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type BlogPost = Tables<'blog_posts'>;

export default function AdminBlogPosts() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [coverImage, setCoverImage] = useState<string>('');
  const [isPublished, setIsPublished] = useState(false);
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
    mutationFn: async (post: Partial<BlogPost>) => {
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
      setCoverImage('');
      setIsPublished(false);
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

  const handleEdit = (post: BlogPost) => {
    setEditing(post);
    setCoverImage(post.cover_image ?? '');
    setIsPublished(post.is_published ?? false);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    const title = form.get('title')?.toString() ?? '';
    const slug = form.get('slug')?.toString() ?? '';
    const excerpt = form.get('excerpt')?.toString() || null;
    const content = form.get('content')?.toString() ?? '';

    if (!title || !slug || !content) {
      toast({ title: 'Validation Error', description: 'Title, slug, and content are required', variant: 'destructive' });
      return;
    }

    const data: Partial<BlogPost> = {
      title,
      slug,
      excerpt,
      content,
      cover_image: coverImage || null,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    };

    saveMutation.mutate(data);
  };

  const columns = [
    {
      key: 'cover_image',
      label: 'Image',
      render: (p: BlogPost) => p.cover_image ? (
        <img src={p.cover_image} alt="" className="h-10 w-16 object-cover rounded" />
      ) : '-',
    },
    { key: 'title', label: 'Title' },
    {
      key: 'is_published',
      label: 'Status',
      render: (p: BlogPost) => (
        <Badge variant={p.is_published ? 'default' : 'secondary'}>
          {p.is_published ? 'Published' : 'Draft'}
        </Badge>
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
        <Button onClick={() => { setEditing(null); setCoverImage(''); setIsPublished(false); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Post
        </Button>
      </div>

      <DataTable
        data={posts}
        columns={columns}
        loading={isLoading}
        onEdit={handleEdit}
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
            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="is_published">Published</Label>
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
                value={coverImage || undefined}
                onChange={(url) => setCoverImage(url ?? '')}
              />
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