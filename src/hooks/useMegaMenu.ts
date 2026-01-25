import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  buildMenuTree, 
  transformToMegaMenu, 
  type MenuItem,
  type MegaMenuDefinition 
} from "@/lib/menuUtils";

/**
 * Normalizes an identifier for matching
 * Converts "Services" -> "services", handles slugs, etc.
 */
function normalizeIdentifier(identifier: string): string {
  return identifier.toLowerCase().trim();
}

/**
 * Fetches and transforms menu data for a mega menu display from the database
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
      if (!identifier) {
        console.log('[useMegaMenu] No identifier provided');
        return null;
      }

      console.log('[useMegaMenu] Fetching mega menu for identifier:', identifier, 'location:', menuLocation);

      // Fetch all menu items for the location with page data
      let allItems = null;
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select(`
            *,
            page:pages(id, slug)
          `)
          .eq("menu_location", menuLocation)
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) {
          console.error('[useMegaMenu] Database error:', error);
          throw error;
        }
        
        allItems = data;
      } catch (err) {
        console.error('[useMegaMenu] Exception fetching from database:', err);
        throw err;
      }
      
      console.log('[useMegaMenu] Database items found:', allItems?.length || 0);
      
      // If no items in database, return null (no static fallback)
      if (!allItems || allItems.length === 0) {
        console.log('[useMegaMenu] No database items found for:', identifier);
        return null;
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
        // Must be top-level (level 0) and active
        const itemLevel = item.item_level ?? 0;
        if (itemLevel !== 0 || !item.is_active) return false;
        
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
          const pageItem = allItems.find((i: any) => i.id === item.id);
          if (pageItem?.page?.slug) {
            const pageSlug = normalizeIdentifier(pageItem.page.slug);
            if (pageSlug === normalizedIdentifier || 
                pageSlug.includes(normalizedIdentifier) ||
                normalizedIdentifier.includes(pageSlug)) {
              return true;
            }
          }
        }
        
        return false;
      });

      // If not found in database, return null
      if (!topLevelItem) {
        console.log('[useMegaMenu] Top level item not found in database for:', identifier);
        return null;
      }
      
      console.log('[useMegaMenu] Found top level item in database:', topLevelItem.label);

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
      
      // If tree item not found or transformation fails, return null
      if (!topLevelTreeItem) {
        console.log('[useMegaMenu] Tree item not found for:', identifier);
        return null;
      }

      // Transform to mega menu structure
      const megaMenu = transformToMegaMenu(topLevelTreeItem, pagesMap);
      console.log('[useMegaMenu] Transformed mega menu:', megaMenu ? `found with ${megaMenu.sections?.length || 0} sections` : 'null');
      
      // If transformation returns null or empty, return null
      if (!megaMenu || !megaMenu.sections || megaMenu.sections.length === 0) {
        console.log('[useMegaMenu] Transformation returned empty for:', identifier);
        return null;
      }
      
      console.log('[useMegaMenu] Returning database mega menu with', megaMenu.sections.length, 'sections');
      return megaMenu;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: (options?.enabled ?? true) && !!identifier,
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
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
