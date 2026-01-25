import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  buildMenuTree, 
  transformToMegaMenu, 
  type MenuItem,
  type MegaMenuDefinition 
} from "@/lib/menuUtils";
import { megaMenuConfig } from "@/config/megaMenu";

/**
 * Normalizes an identifier to a key for static config lookup
 * Converts "Services" -> "services", handles slugs, etc.
 */
function normalizeIdentifier(identifier: string): string {
  return identifier.toLowerCase().trim();
}

/**
 * Gets static mega menu config by identifier (with fallback matching)
 */
function getStaticMegaMenu(identifier: string): MegaMenuDefinition | null {
  if (!identifier) return null;
  
  const normalized = normalizeIdentifier(identifier);
  
  // Direct match
  if (megaMenuConfig[normalized]) {
    return megaMenuConfig[normalized];
  }
  
  // Try matching by common variations
  // e.g., "Services" -> "services", "service" -> "services"
  const variations = [
    normalized,
    normalized.replace(/s$/, ''), // Remove trailing 's'
    normalized + 's', // Add trailing 's'
  ];
  
  for (const variation of variations) {
    if (megaMenuConfig[variation]) {
      return megaMenuConfig[variation];
    }
  }
  
  return null;
}

/**
 * Fetches and transforms menu data for a mega menu display
 * Falls back to static config if database doesn't have the menu configured
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
      
      // If no items in database, try static config fallback
      if (!allItems || allItems.length === 0) {
        return getStaticMegaMenu(identifier);
      }

      // Build pages map for URL resolution
      const pagesMap = new Map<string, string>();
      allItems.forEach((item: any) => {
        if (item.page && item.page.slug) {
          pagesMap.set(item.page.id, item.page.slug);
        }
      });

      // Normalize identifier for better matching
      const normalizedIdentifier = normalizeIdentifier(identifier);

      // Find the top-level item by identifier (slug, ID, or label)
      const topLevelItem = allItems.find((item: MenuItem) => {
        // Try to match by ID
        if (item.id === identifier) return true;
        
        // Try to match by label (case-insensitive, normalized)
        const normalizedLabel = normalizeIdentifier(item.label);
        if (normalizedLabel === normalizedIdentifier) return true;
        
        // Try partial match (e.g., "Services" matches "services")
        if (normalizedLabel.includes(normalizedIdentifier) || 
            normalizedIdentifier.includes(normalizedLabel)) {
          return true;
        }
        
        // Try to match by URL slug (extract from URL)
        if (item.url) {
          const urlSlug = item.url.replace(/^\//, "").split("/")[0];
          const normalizedUrlSlug = normalizeIdentifier(urlSlug);
          if (normalizedUrlSlug === normalizedIdentifier || 
              normalizedUrlSlug.includes(normalizedIdentifier) ||
              normalizedIdentifier.includes(normalizedUrlSlug)) {
            return true;
          }
        }
        
        // Try to match by page slug if page_id exists
        if (item.page_id) {
          const page = allItems.find((i: any) => i.id === item.id);
          if (page?.page?.slug) {
            const pageSlug = normalizeIdentifier(page.page.slug);
            if (pageSlug === normalizedIdentifier || 
                pageSlug.includes(normalizedIdentifier) ||
                normalizedIdentifier.includes(pageSlug)) {
              return true;
            }
          }
        }
        
        return false;
      });

      // If not found in database, try static config fallback
      if (!topLevelItem) {
        return getStaticMegaMenu(identifier);
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
      
      // If tree item not found or transformation fails, try static config
      if (!topLevelTreeItem) {
        return getStaticMegaMenu(identifier);
      }

      // Transform to mega menu structure
      const megaMenu = transformToMegaMenu(topLevelTreeItem, pagesMap);
      
      // If transformation returns null or empty, try static config fallback
      if (!megaMenu || !megaMenu.sections || megaMenu.sections.length === 0) {
        return getStaticMegaMenu(identifier);
      }
      
      return megaMenu;
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
