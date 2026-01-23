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
  ChevronRight,
} from "lucide-react";
import type {
  Tables,
  TablesInsert,
} from "@/integrations/supabase/types";

type NavigationMenu = Tables<"navigation_menus">;
type NavigationItem = Tables<"navigation_items">;

interface Page {
  id: string;
  title: string;
  slug: string;
  is_active: boolean | null;
}

interface TreeNode extends NavigationItem {
  children?: TreeNode[];
}

const MENU_TYPES = [
  { value: "header", label: "Header Navigation" },
  { value: "mobile", label: "Mobile Navigation" },
  { value: "footer", label: "Footer Links" },
];

export default function AdminMenus() {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<NavigationMenu | null>(null);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isItemActive, setIsItemActive] = useState(true);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const queryClient = useQueryClient();

  const { data: menus = [], isLoading: menusLoading } = useQuery({
    queryKey: ["admin-navigation-menus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("navigation_menus")
        .select("*")
        .order("type")
        .order("label");
      if (error) throw error;
      return (data ?? []) as NavigationMenu[];
    },
  });

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
    queryKey: ["admin-navigation-items", activeMenuId],
    enabled: !!activeMenuId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .eq("menu_id", activeMenuId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return (data ?? []) as NavigationItem[];
    },
  });

  const buildTree = (items: NavigationItem[]): TreeNode[] => {
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
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
      );
      nodes.forEach((n) => sortRecursive(n.children ?? []));
    };
    sortRecursive(roots);
    return roots;
  };

  const itemsTree = buildTree(flatItems);

  const menuSaveMutation = useMutation({
    mutationFn: async (payload: Partial<NavigationMenu>) => {
      if (editingMenu) {
        const { error } = await supabase
          .from("navigation_menus")
          .update(payload)
          .eq("id", editingMenu.id);
        if (error) throw error;
      } else {
        // Use first active site for now
        const { data: sites, error: sitesError } = await supabase
          .from("sites")
          .select("*")
          .eq("is_active", true)
          .order("created_at")
          .limit(1);
        if (sitesError || !sites || sites.length === 0) {
          throw new Error("No active site found");
        }
        const site = sites[0];
        const insert: TablesInsert<"navigation_menus"> = {
          site_id: site.id,
          locale: "en",
          slug: payload.slug!,
          label: payload.label!,
          type: payload.type ?? "header",
          is_default: payload.is_default ?? false,
          is_active: payload.is_active ?? true,
        };
        const { error } = await supabase
          .from("navigation_menus")
          .insert(insert as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-navigation-menus"],
      });
      setIsMenuDialogOpen(false);
      setEditingMenu(null);
      toast({
        title: editingMenu ? "Menu updated" : "Menu created",
      });
    },
    onError: (e: Error) =>
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      }),
  });

  const itemSaveMutation = useMutation({
    mutationFn: async (payload: Partial<NavigationItem>) => {
      if (!activeMenuId) {
        throw new Error("No active menu selected");
      }

      if (editingItem) {
        const { error } = await supabase
          .from("navigation_items")
          .update(payload)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        // Use first active site for now
        const { data: sites, error: sitesError } = await supabase
          .from("sites")
          .select("*")
          .eq("is_active", true)
          .order("created_at")
          .limit(1);
        if (sitesError || !sites || sites.length === 0) {
          throw new Error("No active site found");
        }
        const site = sites[0];

        const insert: TablesInsert<"navigation_items"> = {
          menu_id: activeMenuId,
          site_id: site.id,
          locale: "en",
          label: payload.label!,
          description: payload.description ?? null,
          icon_key: payload.icon_key ?? null,
          badge_text: payload.badge_text ?? null,
          target_type: payload.target_type ?? "page",
          page_id: payload.page_id ?? null,
          external_url: payload.external_url ?? null,
          entity_type: payload.entity_type ?? null,
          entity_id: payload.entity_id ?? null,
          open_in_new_tab: payload.open_in_new_tab ?? false,
          is_active: payload.is_active ?? true,
          is_visible_desktop: payload.is_visible_desktop ?? true,
          is_visible_mobile: payload.is_visible_mobile ?? true,
          is_mega_root: payload.is_mega_root ?? false,
          layout_variant: payload.layout_variant ?? "simple",
          order_index: payload.order_index ?? 0,
          group_key: payload.group_key ?? null,
          column_index: payload.column_index ?? null,
          source: payload.source ?? "manual",
          source_page_path: payload.source_page_path ?? null,
          auto_sync: payload.auto_sync ?? false,
          parent_id: payload.parent_id ?? null,
        };

        const { error } = await supabase
          .from("navigation_items")
          .insert(insert as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-navigation-items"],
      });
      logActivity({
        action: editingItem ? "update" : "create",
        entity_type: "navigation_item",
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
        .from("navigation_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-navigation-items"],
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
        .from("navigation_items")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-navigation-items"],
      });
    },
  });

  const handleMenuSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const label = form.get("label")?.toString() ?? "";
    const slug = form.get("slug")?.toString() ?? "";
    const type = form.get("type")?.toString() ?? "header";

    if (!label || !slug) {
      toast({
        title: "Validation Error",
        description: "Label and slug are required",
        variant: "destructive",
      });
      return;
    }

    menuSaveMutation.mutate({
      label,
      slug,
      type,
      is_active: true,
    });
  };

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

    const targetType = form.get("target_type")?.toString() ?? "page";
    const pageId = form.get("page_id")?.toString() || null;
    const externalUrl = form.get("external_url")?.toString() || null;

    if (targetType === "page" && !pageId) {
      toast({
        title: "Validation Error",
        description: "Select a page for page-type navigation items",
        variant: "destructive",
      });
      return;
    }

    if (targetType === "external_url" && !externalUrl) {
      toast({
        title: "Validation Error",
        description: "Provide a URL for external navigation items",
        variant: "destructive",
      });
      return;
    }

    const payload: Partial<NavigationItem> = {
      label,
      description: form.get("description")?.toString() || null,
      icon_key: form.get("icon_key")?.toString() || null,
      badge_text: form.get("badge_text")?.toString() || null,
      target_type: targetType,
      page_id: targetType === "page" ? pageId : null,
      external_url: targetType === "external_url" ? externalUrl : null,
      open_in_new_tab:
        form.get("open_in_new_tab")?.toString() === "true" ?? false,
      is_active: isItemActive,
      is_visible_desktop: true,
      is_visible_mobile: true,
      is_mega_root:
        form.get("is_mega_root")?.toString() === "true" ?? false,
      layout_variant: form.get("layout_variant")?.toString() || "simple",
      order_index: Number(form.get("order_index")) || 0,
      group_key: form.get("group_key")?.toString() || null,
      column_index:
        form.get("column_index")?.toString() !== ""
          ? Number(form.get("column_index"))
          : null,
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
                  {item.is_mega_root && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      Mega
                    </span>
                  )}
                  {item.badge_text && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {item.badge_text}
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/70 mt-0.5">
                  {item.target_type === "page"
                    ? `Page link`
                    : item.target_type === "external_url"
                    ? item.external_url
                    : "No link"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.target_type === "external_url" && (
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

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Navigation & Menus</h1>
          <p className="text-muted-foreground">
            Configure header, footer, and mega menu navigation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditingMenu(null);
              setIsMenuDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Menu
          </Button>
          {activeMenuId && (
            <Button
              onClick={() => {
                setEditingItem(null);
                setIsItemActive(true);
                setIsItemDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6">
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Menus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {menusLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading menus...
                </div>
              ) : menus.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No menus yet. Create your first menu.
                </div>
              ) : (
                <div className="space-y-1">
                  {menus.map((menu) => (
                    <button
                      key={menu.id}
                      type="button"
                      onClick={() => setActiveMenuId(menu.id)}
                      className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                        activeMenuId === menu.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{menu.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {menu.type} · {menu.locale}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {!activeMenuId ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                Select a menu on the left or create a new one to start managing
                navigation items.
              </CardContent>
            </Card>
          ) : itemsLoading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                Loading menu items...
              </CardContent>
            </Card>
          ) : flatItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                No items yet. Use &quot;Add Item&quot; to define navigation
                links for this menu.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Menu Structure</h2>
                <p className="text-xs text-muted-foreground">
                  Drag handles are visual only for now; reordering support can
                  be added later.
                </p>
              </div>
              {renderTree(itemsTree)}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMenu ? "Edit Menu" : "Create Menu"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMenuSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input
                name="label"
                defaultValue={editingMenu?.label}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                name="slug"
                defaultValue={editingMenu?.slug}
                required
                maxLength={100}
                placeholder="header-main"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                name="type"
                defaultValue={editingMenu?.type || "header"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {MENU_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={menuSaveMutation.isPending}
            >
              {menuSaveMutation.isPending ? "Saving..." : "Save Menu"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input
                name="label"
                defaultValue={editingItem?.label}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                name="description"
                defaultValue={editingItem?.description ?? ""}
                maxLength={200}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon Key</Label>
                <Input
                  name="icon_key"
                  defaultValue={editingItem?.icon_key ?? ""}
                  placeholder="Optional icon identifier"
                />
              </div>
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input
                  name="badge_text"
                  defaultValue={editingItem?.badge_text ?? ""}
                  placeholder="NEW, SALE, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link Type</Label>
              <Select
                name="target_type"
                defaultValue={editingItem?.target_type ?? "page"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="external_url">External URL</SelectItem>
                  <SelectItem value="none">No link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Page</Label>
              <Select
                name="page_id"
                defaultValue={editingItem?.page_id ?? ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>External URL</Label>
              <Input
                name="external_url"
                defaultValue={editingItem?.external_url ?? ""}
                placeholder="https://example.com or /path"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Layout Variant</Label>
                <Select
                  name="layout_variant"
                  defaultValue={editingItem?.layout_variant ?? "simple"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                    <SelectItem value="mega">Mega Menu Root</SelectItem>
                    <SelectItem value="group">Group / Column</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Column Index (mega)</Label>
                <Input
                  name="column_index"
                  type="number"
                  defaultValue={editingItem?.column_index ?? ""}
                  min={0}
                  max={10}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Group Key</Label>
                <Input
                  name="group_key"
                  defaultValue={editingItem?.group_key ?? ""}
                  placeholder="Optional grouping identifier"
                />
              </div>
              <div className="space-y-2">
                <Label>Order Index</Label>
                <Input
                  name="order_index"
                  type="number"
                  defaultValue={editingItem?.order_index ?? 0}
                  min={0}
                  max={999}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isItemActive}
                onCheckedChange={setIsItemActive}
              />
              <Label htmlFor="is_active">Visible</Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={itemSaveMutation.isPending}
            >
              {itemSaveMutation.isPending ? "Saving..." : "Save Item"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

