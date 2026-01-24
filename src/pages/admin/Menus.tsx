import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useActivityLog } from "@/hooks/useActivityLog";
import { IconPicker } from "@/components/admin/IconPicker";
import { resolveIcon } from "@/lib/menuUtils";
import {
  Plus,
  GripVertical,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type MenuItem = Tables<"menu_items">;

interface Page {
  id: string;
  title: string;
  slug: string;
  is_active: boolean | null;
}

interface TreeNode extends MenuItem {
  children?: TreeNode[];
}

const MENU_LOCATIONS = [
  { value: "header", label: "Header Navigation" },
  { value: "mobile", label: "Mobile Navigation" },
  { value: "footer", label: "Footer Links" },
];

export default function AdminMenus() {
  const [activeLocation, setActiveLocation] = useState<string>("header");
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isItemActive, setIsItemActive] = useState(true);
  const [menuType, setMenuType] = useState<string>("simple");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [itemLevel, setItemLevel] = useState<number>(0);
  const [iconName, setIconName] = useState<string | null>(null);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const queryClient = useQueryClient();

  const { data: pages = [] } = useQuery({
    queryKey: ["admin-pages-for-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("id, title, slug, is_active")
        .order("title");

      if (error) throw error;
      return data as Page[];
    },
  });

  const { data: flatItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["admin-menu-items", activeLocation],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("menu_location", activeLocation)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MenuItem[];
    },
  });

  const buildTree = (items: MenuItem[]): TreeNode[] => {
    const byId = new Map<string, TreeNode>();
    items.forEach((item) => {
      byId.set(item.id, { ...item, children: [] });
    });
    const roots: TreeNode[] = [];
    byId.forEach((item) => {
      if (item.parent_id && byId.has(item.parent_id)) {
        byId.get(item.parent_id)!.children!.push(item);
      } else {
        roots.push(item);
      }
    });
    const sortRecursive = (nodes: TreeNode[]) => {
      nodes.sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
      );
      nodes.forEach((n) => sortRecursive(n.children ?? []));
    };
    sortRecursive(roots);
    return roots;
  };

  const itemsTree = buildTree(flatItems);

  // Calculate item level based on parent selection
  useEffect(() => {
    if (!selectedParentId) {
      setItemLevel(0);
    } else {
      const parent = flatItems.find(item => item.id === selectedParentId);
      if (parent) {
        const parentLevel = parent.item_level ?? 0;
        setItemLevel(parentLevel + 1);
      } else {
        setItemLevel(0);
      }
    }
  }, [selectedParentId, flatItems]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isItemDialogOpen && editingItem) {
      setMenuType(editingItem.menu_type ?? "simple");
      setSelectedParentId(editingItem.parent_id ?? null);
      setItemLevel(editingItem.item_level ?? 0);
    } else if (!isItemDialogOpen) {
      setMenuType("simple");
      setSelectedParentId(null);
      setItemLevel(0);
    }
  }, [isItemDialogOpen, editingItem]);

  const itemSaveMutation = useMutation({
    mutationFn: async (payload: Partial<MenuItem>) => {
      if (editingItem) {
        const { error } = await supabase
          .from("menu_items")
          .update(payload)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const insert: TablesInsert<"menu_items"> = {
          menu_location: activeLocation,
          label: payload.label!,
          url: payload.url ?? null,
          page_id: payload.page_id ?? null,
          parent_id: payload.parent_id ?? null,
          target: payload.target ?? "_self",
          is_active: payload.is_active ?? true,
          display_order: payload.display_order ?? 0,
        };

        const { error } = await supabase
          .from("menu_items")
          .insert(insert);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-menu-items"],
      });
      logActivity({
        action: editingItem ? "update" : "create",
        entity_type: "menu_item",
        entity_id: editingItem?.id,
        entity_name: editingItem?.label,
      });
      setIsItemDialogOpen(false);
      setEditingItem(null);
      toast({
        title: editingItem ? "Menu item updated" : "Menu item created",
      });
    },
    onError: (e: Error) =>
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      }),
  });

  const itemDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-menu-items"],
      });
      toast({ title: "Menu item deleted" });
    },
  });

  const itemToggleVisibilityMutation = useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-menu-items"],
      });
    },
  });

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const label = form.get("label")?.toString() ?? "";
    if (!label) {
      toast({
        title: "Validation Error",
        description: "Label is required",
        variant: "destructive",
      });
      return;
    }

    const linkType = form.get("link_type")?.toString() ?? "page";
    const pageId = form.get("page_id")?.toString() || null;
    const externalUrl = form.get("url")?.toString() || null;

    if (linkType === "page" && !pageId) {
      toast({
        title: "Validation Error",
        description: "Select a page for page-type navigation items",
        variant: "destructive",
      });
      return;
    }

    if (linkType === "external" && !externalUrl) {
      toast({
        title: "Validation Error",
        description: "Provide a URL for external navigation items",
        variant: "destructive",
      });
      return;
    }

    // Get the URL based on link type
    let url: string | null = null;
    if (linkType === "page" && pageId) {
      const page = pages.find((p) => p.id === pageId);
      url = page ? `/${page.slug}` : null;
    } else if (linkType === "external") {
      url = externalUrl;
    }

    const parentId = form.get("parent_id")?.toString() || null;
    const currentMenuType = form.get("menu_type")?.toString() ?? "simple";
    
    // Calculate item level
    let calculatedLevel = 0;
    if (parentId) {
      const parent = flatItems.find(item => item.id === parentId);
      if (parent) {
        calculatedLevel = (parent.item_level ?? 0) + 1;
      }
    }

    const payload: Partial<MenuItem> = {
      label,
      url,
      page_id: linkType === "page" ? pageId : null,
      target: form.get("target")?.toString() ?? "_self",
      is_active: isItemActive,
      display_order: Number(form.get("display_order")) || 0,
      parent_id: parentId,
      menu_type: currentMenuType,
      item_level: calculatedLevel,
      description: form.get("description")?.toString() || null,
      icon_name: form.get("icon_name")?.toString() || null,
      mega_summary_title: form.get("mega_summary_title")?.toString() || null,
      mega_summary_text: form.get("mega_summary_text")?.toString() || null,
      mega_cta_label: form.get("mega_cta_label")?.toString() || null,
      mega_cta_href: form.get("mega_cta_href")?.toString() || null,
    };

    itemSaveMutation.mutate(payload);
  };

  const getLevelLabel = (level: number | null | undefined) => {
    switch (level) {
      case 0: return "Top";
      case 1: return "Category";
      case 2: return "Item";
      default: return "Unknown";
    }
  };

  const getLevelColor = (level: number | null | undefined) => {
    switch (level) {
      case 0: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 1: return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case 2: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return (
      <div className={depth === 0 ? "space-y-2" : "space-y-1 pl-6"}>
        {nodes.map((item) => {
          const Icon = item.icon_name ? resolveIcon(item.icon_name) : null;
          const level = item.item_level ?? 0;
          const isMega = item.menu_type === "mega";
          
          return (
            <Card key={item.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-foreground/60 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-primary" />}
                    <p className="font-medium truncate">{item.label}</p>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getLevelColor(level))}
                    >
                      {getLevelLabel(level)}
                    </Badge>
                    {isMega && (
                      <Badge variant="secondary" className="text-xs">
                        Mega
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-foreground/70 mt-0.5">
                    {item.url || "No link"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.target === "_blank" && (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      itemToggleVisibilityMutation.mutate({
                        id: item.id,
                        is_active: !item.is_active,
                      })
                    }
                  >
                    {item.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-foreground/60" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingItem(item);
                      setIsItemActive(item.is_active ?? true);
                      setMenuType(item.menu_type ?? "simple");
                      setSelectedParentId(item.parent_id ?? null);
                      setIsItemDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => itemDeleteMutation.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
              {item.children && item.children.length > 0 && (
                <div className="pb-2">{renderTree(item.children, depth + 1)}</div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  // Determine default link type for editing
  const getDefaultLinkType = () => {
    if (!editingItem) return "page";
    if (editingItem.page_id) return "page";
    if (editingItem.url && editingItem.url.startsWith("http")) return "external";
    return "page";
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Navigation & Menus</h1>
          <p className="text-muted-foreground">
            Configure header, footer, and mobile navigation.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setIsItemActive(true);
            setIsItemDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      <Tabs value={activeLocation} onValueChange={setActiveLocation}>
        <TabsList className="mb-4">
          {MENU_LOCATIONS.map((loc) => (
            <TabsTrigger key={loc.value} value={loc.value}>
              {loc.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {MENU_LOCATIONS.map((loc) => (
          <TabsContent key={loc.value} value={loc.value}>
            <Card>
              <CardHeader>
                <CardTitle>{loc.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : itemsTree.length === 0 ? (
                  <p className="text-muted-foreground">
                    No menu items yet. Add one to get started.
                  </p>
                ) : (
                  renderTree(itemsTree)
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                name="label"
                defaultValue={editingItem?.label ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="menu_type">Menu Type</Label>
              <Select 
                name="menu_type" 
                value={menuType}
                onValueChange={setMenuType}
                disabled={itemLevel !== 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select menu type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple Link</SelectItem>
                  <SelectItem value="mega" disabled={itemLevel !== 0}>
                    Mega Menu {itemLevel !== 0 && "(Top-level only)"}
                  </SelectItem>
                </SelectContent>
              </Select>
              {itemLevel !== 0 && (
                <p className="text-xs text-muted-foreground">
                  Mega menus can only be set for top-level items (level 0)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_type">Link Type</Label>
              <Select name="link_type" defaultValue={getDefaultLinkType()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select link type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Internal Page</SelectItem>
                  <SelectItem value="external">External URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="page_id">Page (if internal)</Label>
              <Select name="page_id" defaultValue={editingItem?.page_id ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">External URL (if external)</Label>
              <Input
                id="url"
                name="url"
                placeholder="https://..."
                defaultValue={
                  editingItem?.url?.startsWith("http")
                    ? editingItem.url
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent Item (optional)</Label>
              <Select
                name="parent_id"
                value={selectedParentId ?? ""}
                onValueChange={(value) => setSelectedParentId(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (top level)</SelectItem>
                  {flatItems
                    .filter((item) => item.id !== editingItem?.id)
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label} (Level {item.item_level ?? 0})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current level: {itemLevel} ({getLevelLabel(itemLevel)})
              </p>
            </div>

            {/* Description field - shown for level 1 and 2 items */}
            {(itemLevel === 1 || itemLevel === 2) && (
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description {itemLevel === 1 ? "(Category description)" : "(Item description)"}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingItem?.description ?? ""}
                  placeholder={itemLevel === 1 ? "Describe this category..." : "Describe this item..."}
                />
              </div>
            )}

            {/* Icon picker - shown for level 1 and 2 items */}
            {(itemLevel === 1 || itemLevel === 2) && (
              <div className="space-y-2">
                <Label>Icon</Label>
                <IconPicker
                  value={iconName}
                  onValueChange={setIconName}
                  placeholder="Select an icon..."
                />
                <input
                  type="hidden"
                  id="icon_name"
                  name="icon_name"
                  value={iconName ?? ""}
                />
              </div>
            )}

            {/* Mega menu fields - shown only for level 0 items with menu_type='mega' */}
            {itemLevel === 0 && menuType === "mega" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mega_summary_title">Mega Menu Summary Title</Label>
                  <Input
                    id="mega_summary_title"
                    name="mega_summary_title"
                    defaultValue={editingItem?.mega_summary_title ?? ""}
                    placeholder="e.g., Services"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mega_summary_text">Mega Menu Summary Text</Label>
                  <Textarea
                    id="mega_summary_text"
                    name="mega_summary_text"
                    defaultValue={editingItem?.mega_summary_text ?? ""}
                    placeholder="Describe what this section offers..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mega_cta_label">Call-to-Action Label</Label>
                  <Input
                    id="mega_cta_label"
                    name="mega_cta_label"
                    defaultValue={editingItem?.mega_cta_label ?? ""}
                    placeholder="e.g., Explore More"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mega_cta_href">Call-to-Action Link</Label>
                  <Input
                    id="mega_cta_href"
                    name="mega_cta_href"
                    defaultValue={editingItem?.mega_cta_href ?? ""}
                    placeholder="/services"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="target">Open in</Label>
              <Select
                name="target"
                defaultValue={editingItem?.target ?? "_self"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Same window</SelectItem>
                  <SelectItem value="_blank">New tab</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                defaultValue={editingItem?.display_order ?? 0}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={isItemActive}
                onCheckedChange={setIsItemActive}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsItemDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={itemSaveMutation.isPending}>
                {editingItem ? "Save Changes" : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
