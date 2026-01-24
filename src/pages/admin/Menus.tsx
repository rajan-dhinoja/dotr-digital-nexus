import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useActivityLog } from "@/hooks/useActivityLog";
import {
  Plus,
  GripVertical,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

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

    const payload: Partial<MenuItem> = {
      label,
      url,
      page_id: linkType === "page" ? pageId : null,
      target: form.get("target")?.toString() ?? "_self",
      is_active: isItemActive,
      display_order: Number(form.get("display_order")) || 0,
      parent_id: form.get("parent_id")?.toString() || null,
    };

    itemSaveMutation.mutate(payload);
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return (
      <div className={depth === 0 ? "space-y-2" : "space-y-1 pl-6"}>
        {nodes.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-3 flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-foreground/60 cursor-grab" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{item.label}</p>
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
        ))}
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
                defaultValue={editingItem?.parent_id ?? ""}
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
                        {item.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

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
