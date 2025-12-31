import { useState, lazy, Suspense, createElement } from 'react';
import { Plus, GripVertical, Trash2, Edit2, ChevronDown, ChevronUp, Layers, Star, Zap, Settings, Users, Quote, HelpCircle, Phone, Image, DollarSign, Clock, TrendingUp, BarChart, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  useSectionTypes, 
  useAdminPageSections, 
  usePageSectionMutations,
  PageSection,
  SectionType 
} from '@/hooks/usePageSections';

interface SectionManagerProps {
  pageType: string;
  entityId?: string;
  maxSections?: number;
}

export function SectionManager({ pageType, entityId, maxSections = 10 }: SectionManagerProps) {
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState<string>('');

  const { data: sectionTypes = [] } = useSectionTypes(pageType);
  const { data: sections = [], isLoading } = useAdminPageSections(pageType, entityId);
  const { saveMutation, deleteMutation, reorderMutation } = usePageSectionMutations(pageType, entityId);

  // Static icon map to avoid importing entire lucide-react library
  const iconMap: Record<string, LucideIcon> = {
    Layers, Star, Zap, Settings, Users, Quote, HelpCircle, Phone, Image, DollarSign, Clock, TrendingUp, BarChart, Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronUp, FileText
  };

  const getIcon = (iconName?: string | null): LucideIcon => {
    if (!iconName) return Layers;
    return iconMap[iconName] || Layers;
  };

  const handleAddSection = () => {
    if (sections.length >= maxSections) {
      toast({
        title: 'Limit Reached',
        description: `Maximum ${maxSections} sections allowed.`,
        variant: 'destructive',
      });
      return;
    }
    setIsAddingNew(true);
    setSelectedSectionType('');
  };

  const handleSelectSectionType = (slug: string) => {
    setSelectedSectionType(slug);
    const sectionType = sectionTypes.find(st => st.slug === slug);
    if (sectionType) {
      setEditingSection({
        id: '',
        page_type: pageType,
        entity_id: entityId || null,
        section_type: slug,
        title: sectionType.name,
        subtitle: null,
        content: {},
        display_order: sections.length,
        is_active: true,
        created_at: '',
        updated_at: '',
      });
      setIsAddingNew(false);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSection) return;

    const formData = new FormData(e.currentTarget);
    const contentItemsStr = formData.get('content_items')?.toString() || '[]';
    
    let contentItems: Record<string, unknown>[] = [];
    try {
      contentItems = JSON.parse(contentItemsStr);
    } catch {
      contentItems = [];
    }

    // Build content based on section type
    let contentData: Record<string, unknown>;
    
    if (editingSection.section_type === 'form') {
      // Special handling for form sections
      contentData = {
        form_title: formData.get('headline')?.toString() || '',
        form_description: formData.get('description')?.toString() || '',
        submit_button_text: formData.get('cta_text')?.toString() || 'Submit',
        success_message: formData.get('content_subtitle')?.toString() || 'Thank you! Your submission has been received.',
        fields: contentItems,
      };
    } else {
      contentData = {
        headline: formData.get('headline')?.toString() || '',
        subtitle: formData.get('content_subtitle')?.toString() || '',
        cta_text: formData.get('cta_text')?.toString() || '',
        cta_link: formData.get('cta_link')?.toString() || '',
        background_image: formData.get('background_image')?.toString() || '',
        description: formData.get('description')?.toString() || '',
        primary_cta_text: formData.get('primary_cta_text')?.toString() || '',
        primary_cta_link: formData.get('primary_cta_link')?.toString() || '',
        secondary_cta_text: formData.get('secondary_cta_text')?.toString() || '',
        secondary_cta_link: formData.get('secondary_cta_link')?.toString() || '',
        items: contentItems,
      };
    }

    const data: Partial<PageSection> = {
      section_type: editingSection.section_type,
      title: formData.get('title')?.toString() || null,
      subtitle: formData.get('subtitle')?.toString() || null,
      content: contentData as unknown as PageSection['content'],
      display_order: editingSection.display_order,
      is_active: editingSection.is_active,
    };

    if (editingSection.id) {
      data.id = editingSection.id;
    }

    saveMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: editingSection.id ? 'Section updated' : 'Section added' });
        setEditingSection(null);
      },
      onError: (error: Error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Section deleted' }),
      onError: (error: Error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...sections];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderMutation.mutate(
      newOrder.map((s, i) => ({ id: s.id, display_order: i }))
    );
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newOrder = [...sections];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderMutation.mutate(
      newOrder.map((s, i) => ({ id: s.id, display_order: i }))
    );
  };

  const getSectionTypeInfo = (slug: string): SectionType | undefined => {
    return sectionTypes.find(st => st.slug === slug);
  };

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Loading sections...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Page Sections ({sections.length}/{maxSections})</h3>
        <Button 
          size="sm" 
          onClick={handleAddSection}
          disabled={sections.length >= maxSections}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            No sections added yet. Click "Add Section" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sections.map((section, index) => {
            const typeInfo = getSectionTypeInfo(section.section_type);
            const Icon = getIcon(typeInfo?.icon);
            return (
              <Card key={section.id} className={!section.is_active ? 'opacity-50' : ''}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Icon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium flex-1">
                      {section.title || typeInfo?.name || section.section_type}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {typeInfo?.name || section.section_type}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === sections.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingSection(section)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Section Type Selector Dialog */}
      <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Section Type</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {sectionTypes.map((type) => {
              const Icon = getIcon(type.icon);
              return (
                <button
                  key={type.id}
                  onClick={() => handleSelectSectionType(type.slug)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors text-left"
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="font-medium text-sm">{type.name}</span>
                  {type.description && (
                    <span className="text-xs text-muted-foreground text-center line-clamp-2">
                      {type.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection?.id ? 'Edit' : 'Add'} {getSectionTypeInfo(editingSection?.section_type || '')?.name || 'Section'}
            </DialogTitle>
          </DialogHeader>
          {editingSection && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input 
                    name="title" 
                    defaultValue={editingSection.title || ''} 
                    placeholder="Section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input 
                    name="subtitle" 
                    defaultValue={editingSection.subtitle || ''} 
                    placeholder="Optional subtitle"
                  />
                </div>
              </div>

              {/* Content fields based on section type */}
              <SectionContentEditor section={editingSection} />

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={editingSection.is_active}
                  onCheckedChange={(checked) => 
                    setEditingSection({ ...editingSection, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Section'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SectionContentEditorProps {
  section: PageSection;
}

function SectionContentEditor({ section }: SectionContentEditorProps) {
  const content = section.content as Record<string, unknown>;
  const [items, setItems] = useState<Record<string, unknown>[]>(
    (content.items as Record<string, unknown>[]) || []
  );

  const addItem = () => {
    setItems([...items, {}]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Hidden input to pass items to form
  const renderItemsInput = () => (
    <input type="hidden" name="content_items" value={JSON.stringify(items)} />
  );

  switch (section.section_type) {
    case 'hero':
    case 'cta':
      return (
        <>
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input name="headline" defaultValue={(content.headline as string) || ''} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea name="description" defaultValue={(content.description as string) || ''} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary CTA Text</Label>
              <Input name="primary_cta_text" defaultValue={(content.primary_cta_text as string) || (content.cta_text as string) || ''} />
            </div>
            <div className="space-y-2">
              <Label>Primary CTA Link</Label>
              <Input name="primary_cta_link" defaultValue={(content.primary_cta_link as string) || (content.cta_link as string) || ''} />
            </div>
          </div>
          {section.section_type === 'cta' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Secondary CTA Text</Label>
                <Input name="secondary_cta_text" defaultValue={(content.secondary_cta_text as string) || ''} />
              </div>
              <div className="space-y-2">
                <Label>Secondary CTA Link</Label>
                <Input name="secondary_cta_link" defaultValue={(content.secondary_cta_link as string) || ''} />
              </div>
            </div>
          )}
          {section.section_type === 'hero' && (
            <div className="space-y-2">
              <Label>Background Image URL</Label>
              <Input name="background_image" defaultValue={(content.background_image as string) || ''} />
            </div>
          )}
        </>
      );

    case 'features':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Features</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Feature
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Feature {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Title"
                    value={(item.title as string) || ''}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                  />
                  <Textarea
                    placeholder="Description"
                    value={(item.description as string) || ''}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                  />
                  <Input
                    placeholder="Icon name (e.g., Star, Check)"
                    value={(item.icon as string) || ''}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'process':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Process Steps</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Step
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Step {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Step Title"
                    value={(item.title as string) || ''}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                  />
                  <Textarea
                    placeholder="Description"
                    value={(item.description as string) || ''}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                  />
                  <Input
                    placeholder="Icon name"
                    value={(item.icon as string) || ''}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'testimonials':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Testimonials</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Testimonial
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Testimonial {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Quote"
                    value={(item.quote as string) || ''}
                    onChange={(e) => updateItem(index, 'quote', e.target.value)}
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Author Name"
                      value={(item.author as string) || ''}
                      onChange={(e) => updateItem(index, 'author', e.target.value)}
                    />
                    <Input
                      placeholder="Role"
                      value={(item.role as string) || ''}
                      onChange={(e) => updateItem(index, 'role', e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Company"
                    value={(item.company as string) || ''}
                    onChange={(e) => updateItem(index, 'company', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'stats':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Statistics</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Stat
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Stat {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Value (e.g., 100)"
                      value={(item.value as string) || ''}
                      onChange={(e) => updateItem(index, 'value', e.target.value)}
                    />
                    <Input
                      placeholder="Label"
                      value={(item.label as string) || ''}
                      onChange={(e) => updateItem(index, 'label', e.target.value)}
                    />
                    <Input
                      placeholder="Suffix (e.g., +, %)"
                      value={(item.suffix as string) || ''}
                      onChange={(e) => updateItem(index, 'suffix', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'faq':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>FAQ Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add FAQ
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">FAQ {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Question"
                    value={(item.question as string) || ''}
                    onChange={(e) => updateItem(index, 'question', e.target.value)}
                  />
                  <Textarea
                    placeholder="Answer"
                    value={(item.answer as string) || ''}
                    onChange={(e) => updateItem(index, 'answer', e.target.value)}
                    rows={2}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'gallery':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Gallery Images</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Image
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Image {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Image URL"
                    value={(item.image_url as string) || ''}
                    onChange={(e) => updateItem(index, 'image_url', e.target.value)}
                  />
                  <Input
                    placeholder="Caption"
                    value={(item.caption as string) || ''}
                    onChange={(e) => updateItem(index, 'caption', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'team':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Team Members</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Member
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Member {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Name"
                      value={(item.name as string) || ''}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Role"
                      value={(item.role as string) || ''}
                      onChange={(e) => updateItem(index, 'role', e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Image URL"
                    value={(item.image as string) || ''}
                    onChange={(e) => updateItem(index, 'image', e.target.value)}
                  />
                  <Textarea
                    placeholder="Bio"
                    value={(item.bio as string) || ''}
                    onChange={(e) => updateItem(index, 'bio', e.target.value)}
                    rows={2}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'pricing':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Pricing Tiers</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Tier
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Tier {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Tier Name"
                      value={(item.name as string) || ''}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Price (e.g., $99/mo)"
                      value={(item.price as string) || ''}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                    />
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={(item.description as string) || ''}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                  />
                  <Textarea
                    placeholder="Features (one per line)"
                    value={Array.isArray(item.features) ? (item.features as string[]).join('\n') : ''}
                    onChange={(e) => updateItem(index, 'features', e.target.value)}
                    rows={3}
                  />
                  <Input
                    placeholder="CTA Text"
                    value={(item.cta_text as string) || ''}
                    onChange={(e) => updateItem(index, 'cta_text', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'form':
      return <FormSectionEditor content={content} items={items} setItems={setItems} renderItemsInput={renderItemsInput} />;

    default:
      return (
        <div className="text-sm text-muted-foreground">
          No editor available for this section type.
        </div>
      );
  }
}

// Form Field Types
const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Single Checkbox' },
  { value: 'checkbox-group', label: 'Multi-Select Checkboxes' },
  { value: 'url', label: 'URL' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
];

interface FormSectionEditorProps {
  content: Record<string, unknown>;
  items: Record<string, unknown>[];
  setItems: React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>;
  renderItemsInput: () => React.ReactNode;
}

function FormSectionEditor({ content, items, setItems, renderItemsInput }: FormSectionEditorProps) {
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);

  // Map items to fields format
  const fields = items as Array<{
    field_type?: string;
    label?: string;
    name?: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
    width?: string;
    validation?: { min?: number; max?: number };
  }>;

  const addField = () => {
    const newField = {
      field_type: 'text',
      label: '',
      name: '',
      placeholder: '',
      required: false,
      options: [],
      width: 'full',
    };
    setItems([...items, newField]);
    setEditingFieldIndex(items.length);
  };

  const removeField = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    if (editingFieldIndex === index) {
      setEditingFieldIndex(null);
    }
  };

  const updateField = (index: number, updates: Record<string, unknown>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    // Auto-generate name from label if not set
    if (updates.label && !newItems[index].name) {
      newItems[index].name = (updates.label as string).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }
    setItems(newItems);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };

  const needsOptions = (fieldType: string) => ['select', 'radio', 'checkbox-group'].includes(fieldType);

  return (
    <>
      {/* Hidden input for items */}
      <input type="hidden" name="content_items" value={JSON.stringify(items.map(item => ({
        ...item,
        // Ensure fields array is properly formatted
      })))} />

      {/* Form Settings */}
      <div className="space-y-4 border-b pb-4 mb-4">
        <h4 className="font-medium text-sm">Form Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Form Title</Label>
            <Input name="headline" defaultValue={(content.form_title as string) || (content.headline as string) || ''} placeholder="Contact Us" />
          </div>
          <div className="space-y-2">
            <Label>Submit Button Text</Label>
            <Input name="cta_text" defaultValue={(content.submit_button_text as string) || (content.cta_text as string) || 'Submit'} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Form Description</Label>
          <Textarea name="description" defaultValue={(content.form_description as string) || (content.description as string) || ''} rows={2} placeholder="Optional description above the form" />
        </div>
        <div className="space-y-2">
          <Label>Success Message</Label>
          <Input name="content_subtitle" defaultValue={(content.success_message as string) || (content.subtitle as string) || 'Thank you! Your submission has been received.'} placeholder="Message shown after successful submission" />
        </div>
      </div>

      {/* Form Fields Builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Form Fields</Label>
          <Button type="button" variant="outline" size="sm" onClick={addField}>
            <Plus className="h-4 w-4 mr-1" /> Add Field
          </Button>
        </div>

        {fields.length === 0 ? (
          <Card className="p-4 border-dashed">
            <p className="text-sm text-muted-foreground text-center">No fields added yet. Click "Add Field" to start building your form.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <Card key={index} className="p-3">
                {editingFieldIndex === index ? (
                  // Editing Mode
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-medium">Editing Field {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingFieldIndex(null)}
                      >
                        Done
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Field Type</Label>
                        <Select
                          value={field.field_type || 'text'}
                          onValueChange={(value) => updateField(index, { field_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Width</Label>
                        <Select
                          value={field.width || 'full'}
                          onValueChange={(value) => updateField(index, { width: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Width</SelectItem>
                            <SelectItem value="half">Half Width</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Label *</Label>
                        <Input
                          value={field.label || ''}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          placeholder="e.g., Full Name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Field Name</Label>
                        <Input
                          value={field.name || ''}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          placeholder="e.g., full_name"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Placeholder</Label>
                      <Input
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                        placeholder="e.g., Enter your name"
                      />
                    </div>

                    {needsOptions(field.field_type || 'text') && (
                      <div className="space-y-1">
                        <Label className="text-xs">Options (one per line)</Label>
                        <Textarea
                          value={(field.options || []).join('\n')}
                          onChange={(e) => updateField(index, { options: e.target.value.split('\n').filter(Boolean) })}
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          rows={4}
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.required || false}
                        onCheckedChange={(checked) => updateField(index, { required: checked })}
                      />
                      <Label className="text-xs">Required field</Label>
                    </div>
                  </div>
                ) : (
                  // Preview Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <div>
                        <p className="text-sm font-medium">
                          {field.label || 'Untitled Field'}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {FIELD_TYPES.find(t => t.value === field.field_type)?.label || 'Text Input'}
                          {field.width === 'half' && ' • Half width'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveField(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveField(index, 'down')}
                        disabled={index === fields.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingFieldIndex(index)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
