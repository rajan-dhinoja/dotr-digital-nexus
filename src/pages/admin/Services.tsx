import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminToolbar } from '@/components/admin/AdminToolbar';
import { BulkDeleteDialog } from '@/components/admin/BulkDeleteDialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { EntityJsonEditor } from '@/components/admin/EntityJsonEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useEntityImportExport } from '@/hooks/useEntityImportExport';
import { useAdminList } from '@/hooks/useAdminList';
import { useBulkActions } from '@/hooks/useBulkActions';
import { getModuleConfig } from '@/config/adminModules';
import { X, GripVertical, Download, Upload as UploadIcon } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;
type Category = Tables<'service_categories'>;

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface ProcessStep {
  title: string;
  description: string;
  icon?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const ICON_OPTIONS = [
  'Zap', 'Code', 'Palette', 'TrendingUp', 'Video', 'Smartphone', 'Globe', 
  'ShoppingCart', 'Search', 'BarChart', 'Mail', 'Camera', 'Layers', 
  'Settings', 'Shield', 'Rocket', 'Target', 'Users', 'MessageSquare', 'Star'
];

export default function AdminServices() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [jsonIsValid, setJsonIsValid] = useState(true);
  const [jsonData, setJsonData] = useState<Record<string, unknown>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { exportSingle, exportBulk, importFromFile } = useEntityImportExport({
    entityType: 'service',
    tableName: 'services',
    queryKey: ['admin-services'],
  });

  const moduleConfig = getModuleConfig('services');
  const {
    data: services = [],
    isLoading,
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
    filters,
    setFilter,
    clearFilters,
  } = useAdminList<Service>({
    tableName: 'services',
    queryKey: ['admin-services'],
    searchFields: moduleConfig?.searchFields || ['name', 'slug'],
    defaultSort: moduleConfig?.defaultSort,
    pageSize: moduleConfig?.pageSize || 20,
  });

  const { bulkDelete, isPending: isBulkDeleting } = useBulkActions({
    tableName: 'services',
    queryKey: ['admin-services'],
    onSuccess: (action, count) => {
      toast({ title: `Deleted ${count} services` });
      setSelectedIds([]);
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('service_categories').select('*').order('display_order');
      return data ?? [];
    },
  });

  const resetForm = () => {
    setFeatures([]);
    setProcessSteps([]);
    setFaqs([]);
    setTechnologies([]);
    setTechInput('');
    setImageUrl('');
    setIsFeatured(false);
  };

  const loadEditingData = (service: Service) => {
    setEditing(service);
    setFeatures((service.features as unknown as Feature[]) || []);
    setProcessSteps((service.process_steps as unknown as ProcessStep[]) || []);
    setFaqs((service.faqs as unknown as FAQ[]) || []);
    const techs = service.technologies as unknown;
    setTechnologies(Array.isArray(techs) ? techs as string[] : []);
    setImageUrl(service.image_url ?? '');
    setIsFeatured(service.is_featured ?? false);
    
    // Load JSON data from service
    setJsonData({
      name: service.name || '',
      slug: service.slug || '',
      tagline: service.tagline || '',
      description: service.description || '',
      icon: service.icon || '',
      image_url: service.image_url || '',
      features: (service.features as unknown as Feature[]) || [],
      process_steps: (service.process_steps as unknown as ProcessStep[]) || [],
      faqs: (service.faqs as unknown as FAQ[]) || [],
      technologies: Array.isArray(techs) ? techs as string[] : [],
      pricing: (service.pricing as unknown) || [],
    });
    
    setActiveTab('basic');
    setOpen(true);
  };

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
      resetForm();
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

  const handleExportService = (service: Service) => {
    const serviceData = {
      name: service.name,
      slug: service.slug,
      category_id: service.category_id,
      tagline: service.tagline,
      description: service.description,
      icon: service.icon,
      image_url: service.image_url,
      is_featured: service.is_featured,
      display_order: service.display_order,
      features: service.features,
      process_steps: service.process_steps,
      faqs: service.faqs,
      technologies: service.technologies,
      pricing: service.pricing,
    };
    exportSingle(serviceData, service.id);
  };

  const handleExportAll = () => {
    const servicesData = services.map((service) => ({
      name: service.name,
      slug: service.slug,
      category_id: service.category_id,
      tagline: service.tagline,
      description: service.description,
      icon: service.icon,
      image_url: service.image_url,
      is_featured: service.is_featured,
      display_order: service.display_order,
      features: service.features,
      process_steps: service.process_steps,
      faqs: service.faqs,
      technologies: service.technologies,
      pricing: service.pricing,
    }));
    exportBulk(servicesData);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await importFromFile(file, { onConflict: 'overwrite', createNew: true });
    
    // Reset file input
    if (importFileRef.current) {
      importFileRef.current.value = '';
    }
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
    
    const name = form.get('name')?.toString() ?? '';
    const slug = form.get('slug')?.toString() ?? '';
    const category_id = form.get('category_id')?.toString() || null;

    if (!name || !slug) {
      toast({ title: 'Validation Error', description: 'Name and slug are required', variant: 'destructive' });
      return;
    }

    // Use JSON data if JSON tab is active, otherwise use form data
    const data = activeTab === 'json' ? {
      name: (jsonData.name as string) || '',
      slug: (jsonData.slug as string) || '',
      category_id,
      tagline: (jsonData.tagline as string) || null,
      description: (jsonData.description as string) || null,
      icon: (jsonData.icon as string) || null,
      image_url: (jsonData.image_url as string) || null,
      is_featured: isFeatured,
      display_order: Number(form.get('display_order')) || 0,
      features: jsonData.features || [],
      process_steps: jsonData.process_steps || [],
      faqs: jsonData.faqs || [],
      technologies: jsonData.technologies || [],
      pricing: jsonData.pricing || null,
    } : {
      name,
      slug,
      category_id,
      tagline: form.get('tagline')?.toString() || null,
      description: form.get('description')?.toString() || null,
      icon: form.get('icon')?.toString() || null,
      image_url: imageUrl || null,
      is_featured: isFeatured,
      display_order: Number(form.get('display_order')) || 0,
      features: features,
      process_steps: processSteps,
      faqs: faqs,
      technologies: technologies,
      pricing: null,
    };

    saveMutation.mutate(data as never);
  };

  const addFeature = () => {
    setFeatures([...features, { title: '', description: '', icon: 'CheckCircle' }]);
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    setFeatures(updated);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addProcessStep = () => {
    setProcessSteps([...processSteps, { title: '', description: '', icon: 'ArrowRight' }]);
  };

  const updateProcessStep = (index: number, field: keyof ProcessStep, value: string) => {
    const updated = [...processSteps];
    updated[index] = { ...updated[index], [field]: value };
    setProcessSteps(updated);
  };

  const removeProcessStep = (index: number) => {
    setProcessSteps(processSteps.filter((_, i) => i !== index));
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const addTechnology = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await bulkDelete(selectedIds);
    setBulkDeleteOpen(false);
    if (result.failed > 0) {
      toast({
        title: 'Some deletions failed',
        description: `${result.success} deleted, ${result.failed} failed`,
        variant: 'destructive',
      });
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'slug', label: 'Slug' },
    {
      key: 'category_id',
      label: 'Category',
      render: (s: Service) => categories.find(c => c.id === s.category_id)?.name ?? '-',
    },
    { key: 'display_order', label: 'Order', sortable: true },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          ref={importFileRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => importFileRef.current?.click()}
        >
          <UploadIcon className="h-4 w-4 mr-2" /> Import
        </Button>
        <Button
          variant="outline"
          onClick={handleExportAll}
          disabled={services.length === 0}
        >
          <Download className="h-4 w-4 mr-2" /> Export All
        </Button>
      </div>

      <AdminToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={moduleConfig?.filters || []}
        filterValues={filters}
        onFilterChange={setFilter}
        selectedCount={selectedIds.length}
        onBulkDelete={() => setBulkDeleteOpen(true)}
        onAddNew={() => {
          setEditing(null);
          resetForm();
          setJsonData({});
          setActiveTab('basic');
          setOpen(true);
        }}
        addButtonLabel="Add Service"
        onClearFilters={clearFilters}
      />

      <div className="mt-6">
        <AdminDataTable
          data={services}
          columns={columns}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          sortConfig={sortConfig}
          onSortChange={(field, direction) => setSortConfig({ field, direction })}
          loading={isLoading}
          onEdit={(s) => loadEditingData(s)}
          onDelete={(s) => deleteMutation.mutate(s.id)}
          actions={(s) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExportService(s)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          emptyMessage="No services found"
        />
      </div>

      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        count={selectedIds.length}
        onConfirm={handleBulkDelete}
        isLoading={isBulkDeleting}
        itemName="services"
      />

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); }}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="process">Process</TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input name="name" defaultValue={editing?.name} required maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug *</Label>
                    <Input name="slug" defaultValue={editing?.slug} required maxLength={100} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select name="category_id" defaultValue={editing?.category_id ?? undefined}>
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
                    <Label>Icon</Label>
                    <Select name="icon" defaultValue={editing?.icon || 'Zap'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((icon) => (
                          <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input name="tagline" defaultValue={editing?.tagline ?? ''} maxLength={500} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" defaultValue={editing?.description ?? ''} rows={4} maxLength={10000} />
                </div>
                <div className="space-y-2">
                  <Label>Service Image</Label>
                  <ImageUpload
                    bucket="service-images"
                    value={imageUrl || undefined}
                    onChange={(url) => setImageUrl(url ?? '')}
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

                {/* Technologies */}
                <div className="space-y-2">
                  <Label>Technologies & Tools</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={techInput} 
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="Add technology..."
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTechnology(); }}}
                    />
                    <Button type="button" variant="secondary" onClick={addTechnology}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {technologies.map((tech, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                        {tech}
                        <button type="button" onClick={() => removeTechnology(index)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg">Key Features</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-1" /> Add Feature
                  </Button>
                </div>
                {features.map((feature, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input 
                              placeholder="Feature title" 
                              value={feature.title}
                              onChange={(e) => updateFeature(index, 'title', e.target.value)}
                            />
                            <Select 
                              value={feature.icon || 'CheckCircle'}
                              onValueChange={(v) => updateFeature(index, 'icon', v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ICON_OPTIONS.map((icon) => (
                                  <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Textarea 
                            placeholder="Feature description" 
                            value={feature.description}
                            onChange={(e) => updateFeature(index, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {features.length === 0 && (
                  <p className="text-foreground/70 text-center py-8">No features added yet. Click "Add Feature" to start.</p>
                )}
              </TabsContent>

              <TabsContent value="process" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg">Process Steps</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addProcessStep}>
                    <Plus className="h-4 w-4 mr-1" /> Add Step
                  </Button>
                </div>
                {processSteps.map((step, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Step {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input 
                              placeholder="Step title" 
                              value={step.title}
                              onChange={(e) => updateProcessStep(index, 'title', e.target.value)}
                            />
                            <Select 
                              value={step.icon || 'ArrowRight'}
                              onValueChange={(v) => updateProcessStep(index, 'icon', v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ICON_OPTIONS.map((icon) => (
                                  <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Textarea 
                            placeholder="Step description" 
                            value={step.description}
                            onChange={(e) => updateProcessStep(index, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeProcessStep(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {processSteps.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No process steps added yet. Click "Add Step" to start.</p>
                )}
              </TabsContent>

              <TabsContent value="faqs" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg">Frequently Asked Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFaq}>
                    <Plus className="h-4 w-4 mr-1" /> Add FAQ
                  </Button>
                </div>
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-3">
                          <Input 
                            placeholder="Question" 
                            value={faq.question}
                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                          />
                          <Textarea 
                            placeholder="Answer" 
                            value={faq.answer}
                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                            rows={3}
                          />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFaq(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {faqs.length === 0 && (
                  <p className="text-foreground/70 text-center py-8">No FAQs added yet. Click "Add FAQ" to start.</p>
                )}
              </TabsContent>

              <TabsContent value="json" className="mt-4">
                <EntityJsonEditor
                  entityType="service"
                  entityId={editing?.id}
                  value={jsonData}
                  onChange={(value) => setJsonData(value)}
                  onValidationChange={setJsonIsValid}
                  fileName={editing?.name || 'service'}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button type="submit" className="w-full" disabled={saveMutation.isPending || (activeTab === 'json' && !jsonIsValid)}>
                {saveMutation.isPending ? 'Saving...' : 'Save Service'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}