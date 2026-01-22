import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { ProjectGalleryManager } from '@/components/admin/ProjectGalleryManager';
import { EntityJsonEditor } from '@/components/admin/EntityJsonEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Project = Tables<'projects'>;

export default function AdminProjects() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [coverImage, setCoverImage] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [jsonIsValid, setJsonIsValid] = useState(true);
  const [jsonData, setJsonData] = useState<Record<string, unknown>>({});
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
      setCoverImage('');
      setIsFeatured(false);
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

  const handleEdit = (project: Project) => {
    setEditing(project);
    setCoverImage(project.cover_image ?? '');
    setIsFeatured(project.is_featured ?? false);
    setJsonData({
      title: project.title || '',
      slug: project.slug || '',
      client: project.client || '',
      description: project.description || '',
      challenge: project.challenge || '',
      solution: project.solution || '',
      results: project.results || '',
      project_url: project.project_url || '',
      cover_image: project.cover_image || '',
      is_featured: project.is_featured || false,
      display_order: project.display_order || 0,
    });
    setActiveTab('details');
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // If JSON view is active and invalid, prevent save
    if (activeTab === 'json' && !jsonIsValid) {
      toast({
        title: 'Validation Error',
        description: 'Please fix JSON validation errors before saving',
        variant: 'destructive',
      });
      return;
    }

    // Use JSON data if JSON tab is active, otherwise use form data
    const data: Partial<Project> = activeTab === 'json' ? {
      title: (jsonData.title as string) || '',
      slug: (jsonData.slug as string) || '',
      client: (jsonData.client as string) || null,
      description: (jsonData.description as string) || null,
      challenge: (jsonData.challenge as string) || null,
      solution: (jsonData.solution as string) || null,
      results: (jsonData.results as string) || null,
      project_url: (jsonData.project_url as string) || null,
      cover_image: (jsonData.cover_image as string) || null,
      is_featured: (jsonData.is_featured as boolean) || false,
      display_order: Number(jsonData.display_order) || 0,
    } : (() => {
      const form = new FormData(e.currentTarget);
      const title = form.get('title')?.toString() ?? '';
      const slug = form.get('slug')?.toString() ?? '';

      if (!title || !slug) {
        toast({ title: 'Validation Error', description: 'Title and slug are required', variant: 'destructive' });
        return null;
      }

      return {
        title,
        slug,
        client: form.get('client')?.toString() || null,
        description: form.get('description')?.toString() || null,
        challenge: form.get('challenge')?.toString() || null,
        solution: form.get('solution')?.toString() || null,
        results: form.get('results')?.toString() || null,
        project_url: form.get('project_url')?.toString() || null,
        cover_image: coverImage || null,
        is_featured: isFeatured,
        display_order: Number(form.get('display_order')) || 0,
      };
    })();

    if (!data) return;

    saveMutation.mutate(data);
  };

  const columns = [
    {
      key: 'cover_image',
      label: 'Image',
      render: (p: Project) => p.cover_image ? (
        <img src={p.cover_image} alt="" className="h-10 w-16 object-cover rounded" />
      ) : '-',
    },
    { key: 'title', label: 'Title' },
    { key: 'client', label: 'Client' },
    { key: 'display_order', label: 'Order' },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => { 
          setEditing(null); 
          setCoverImage(''); 
          setIsFeatured(false); 
          setJsonData({});
          setActiveTab('details');
          setOpen(true); 
        }}>
          <Plus className="h-4 w-4 mr-2" /> Add Project
        </Button>
      </div>

      <DataTable
        data={projects}
        columns={columns}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={(p) => deleteMutation.mutate(p.id)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="gallery" disabled={!editing}>Gallery</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
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
                  <Label>Client</Label>
                  <Input name="client" defaultValue={editing?.client ?? ''} maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" defaultValue={editing?.description ?? ''} rows={3} maxLength={10000} />
                </div>
                <div className="space-y-2">
                  <Label>Challenge</Label>
                  <Textarea name="challenge" defaultValue={editing?.challenge ?? ''} rows={2} maxLength={2000} />
                </div>
                <div className="space-y-2">
                  <Label>Solution</Label>
                  <Textarea name="solution" defaultValue={editing?.solution ?? ''} rows={2} maxLength={2000} />
                </div>
                <div className="space-y-2">
                  <Label>Results</Label>
                  <Textarea name="results" defaultValue={editing?.results ?? ''} rows={2} maxLength={2000} />
                </div>
                <div className="space-y-2">
                  <Label>Project URL</Label>
                  <Input name="project_url" defaultValue={editing?.project_url ?? ''} type="url" />
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <ImageUpload
                    bucket="project-images"
                    value={coverImage || undefined}
                    onChange={(url) => setCoverImage(url ?? '')}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input name="display_order" type="number" defaultValue={editing?.display_order ?? 0} min={0} max={9999} />
                </div>
                <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="gallery">
              {editing && <ProjectGalleryManager projectId={editing.id} />}
            </TabsContent>

            <TabsContent value="json" className="mt-4">
              <EntityJsonEditor
                entityType="project"
                entityId={editing?.id}
                value={jsonData}
                onChange={(value) => setJsonData(value)}
                onValidationChange={setJsonIsValid}
                fileName={editing?.title || 'project'}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}