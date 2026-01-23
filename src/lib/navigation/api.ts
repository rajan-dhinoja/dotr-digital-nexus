import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type NavigationMenuRow = Tables<"navigation_menus">;
export type NavigationItemRow = Tables<"navigation_items">;

export interface NavigationTreeItem extends NavigationItemRow {
  children: NavigationTreeItem[];
}

export interface NavigationMenuWithItems {
  menu: NavigationMenuRow;
  items: NavigationTreeItem[];
}

const DEFAULT_LOCALE = "en";

export async function fetchNavigationMenuTree(
  slug: string,
  options?: { locale?: string }
): Promise<NavigationMenuWithItems | null> {
  const locale = options?.locale ?? DEFAULT_LOCALE;

  // For now, assume single active site and use its id
  const { data: sites, error: sitesError } = await supabase
    .from("sites")
    .select("*")
    .eq("is_active", true)
    .order("created_at")
    .limit(1);

  if (sitesError || !sites || sites.length === 0) {
    return null;
  }

  const site = sites[0];

  const { data: menus, error: menuError } = await supabase
    .from("navigation_menus")
    .select("*")
    .eq("site_id", site.id)
    .eq("locale", locale)
    .eq("slug", slug)
    .eq("is_active", true)
    .limit(1);

  if (menuError || !menus || menus.length === 0) {
    return null;
  }

  const menu = menus[0];

  const { data: items, error: itemsError } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("menu_id", menu.id)
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (itemsError || !items) {
    return { menu, items: [] };
  }

  const tree = buildNavigationTree(items);

  return { menu, items: tree };
}

export function buildNavigationTree(items: NavigationItemRow[]): NavigationTreeItem[] {
  const byId = new Map<string, NavigationTreeItem>();

  items.forEach((item) => {
    byId.set(item.id, { ...item, children: [] });
  });

  const roots: NavigationTreeItem[] = [];

  byId.forEach((item) => {
    if (item.parent_id && byId.has(item.parent_id)) {
      const parent = byId.get(item.parent_id)!;
      parent.children.push(item);
    } else {
      roots.push(item);
    }
  });

  const sortRecursive = (nodes: NavigationTreeItem[]) => {
    nodes.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    nodes.forEach((child) => sortRecursive(child.children));
  };

  sortRecursive(roots);

  return roots;
}

