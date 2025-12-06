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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, GripVertical } from 'lucide-react';
import { serviceSchema, validateFormData } from '@/lib/validations/admin';
import type { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;
type Category = Tables<'services_categories'>;

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

  const resetForm = () => {
    setFeatures([]);
    setProcessSteps([]);
    setFaqs([]);
    setTechnologies([]);
    setTechInput('');
  };

  const loadEditingData = (service: Service) => {
    setEditing(service);
    setFeatures((service.features as unknown as Feature[]) || []);
    setProcessSteps((service.process_steps as unknown as ProcessStep[]) || []);
    setFaqs((service.faqs as unknown as FAQ[]) || []);
    setTechnologies(service.technologies || []);
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

    const extraFields = {
      hero_image_url: form.get('hero_image_url')?.toString() || null,
      icon_name: form.get('icon_name')?.toString() || 'Zap',
      pricing_info: form.get('pricing_info')?.toString() || null,
      delivery_time: form.get('delivery_time')?.toString() || null,
      meta_title: form.get('meta_title')?.toString() || null,
      meta_description: form.get('meta_description')?.toString() || null,
      features: features as unknown as null,
      process_steps: processSteps as unknown as null,
      faqs: faqs as unknown as null,
      technologies: technologies,
    };

    saveMutation.mutate({ ...(validation as { success: true; data: typeof validation.data }).data, ...extraFields } as Partial<Service>);
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
        <Button onClick={() => { setEditing(null); resetForm(); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Service
        </Button>
      </div>

      <DataTable
        data={services}
        columns={columns}
        loading={isLoading}
        onEdit={(s) => loadEditingData(s)}
        onDelete={(s) => deleteMutation.mutate(s.id)}
      />

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); resetForm(); }}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="process">Process</TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
                <TabsTrigger value="seo">SEO & Pricing</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input name="title" defaultValue={editing?.title} required maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug *</Label>
                    <Input name="slug" defaultValue={editing?.slug} required maxLength={100} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
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
                    <Label>Icon</Label>
                    <Select name="icon_name" defaultValue={editing?.icon_name || 'Zap'}>
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
                  <Label>Short Summary</Label>
                  <Input name="short_summary" defaultValue={editing?.short_summary ?? ''} maxLength={500} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" defaultValue={editing?.description ?? ''} rows={4} maxLength={10000} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Image</Label>
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
                    <Label>Hero Image</Label>
                    <ImageUpload
                      bucket="service-images"
                      value={editing?.hero_image_url ?? undefined}
                      onChange={(url) => {
                        const input = document.querySelector<HTMLInputElement>('input[name="hero_image_url"]');
                        if (input) input.value = url ?? '';
                      }}
                    />
                    <input type="hidden" name="hero_image_url" defaultValue={editing?.hero_image_url ?? ''} />
                  </div>
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
                  <p className="text-muted-foreground text-center py-8">No features added yet. Click "Add Feature" to start.</p>
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
                  <p className="text-muted-foreground text-center py-8">No process steps added yet.</p>
                )}
              </TabsContent>

              <TabsContent value="faqs" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg">FAQs</Label>
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
                  <p className="text-muted-foreground text-center py-8">No FAQs added yet.</p>
                )}
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pricing Info</Label>
                    <Input name="pricing_info" defaultValue={editing?.pricing_info ?? ''} placeholder="e.g., Starting from $500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Time</Label>
                    <Input name="delivery_time" defaultValue={editing?.delivery_time ?? ''} placeholder="e.g., 2-4 weeks" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Meta Title (SEO)</Label>
                  <Input name="meta_title" defaultValue={editing?.meta_title ?? ''} maxLength={60} placeholder="Page title for search engines" />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description (SEO)</Label>
                  <Textarea name="meta_description" defaultValue={editing?.meta_description ?? ''} maxLength={160} rows={2} placeholder="Description for search engines" />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Service'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}