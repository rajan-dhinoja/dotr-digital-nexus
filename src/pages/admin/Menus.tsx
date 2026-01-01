import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from '@/hooks/useActivityLog';
import { Plus, GripVertical, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';

interface MenuItem {
  id: string;
  menu_location: string;
  label: string;
  url: string | null;
  page_id: string | null;
  parent_id: string | null;
  target: string | null;
  is_active: boolean | null;
  display_order: number | null;
  created_at: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  is_active: boolean | null;
}

const MENU_LOCATIONS = [
  { value: 'header', label: 'Header Navigation' },
  { value: 'footer', label: 'Footer Links' },
];

export default function AdminMenus() {
  const [selectedLocation, setSelectedLocation] = useState('header');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [isActive, setIsActive] = useState(true);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['admin-menu-items', selectedLocation],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('menu_location', selectedLocation)
        .order('display_order');
      
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  const { data: pages = [] } = useQuery({
    queryKey: ['admin-pages-for-menu'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('id, title, slug, is_active')
        .order('title');
      
      if (error) throw error;
      return data as Page[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<MenuItem>) => {
      if (editing) {
        const { error } = await supabase.from('menu_items').update(item).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('menu_items').insert(item as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      logActivity({
        action: editing ? 'update' : 'create',
        entity_type: 'menu_item',
        entity_id: editing?.id,
        entity_name: editing?.label,
      });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Menu item updated' : 'Menu item created' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      toast({ title: 'Menu item deleted' });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('menu_items').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
    },
  });

  const handleEdit = (item: MenuItem) => {
    setEditing(item);
    setIsActive(item.is_active ?? true);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    const label = form.get('label')?.toString() ?? '';
    if (!label) {
      toast({ title: 'Validation Error', description: 'Label is required', variant: 'destructive' });
      return;
    }

    const page_id = form.get('page_id')?.toString() || null;
    const customUrl = form.get('url')?.toString() || null;
    
    const data: Partial<MenuItem> = {
      menu_location: selectedLocation,
      label,
      url: page_id ? null : customUrl,
      page_id: page_id || null,
      target: form.get('target')?.toString() || '_self',
      is_active: isActive,
      display_order: Number(form.get('display_order')) || 0,
    };

    saveMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Menu Builder</h1>
          <p className="text-muted-foreground">Manage navigation menus for your site</p>
        </div>
        <Button onClick={() => { setEditing(null); setIsActive(true); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Menu Item
        </Button>
      </div>

      <Tabs value={selectedLocation} onValueChange={setSelectedLocation}>
        <TabsList>
          {MENU_LOCATIONS.map((loc) => (
            <TabsTrigger key={loc.value} value={loc.value}>{loc.label}</TabsTrigger>
          ))}
        </TabsList>

        {MENU_LOCATIONS.map((loc) => (
          <TabsContent key={loc.value} value={loc.value} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading menu items...</div>
            ) : menuItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No menu items yet. Add your first item above.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.url || (item.page_id ? `Page: ${pages.find(p => p.id === item.page_id)?.title}` : 'No link')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.target === '_blank' && (
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleVisibilityMutation.mutate({ id: item.id, is_active: !item.is_active })}
                        >
                          {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input name="label" defaultValue={editing?.label} required maxLength={100} />
            </div>
            
            <div className="space-y-2">
              <Label>Link to Page</Label>
              <Select name="page_id" defaultValue={editing?.page_id || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page (or use custom URL)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Custom URL</SelectItem>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>{page.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Custom URL</Label>
              <Input name="url" defaultValue={editing?.url ?? ''} placeholder="https://example.com or /page" />
              <p className="text-xs text-muted-foreground">Used when no page is selected above</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Open in</Label>
                <Select name="target" defaultValue={editing?.target || '_self'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Same tab</SelectItem>
                    <SelectItem value="_blank">New tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input name="display_order" type="number" defaultValue={editing?.display_order ?? 0} min={0} max={999} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="is_active">Visible</Label>
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
