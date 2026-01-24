import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  buildMenuTree, 
  transformToMegaMenu, 
  type MenuItem,
  type MegaMenuDefinition 
} from "@/lib/menuUtils";

/**
 * Fetches and transforms menu data for a mega menu display
 * @param identifier - Menu item slug, ID, or label to find the top-level mega menu item
 * @param menuLocation - The menu location (e.g., 'header')
 * @param options - Query options including enabled flag for hover-based loading
 */
export function useMegaMenu(
  identifier: string | null | undefined,
  menuLocation: string = "header",
  options?: { 
    enabled?: boolean;
    prefetch?: boolean;
  }
) {
  return useQuery({
    queryKey: ["mega-menu", menuLocation, identifier],
    queryFn: async (): Promise<MegaMenuDefinition | null> => {
      if (!identifier) return null;

      // Fetch all menu items for the location with page data
      const { data: allItems, error } = await supabase
        .from("menu_items")
        .select(`
          *,
          page:pages(id, slug)
        `)
        .eq("menu_location", menuLocation)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      if (!allItems || allItems.length === 0) {
        return null;
      }

      // Build pages map for URL resolution
      const pagesMap = new Map<string, string>();
      allItems.forEach((item: any) => {
        if (item.page && item.page.slug) {
          pagesMap.set(item.page.id, item.page.slug);
        }
      });

      // Find the top-level item by identifier (slug, ID, or label)
      const topLevelItem = allItems.find((item: MenuItem) => {
        // Try to match by ID
        if (item.id === identifier) return true;
        
        // Try to match by label (case-insensitive)
        if (item.label.toLowerCase() === identifier.toLowerCase()) return true;
        
        // Try to match by URL slug (extract from URL)
        if (item.url) {
          const urlSlug = item.url.replace(/^\//, "").split("/")[0];
          if (urlSlug === identifier || urlSlug === identifier.toLowerCase()) return true;
        }
        
        return false;
      });

      if (!topLevelItem) {
        return null;
      }

      // Build the full tree structure
      const tree = buildMenuTree(allItems);
      
      // Find the top-level item in the tree
      const findInTree = (items: typeof tree): typeof tree[0] | null => {
        for (const item of items) {
          if (item.id === topLevelItem.id) {
            return item;
          }
          if (item.children && item.children.length > 0) {
            const found = findInTree(item.children);
            if (found) return found;
          }
        }
        return null;
      };

      const topLevelTreeItem = findInTree(tree);
      
      if (!topLevelTreeItem) {
        return null;
      }

      // Transform to mega menu structure
      return transformToMegaMenu(topLevelTreeItem, pagesMap);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: (options?.enabled ?? true) && !!identifier,
  });
}

/**
 * Hook to fetch mega menu by menu item ID directly
 */
export function useMegaMenuById(
  menuItemId: string | null | undefined,
  menuLocation: string = "header",
  options?: { enabled?: boolean }
) {
  return useMegaMenu(menuItemId, menuLocation, options);
}

/**
 * Hook to fetch mega menu by slug (extracted from URL)
 */
export function useMegaMenuBySlug(
  slug: string | null | undefined,
  menuLocation: string = "header",
  options?: { enabled?: boolean }
) {
  return useMegaMenu(slug, menuLocation, options);
}
