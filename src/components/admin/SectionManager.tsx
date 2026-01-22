import { useState, lazy, Suspense, createElement } from 'react';
import { Plus, GripVertical, Trash2, Edit2, ChevronDown, ChevronUp, Layers, Star, Zap, Settings, Users, Quote, HelpCircle, Phone, Image, DollarSign, Clock, TrendingUp, BarChart, FileText, Copy, ClipboardPaste } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSectionClipboard } from '@/contexts/SectionClipboardContext';
import { 
  useSectionTypes, 
  useAdminPageSections, 
  usePageSectionMutations,
  PageSection,
  SectionType 
} from '@/hooks/usePageSections';
import { SectionJsonEditor } from '@/components/admin/SectionJsonEditor';

interface SectionManagerProps {
  pageType: string;
  entityId?: string;
  maxSections?: number;
}

export function SectionManager({ pageType, entityId, maxSections = 10 }: SectionManagerProps) {
  const { toast } = useToast();
  const { copiedSection, copySection, clearClipboard } = useSectionClipboard();
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [jsonIsValid, setJsonIsValid] = useState(true);

  const { data: sectionTypes = [] } = useSectionTypes(pageType);
  const { data: sections = [], isLoading } = useAdminPageSections(pageType, entityId);
  const { saveMutation, deleteMutation, reorderMutation } = usePageSectionMutations(pageType, entityId);

  // Static icon map to avoid importing entire lucide-react library
  const iconMap: Record<string, LucideIcon> = {
    Layers, Star, Zap, Settings, Users, Quote, HelpCircle, Phone, Image, DollarSign, Clock, TrendingUp, BarChart, Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronUp, FileText, Copy, ClipboardPaste
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

    // If JSON view is active and invalid, prevent save
    if (activeTab === 'json' && !jsonIsValid) {
      toast({
        title: 'Validation Error',
        description: 'Please fix JSON validation errors before saving',
        variant: 'destructive',
      });
      return;
    }

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
        setActiveTab('form'); // Reset to form view
      },
      onError: (error: Error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  // Handle JSON content change from JSON editor
  const handleJsonContentChange = (content: Record<string, unknown>) => {
    if (!editingSection) return;
    
    setEditingSection({
      ...editingSection,
      content: content as PageSection['content'],
    });
  };

  // Sync form data to JSON when switching to JSON tab
  const handleTabChange = (value: string) => {
    if (value === 'json' && editingSection) {
      // When switching to JSON tab, we need to ensure JSON editor has latest form data
      // The JSON editor already reads from section.content, so this should be fine
      // But we trigger a re-render by updating the section
      setEditingSection({ ...editingSection });
    }
    setActiveTab(value as 'form' | 'json');
  };

  // Reset tab when opening/closing dialog
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setEditingSection(null);
      setActiveTab('form');
      setJsonIsValid(true);
    }
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

  const handleCopySection = (section: PageSection) => {
    copySection(section);
    toast({
      title: 'Section copied',
      description: `"${section.title || section.section_type}" copied to clipboard. Navigate to another page to paste.`,
    });
  };

  const handlePasteSection = () => {
    if (!copiedSection) return;
    if (sections.length >= maxSections) {
      toast({
        title: 'Limit Reached',
        description: `Maximum ${maxSections} sections allowed.`,
        variant: 'destructive',
      });
      return;
    }

    const data: Partial<PageSection> = {
      section_type: copiedSection.section_type,
      title: copiedSection.title ? `${copiedSection.title} (copy)` : null,
      subtitle: copiedSection.subtitle,
      content: copiedSection.content,
      display_order: sections.length,
      is_active: copiedSection.is_active,
    };

    saveMutation.mutate(data, {
      onSuccess: () => {
        toast({ 
          title: 'Section pasted',
          description: `Section from "${copiedSection.sourcePageType}" page has been added.`,
        });
        clearClipboard();
      },
      onError: (error: Error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      },
    });
  };

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Loading sections...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold">Page Sections ({sections.length}/{maxSections})</h3>
        <div className="flex items-center gap-2">
          {copiedSection && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handlePasteSection}
              disabled={sections.length >= maxSections || saveMutation.isPending}
            >
              <ClipboardPaste className="h-4 w-4 mr-2" /> 
              Paste "{copiedSection.title || copiedSection.section_type}"
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={handleAddSection}
            disabled={sections.length >= maxSections}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Section
          </Button>
        </div>
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
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === sections.length - 1}
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopySection(section)}
                        title="Copy section"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingSection(section)}
                        title="Edit section"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(section.id)}
                        title="Delete section"
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
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Section Type</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 pr-2">
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
      <Dialog open={!!editingSection} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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

              {/* Tabs for Form/JSON views */}
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="form">Form View</TabsTrigger>
                  <TabsTrigger value="json">JSON View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="form" className="space-y-4 mt-4">
                  {/* Content fields based on section type */}
                  <SectionContentEditor section={editingSection} />
                </TabsContent>
                
                <TabsContent value="json" className="space-y-4 mt-4">
                  <SectionJsonEditor
                    section={editingSection}
                    sectionType={getSectionTypeInfo(editingSection.section_type)}
                    onContentChange={handleJsonContentChange}
                    onValidationChange={setJsonIsValid}
                  />
                </TabsContent>
              </Tabs>

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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={saveMutation.isPending || (activeTab === 'json' && !jsonIsValid)}
              >
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
          {/* Shared headline/description + CTA fields for hero/cta */} 
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

    case 'logo-cloud':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Logos</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Logo
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Logo {index + 1}</Label>
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
                    placeholder="Logo URL"
                    value={(item.logo_url as string) || ''}
                    onChange={(e) => updateItem(index, 'logo_url', e.target.value)}
                  />
                  <Input
                    placeholder="Name"
                    value={(item.name as string) || ''}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Link (optional)"
                    value={(item.link as string) || ''}
                    onChange={(e) => updateItem(index, 'link', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'services-grid':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Services</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Service
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Service {index + 1}</Label>
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
                    placeholder="Icon name (e.g., Briefcase)"
                    value={(item.icon as string) || ''}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
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
                    placeholder="Link (optional)"
                    value={(item.link as string) || ''}
                    onChange={(e) => updateItem(index, 'link', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'portfolio-grid':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Portfolio Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Item {index + 1}</Label>
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
                    value={(item.image as string) || ''}
                    onChange={(e) => updateItem(index, 'image', e.target.value)}
                  />
                  <Input
                    placeholder="Title"
                    value={(item.title as string) || ''}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                  />
                  <Input
                    placeholder="Category"
                    value={(item.category as string) || ''}
                    onChange={(e) => updateItem(index, 'category', e.target.value)}
                  />
                  <Input
                    placeholder="Link (optional)"
                    value={(item.link as string) || ''}
                    onChange={(e) => updateItem(index, 'link', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'video':
      return (
        <>
          <div className="space-y-2">
            <Label>Video URL</Label>
            <Input name="video_url" defaultValue={(content.video_url as string) || ''} />
          </div>
          <div className="space-y-2">
            <Label>Poster Image URL</Label>
            <Input name="poster_image" defaultValue={(content.poster_image as string) || ''} />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="autoplay"
              checked={content.autoplay === true}
              onCheckedChange={() => {
                // handled on save via form value if needed later
              }}
            />
            <Label htmlFor="autoplay">Autoplay</Label>
          </div>
        </>
      );

    case 'image-text':
      return (
        <>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input name="image_url" defaultValue={(content.image_url as string) || ''} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea name="description" defaultValue={(content.description as string) || ''} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Image Position</Label>
            <Select name="image_position" defaultValue={(content.image_position as string) || 'left'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Image Left</SelectItem>
                <SelectItem value="right">Image Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CTA Text</Label>
              <Input name="cta_text" defaultValue={(content.cta_text as string) || ''} />
            </div>
            <div className="space-y-2">
              <Label>CTA Link</Label>
              <Input name="cta_link" defaultValue={(content.cta_link as string) || ''} />
            </div>
          </div>
        </>
      );

    case 'timeline':
    case 'counters':
      // These use the generic stats-like editor with items already; fall back to stats editor if needed
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Item {index + 1}</Label>
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
                    placeholder="Label / Title"
                    value={(item.label as string) || (item.title as string) || ''}
                    onChange={(e) => {
                      updateItem(index, 'label', e.target.value);
                      updateItem(index, 'title', e.target.value);
                    }}
                  />
                  <Input
                    placeholder="Value (optional)"
                    value={(item.value as string) || ''}
                    onChange={(e) => updateItem(index, 'value', e.target.value)}
                  />
                  <Input
                    placeholder="Suffix (optional, e.g., %, +)"
                    value={(item.suffix as string) || ''}
                    onChange={(e) => updateItem(index, 'suffix', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
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

    case 'divider':
      return (
        <>
          <div className="space-y-2">
            <Label>Style</Label>
            <Select name="style" defaultValue={(content.style as string) || 'line'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="dots">Dots</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="wave">Wave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Width</Label>
              <Select name="width" defaultValue={(content.width as string) || 'full'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="narrow">Narrow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Spacing</Label>
              <Select name="spacing" defaultValue={(content.spacing as string) || 'medium'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      );

    case 'usp-strip':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>USPs</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add USP
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">USP {index + 1}</Label>
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
                    placeholder="Icon name (e.g., Zap)"
                    value={(item.icon as string) || ''}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
                  <Input
                    placeholder="Text"
                    value={(item.text as string) || ''}
                    onChange={(e) => updateItem(index, 'text', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'kpi-strip':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>KPIs</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add KPI
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">KPI {index + 1}</Label>
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
                    placeholder="Value (number)"
                    value={String(item.value ?? '')}
                    onChange={(e) => updateItem(index, 'value', e.target.value)}
                  />
                  <Input
                    placeholder="Label"
                    value={(item.label as string) || ''}
                    onChange={(e) => updateItem(index, 'label', e.target.value)}
                  />
                  <Input
                    placeholder="Prefix (optional)"
                    value={(item.prefix as string) || ''}
                    onChange={(e) => updateItem(index, 'prefix', e.target.value)}
                  />
                  <Input
                    placeholder="Suffix (optional, e.g., %, +)"
                    value={(item.suffix as string) || ''}
                    onChange={(e) => updateItem(index, 'suffix', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'social-proof-bar':
      return (
        <>
          <div className="space-y-2">
            <Label>User Count</Label>
            <Input name="user_count" defaultValue={(content.user_count as string) || ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <Input name="rating" defaultValue={String(content.rating ?? '')} />
            </div>
            <div className="space-y-2">
              <Label>Review Count</Label>
              <Input name="review_count" defaultValue={(content.review_count as string) || ''} />
            </div>
          </div>
        </>
      );

    case 'success-metrics':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Metrics</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Metric
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Metric {index + 1}</Label>
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
                    placeholder="Client (optional)"
                    value={(item.client as string) || ''}
                    onChange={(e) => updateItem(index, 'client', e.target.value)}
                  />
                  <Input
                    placeholder="Metric (e.g., Revenue Growth)"
                    value={(item.metric as string) || ''}
                    onChange={(e) => updateItem(index, 'metric', e.target.value)}
                  />
                  <Input
                    placeholder="Value (e.g., +150%)"
                    value={(item.value as string) || ''}
                    onChange={(e) => updateItem(index, 'value', e.target.value)}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={(item.description as string) || ''}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'awards-badges':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Awards</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Award
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Award {index + 1}</Label>
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
                  <Input
                    placeholder="Organization"
                    value={(item.organization as string) || ''}
                    onChange={(e) => updateItem(index, 'organization', e.target.value)}
                  />
                  <Input
                    placeholder="Year"
                    value={(item.year as string) || ''}
                    onChange={(e) => updateItem(index, 'year', e.target.value)}
                  />
                  <Input
                    placeholder="Image URL (optional)"
                    value={(item.image_url as string) || ''}
                    onChange={(e) => updateItem(index, 'image_url', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'press-mentions':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Press Mentions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Mention
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Mention {index + 1}</Label>
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
                    placeholder="Publication"
                    value={(item.publication as string) || ''}
                    onChange={(e) => updateItem(index, 'publication', e.target.value)}
                  />
                  <Input
                    placeholder="Logo URL (optional)"
                    value={(item.logo_url as string) || ''}
                    onChange={(e) => updateItem(index, 'logo_url', e.target.value)}
                  />
                  <Textarea
                    placeholder="Quote (optional)"
                    value={(item.quote as string) || ''}
                    onChange={(e) => updateItem(index, 'quote', e.target.value)}
                    rows={2}
                  />
                  <Input
                    placeholder="Link (optional)"
                    value={(item.link as string) || ''}
                    onChange={(e) => updateItem(index, 'link', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'ratings-reviews':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Review Platforms</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Platform
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Platform {index + 1}</Label>
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
                    placeholder="Platform Name"
                    value={(item.platform as string) || ''}
                    onChange={(e) => updateItem(index, 'platform', e.target.value)}
                  />
                  <Input
                    placeholder="Rating (e.g., 4.9)"
                    value={String(item.rating ?? '')}
                    onChange={(e) => updateItem(index, 'rating', e.target.value)}
                  />
                  <Input
                    placeholder="Review Count"
                    value={String(item.review_count ?? '')}
                    onChange={(e) => updateItem(index, 'review_count', e.target.value)}
                  />
                  <Input
                    placeholder="Logo URL (optional)"
                    value={(item.logo_url as string) || ''}
                    onChange={(e) => updateItem(index, 'logo_url', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'trust-badges':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Trust Badges</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Badge
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Badge {index + 1}</Label>
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
                    placeholder="Description (optional)"
                    value={(item.description as string) || ''}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                  />
                  <Input
                    placeholder="Icon name (optional, e.g., ShieldCheck)"
                    value={(item.icon as string) || ''}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
                  <Input
                    placeholder="Image URL (optional)"
                    value={(item.image_url as string) || ''}
                    onChange={(e) => updateItem(index, 'image_url', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'differentiators':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Differentiators</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Point
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Point {index + 1}</Label>
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
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'problem-statement':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Problems</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Problem
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Problem {index + 1}</Label>
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
                    placeholder="Description (optional)"
                    value={(item.description as string) || ''}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              </Card>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Empathy Text</Label>
            <Textarea
              name="empathy_text"
              defaultValue={(content.empathy_text as string) || ''}
              rows={2}
            />
          </div>
        </>
      );

    case 'agitate-solve':
      return (
        <>
          <div className="space-y-2">
            <Label>Problem</Label>
            <Textarea
              name="problem"
              defaultValue={(content.problem as string) || ''}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Agitation</Label>
            <Textarea
              name="agitation"
              defaultValue={(content.agitation as string) || ''}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Solution</Label>
            <Textarea
              name="solution"
              defaultValue={(content.solution as string) || ''}
              rows={3}
            />
          </div>
        </>
      );

    case 'value-proposition':
      return (
        <>
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input name="headline" defaultValue={(content.headline as string) || ''} />
          </div>
          <div className="space-y-2">
            <Label>Supporting Points (one per line)</Label>
            <Textarea
              name="supporting_points"
              defaultValue={Array.isArray(content.supporting_points) ? (content.supporting_points as string[]).join('\n') : ''}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CTA Text</Label>
              <Input name="cta_text" defaultValue={(content.cta_text as string) || ''} />
            </div>
            <div className="space-y-2">
              <Label>CTA URL</Label>
              <Input name="cta_url" defaultValue={(content.cta_url as string) || ''} />
            </div>
          </div>
        </>
      );

    case 'elevator-pitch':
      return (
        <>
          <div className="space-y-2">
            <Label>Pitch</Label>
            <Textarea
              name="pitch"
              defaultValue={(content.pitch as string) || ''}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input name="tagline" defaultValue={(content.tagline as string) || ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Author (optional)</Label>
              <Input name="author" defaultValue={(content.author as string) || ''} />
            </div>
            <div className="space-y-2">
              <Label>Author Title (optional)</Label>
              <Input name="author_title" defaultValue={(content.author_title as string) || ''} />
            </div>
          </div>
        </>
      );

    case 'outcomes-benefits':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Benefits</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Benefit
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Benefit {index + 1}</Label>
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
                    placeholder="Description (optional)"
                    value={(item.description as string) || ''}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                  />
                  <Input
                    placeholder="Icon name (optional)"
                    value={(item.icon as string) || ''}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select name="layout" defaultValue={(content.layout as string) || 'grid'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );

    case 'who-its-for':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Personas</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Persona
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Persona {index + 1}</Label>
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
                    placeholder="Persona Name"
                    value={(item.persona as string) || ''}
                    onChange={(e) => updateItem(index, 'persona', e.target.value)}
                  />
                  <Input
                    placeholder="Icon name (optional)"
                    value={(item.icon as string) || ''}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
                  <Textarea
                    placeholder="Description"
                    value={(item.description as string) || ''}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                  />
                  <Textarea
                    placeholder="Benefits (one per line)"
                    value={Array.isArray(item.benefits) ? (item.benefits as string[]).join('\n') : ''}
                    onChange={(e) => updateItem(index, 'benefits', e.target.value.split('\n').filter(Boolean))}
                    rows={3}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'before-after':
      return (
        <>
          <div className="space-y-2">
            <Label>Before Image URL</Label>
            <Input name="before_image" defaultValue={(content.before_image as string) || ''} />
          </div>
          <div className="space-y-2">
            <Label>After Image URL</Label>
            <Input name="after_image" defaultValue={(content.after_image as string) || ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Before Label</Label>
              <Input name="before_label" defaultValue={(content.before_label as string) || ''} />
            </div>
            <div className="space-y-2">
              <Label>After Label</Label>
              <Input name="after_label" defaultValue={(content.after_label as string) || ''} />
            </div>
          </div>
        </>
      );

    case 'video-demo':
      return (
        <>
          <div className="space-y-2">
            <Label>Video URL</Label>
            <Input name="video_url" defaultValue={(content.video_url as string) || ''} />
          </div>
          <div className="space-y-2">
            <Label>Poster Image URL</Label>
            <Input name="poster_image" defaultValue={(content.poster_image as string) || ''} />
          </div>
          {renderItemsInput()}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label>Callouts</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Callout
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Callout {index + 1}</Label>
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
                    placeholder="Time (e.g., 00:45)"
                    value={(item.time as string) || ''}
                    onChange={(e) => updateItem(index, 'time', e.target.value)}
                  />
                  <Textarea
                    placeholder="Text"
                    value={(item.text as string) || ''}
                    onChange={(e) => updateItem(index, 'text', e.target.value)}
                    rows={2}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'screenshot-gallery':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Screenshots</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Screenshot
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Screenshot {index + 1}</Label>
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
                    value={(item.url as string) || ''}
                    onChange={(e) => updateItem(index, 'url', e.target.value)}
                  />
                  <Input
                    placeholder="Caption (optional)"
                    value={(item.caption as string) || ''}
                    onChange={(e) => updateItem(index, 'caption', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="show_captions"
              checked={content.show_captions !== false}
              onCheckedChange={() => {
                // handled on save via form value if needed later
              }}
            />
            <Label htmlFor="show_captions">Show Captions</Label>
          </div>
        </>
      );

    case 'device-frames':
      return (
        <>
          <div className="space-y-2">
            <Label>Device Type</Label>
            <Select name="device_type" defaultValue={(content.device_type as string) || 'iphone'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iphone">iPhone</SelectItem>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {renderItemsInput()}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label>Screenshots</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Screenshot
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Screenshot {index + 1}</Label>
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
                    value={(item.url as string) || (item as string)}
                    onChange={(e) => updateItem(index, 'url', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'feature-list':
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
                    placeholder="Text"
                    value={(item.text as string) || ''}
                    onChange={(e) => updateItem(index, 'text', e.target.value)}
                  />
                  <Input
                    placeholder="Icon name (optional)"
                    value={(item.icon as string) || ''}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Columns</Label>
            <Select name="columns" defaultValue={String(content.columns ?? 2)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Column</SelectItem>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );

    case 'feature-highlights':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Feature Highlights</Label>
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
                    placeholder="Image URL"
                    value={(item.image_url as string) || ''}
                    onChange={(e) => updateItem(index, 'image_url', e.target.value)}
                  />
                  <Input
                    placeholder="Icon name (optional)"
                    value={(item.icon as string) || ''}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
                  <Textarea
                    placeholder="Bullets (one per line, optional)"
                    value={Array.isArray(item.bullets) ? (item.bullets as string[]).join('\n') : ''}
                    onChange={(e) => updateItem(index, 'bullets', e.target.value.split('\n').filter(Boolean))}
                    rows={3}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      );

    case 'primary-cta-banner':
      return (
        <>
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input name="headline" defaultValue={(content.headline as string) || ''} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              defaultValue={(content.description as string) || ''}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Button Text</Label>
              <Input name="button_text" defaultValue={(content.button_text as string) || ''} />
            </div>
            <div className="space-y-2">
              <Label>Primary Button URL</Label>
              <Input name="button_url" defaultValue={(content.button_url as string) || ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label>Secondary Button Text (optional)</Label>
              <Input
                name="secondary_button_text"
                defaultValue={(content.secondary_button_text as string) || ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary Button URL (optional)</Label>
              <Input
                name="secondary_button_url"
                defaultValue={(content.secondary_button_url as string) || ''}
              />
            </div>
          </div>
        </>
      );

    case 'secondary-cta':
      return (
        <>
          <div className="space-y-2">
            <Label>Text</Label>
            <Textarea
              name="text"
              defaultValue={(content.text as string) || ''}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input name="button_text" defaultValue={(content.button_text as string) || ''} />
            </div>
            <div className="space-y-2">
              <Label>Button URL</Label>
              <Input name="button_url" defaultValue={(content.button_url as string) || ''} />
            </div>
          </div>
        </>
      );

    case 'exit-intent-cta':
      return (
        <>
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input name="headline" defaultValue={(content.headline as string) || ''} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              defaultValue={(content.description as string) || ''}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input name="button_text" defaultValue={(content.button_text as string) || ''} />
            </div>
            <div className="space-y-2">
              <Label>Button URL</Label>
              <Input name="button_url" defaultValue={(content.button_url as string) || ''} />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <Label>Show After Scroll (%)</Label>
            <Input
              name="show_after_scroll"
              defaultValue={String(content.show_after_scroll ?? 50)}
            />
          </div>
          <div className="space-y-2">
            <Label>Offer Text (optional)</Label>
            <Input name="offer_text" defaultValue={(content.offer_text as string) || ''} />
          </div>
        </>
      );

    case 'about-us':
      return (
        <>
          <div className="space-y-2">
            <Label>Story</Label>
            <Textarea
              name="story"
              defaultValue={(content.story as string) || ''}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Mission</Label>
            <Textarea
              name="mission"
              defaultValue={(content.mission as string) || ''}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Vision (optional)</Label>
            <Textarea
              name="vision"
              defaultValue={(content.vision as string) || ''}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label>Founder Image URL (optional)</Label>
              <Input
                name="founder_image"
                defaultValue={(content.founder_image as string) || ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Founded Year (optional)</Label>
              <Input
                name="founded_year"
                defaultValue={(content.founded_year as string) || ''}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label>Founder Name (optional)</Label>
              <Input
                name="founder_name"
                defaultValue={(content.founder_name as string) || ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Founder Title (optional)</Label>
              <Input
                name="founder_title"
                defaultValue={(content.founder_title as string) || ''}
              />
            </div>
          </div>
        </>
      );

    case 'values-culture':
      return (
        <>
          {renderItemsInput()}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Values</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Value
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Value {index + 1}</Label>
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
                    placeholder="Icon name (optional)"
                    value={(item.icon as string) || ''}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Culture Text (optional)</Label>
            <Textarea
              name="culture_text"
              defaultValue={(content.culture_text as string) || ''}
              rows={3}
            />
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
