import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { ProjectGalleryManager } from '@/components/admin/ProjectGalleryManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Project = Tables<'projects'>;

export default function AdminProjects() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*').order('display_order');
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (project: Partial<Project>) => {
      if (editing) {
        const { error } = await supabase.from('projects').update(project).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert(project as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Project updated' : 'Project created' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({ title: 'Project deleted' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    saveMutation.mutate({
      title: form.get('title') as string,
      slug: form.get('slug') as string,
      client_name: form.get('client_name') as string || null,
      summary: form.get('summary') as string || null,
      description: form.get('description') as string || null,
      achievements: form.get('achievements') as string || null,
      project_url: form.get('project_url') as string || null,
      cover_image_url: form.get('cover_image_url') as string || null,
      display_order: Number(form.get('display_order')) || 0,
    });
  };

  const columns = [
    {
      key: 'cover_image_url',
      label: 'Image',
      render: (p: Project) => p.cover_image_url ? (
        <img src={p.cover_image_url} alt="" className="h-10 w-16 object-cover rounded" />
      ) : '-',
    },
    { key: 'title', label: 'Title' },
    { key: 'client_name', label: 'Client' },
    { key: 'display_order', label: 'Order' },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Project
        </Button>
      </div>

      <DataTable
        data={projects}
        columns={columns}
        loading={isLoading}
        onEdit={(p) => { setEditing(p); setOpen(true); }}
        onDelete={(p) => deleteMutation.mutate(p.id)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="gallery" disabled={!editing}>Gallery</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input name="title" defaultValue={editing?.title} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input name="slug" defaultValue={editing?.slug} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input name="client_name" defaultValue={editing?.client_name ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label>Summary</Label>
                  <Textarea name="summary" defaultValue={editing?.summary ?? ''} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" defaultValue={editing?.description ?? ''} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Achievements</Label>
                  <Textarea name="achievements" defaultValue={editing?.achievements ?? ''} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Project URL</Label>
                  <Input name="project_url" defaultValue={editing?.project_url ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <ImageUpload
                    bucket="project-images"
                    value={editing?.cover_image_url ?? undefined}
                    onChange={(url) => {
                      const input = document.querySelector<HTMLInputElement>('input[name="cover_image_url"]');
                      if (input) input.value = url ?? '';
                    }}
                  />
                  <input type="hidden" name="cover_image_url" defaultValue={editing?.cover_image_url ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input name="display_order" type="number" defaultValue={editing?.display_order ?? 0} />
                </div>
                <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="gallery">
              {editing && <ProjectGalleryManager projectId={editing.id} />}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
