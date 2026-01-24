import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { VisibilityToggle, VisibilityBadge } from '@/components/admin/VisibilityToggle';
import { EntityJsonEditor } from '@/components/admin/EntityJsonEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from '@/hooks/useActivityLog';
import { usePagesImportExport } from '@/hooks/usePagesImportExport';
import { PagesImportModal } from '@/components/admin/PagesImportModal';
import { Plus, Upload, Download } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  content: Record<string, any> | null;
  template: string | null;
  parent_id: string | null;
  is_active: boolean | null;
  is_system: boolean | null;
  show_in_nav: boolean | null;
  display_order: number | null;
  // Navigation integration fields (hybrid model)
  show_in_navigation: boolean | null;
  default_menu_type: string | null;
  navigation_label_override: string | null;
  navigation_priority: number | null;
  created_at: string;
  updated_at: string;
}

const TEMPLATE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'blank', label: 'Blank' },
];

export default function AdminPages() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [showInNav, setShowInNav] = useState(true);
  const [showInNavigation, setShowInNavigation] = useState(true);
  const [defaultMenuType, setDefaultMenuType] = useState<string>('header');
  const [navigationLabelOverride, setNavigationLabelOverride] = useState<string>('');
  const [navigationPriority, setNavigationPriority] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('general');
  const [jsonIsValid, setJsonIsValid] = useState(true);
  const [jsonContent, setJsonContent] = useState<Record<string, unknown>>({});
  const [importModalOpen, setImportModalOpen] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const { exportPagesMenu } = usePagesImportExport();
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => {
      const { data } = await supabase.from('pages').select('*').order('display_order');
      return (data ?? []) as Page[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (page: Partial<Page>) => {
      if (editing) {
        const { error } = await supabase.from('pages').update(page).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pages').insert(page as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all page-related queries (admin + public)
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['nav-pages'] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'page' });
      logActivity({
        action: editing ? 'update' : 'create',
        entity_type: 'page',
        entity_id: editing?.id,
        entity_name: editing?.title,
      });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Page updated' : 'Page created' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all page-related queries (admin + public)
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['nav-pages'] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'page' });
      toast({ title: 'Page deleted' });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('pages').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all page-related queries (admin + public)
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['nav-pages'] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'page' });
    },
  });

  const handleEdit = (page: Page) => {
    setEditing(page);
    setIsActive(page.is_active ?? true);
    setShowInNav(page.show_in_nav ?? true);
    setShowInNavigation(page.show_in_navigation ?? true);
    setDefaultMenuType(page.default_menu_type ?? 'header');
    setNavigationLabelOverride(page.navigation_label_override ?? '');
    setNavigationPriority(page.navigation_priority ?? 0);
    setJsonContent((page.content as Record<string, unknown>) || {});
    setActiveTab('general');
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

    const form = new FormData(e.currentTarget);
    
    const title = form.get('title')?.toString() ?? '';
    const slug = form.get('slug')?.toString() ?? '';

    if (!title || !slug) {
      toast({ title: 'Validation Error', description: 'Title and slug are required', variant: 'destructive' });
      return;
    }

    const data: Partial<Page> = {
      title,
      slug,
      description: form.get('description')?.toString() || null,
      meta_title: form.get('meta_title')?.toString() || null,
      meta_description: form.get('meta_description')?.toString() || null,
      template: form.get('template')?.toString() || 'default',
      parent_id: form.get('parent_id')?.toString() === 'none' ? null : form.get('parent_id')?.toString() || null,
      is_active: isActive,
      show_in_nav: showInNav,
      show_in_navigation: showInNavigation,
      default_menu_type: form.get('default_menu_type')?.toString() || defaultMenuType,
      navigation_label_override: form.get('navigation_label_override')?.toString() || navigationLabelOverride || null,
      navigation_priority: Number(form.get('navigation_priority')) || navigationPriority || 0,
      display_order: Number(form.get('display_order')) || 0,
      content: activeTab === 'json' ? jsonContent : (editing?.content || {}),
    };

    saveMutation.mutate(data);
  };

  const columns = [
    { 
      key: 'title', 
      label: 'Title',
      render: (p: Page) => (
        <div className="flex items-center gap-2">
          {p.title}
        </div>
      ),
    },
    { key: 'slug', label: 'Slug' },
    { key: 'template', label: 'Template' },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (p: Page) => (
        <VisibilityToggle
          isActive={p.is_active ?? true}
          onToggle={(value) => toggleVisibilityMutation.mutate({ id: p.id, is_active: value })}
          disabled={toggleVisibilityMutation.isPending}
        />
      ),
    },
    { key: 'display_order', label: 'Order' },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-muted-foreground">Manage website pages and their visibility</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setImportModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" /> Bulk Import
          </Button>
          <Button variant="outline" onClick={() => exportPagesMenu()}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setIsActive(true);
              setShowInNav(true);
              setShowInNavigation(true);
              setDefaultMenuType('header');
              setNavigationLabelOverride('');
              setNavigationPriority(0);
              setJsonContent({});
              setActiveTab('general');
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Page
          </Button>
        </div>
      </div>

      <PagesImportModal open={importModalOpen} onOpenChange={setImportModalOpen} />

      <DataTable
        data={pages}
        columns={columns}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={(p) => deleteMutation.mutate(p.id)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Page' : 'Add Page'}</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit}>
              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input name="title" defaultValue={editing?.title} required maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug *</Label>
                    <Input 
                      name="slug" 
                      defaultValue={editing?.slug} 
                      required 
                      maxLength={100}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select name="template" defaultValue={editing?.template || 'default'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_OPTIONS.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Page</Label>
                    <Select name="parent_id" defaultValue={editing?.parent_id || 'none'}>
                      <SelectTrigger>
                        <SelectValue placeholder="None (top level)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (top level)</SelectItem>
                        {pages.filter(p => p.id !== editing?.id).map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" defaultValue={editing?.description ?? ''} rows={3} maxLength={1000} />
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input name="display_order" type="number" defaultValue={editing?.display_order ?? 0} min={0} max={9999} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                      <Label htmlFor="is_active">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="show_in_nav" checked={showInNav} onCheckedChange={setShowInNav} />
                      <Label htmlFor="show_in_nav">Show in Legacy Navigation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show_in_navigation"
                        checked={showInNavigation}
                        onCheckedChange={setShowInNavigation}
                      />
                      <Label htmlFor="show_in_navigation">Show in New Navigation</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Menu Type</Label>
                      <Select
                        name="default_menu_type"
                        defaultValue={editing?.default_menu_type || defaultMenuType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select menu type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="header">Header</SelectItem>
                          <SelectItem value="footer">Footer</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Navigation Label Override</Label>
                      <Input
                        name="navigation_label_override"
                        defaultValue={editing?.navigation_label_override ?? navigationLabelOverride}
                        placeholder="Optional label used in menus"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Navigation Priority</Label>
                    <Input
                      name="navigation_priority"
                      type="number"
                      defaultValue={editing?.navigation_priority ?? navigationPriority ?? 0}
                      min={0}
                      max={9999}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower numbers appear earlier in navigation within the same group.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input name="meta_title" defaultValue={editing?.meta_title ?? ''} maxLength={60} placeholder="SEO title (max 60 chars)" />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea name="meta_description" defaultValue={editing?.meta_description ?? ''} rows={3} maxLength={160} placeholder="SEO description (max 160 chars)" />
                </div>
              </TabsContent>

              <TabsContent value="json" className="mt-4">
                <EntityJsonEditor
                  entityType="page"
                  entityId={editing?.id}
                  value={jsonContent}
                  onChange={(value) => setJsonContent(value)}
                  onValidationChange={setJsonIsValid}
                  fileName={editing?.title || 'page'}
                />
              </TabsContent>

              <div className="mt-6">
                <Button type="submit" className="w-full" disabled={saveMutation.isPending || (activeTab === 'json' && !jsonIsValid)}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
