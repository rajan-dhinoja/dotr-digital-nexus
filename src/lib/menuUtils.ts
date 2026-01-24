import { 
  Globe, 
  Smartphone, 
  Palette, 
  Megaphone, 
  Shield, 
  Monitor, 
  ShoppingCart,
  Code,
  Layout,
  Settings,
  Zap,
  Building,
  LucideIcon,
  // Additional common icons
  Briefcase,
  Users,
  FileText,
  Image,
  Video,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Star,
  Heart,
  Target,
  Rocket,
  TrendingUp,
  Database,
  Cpu,
  BarChart,
  Lightbulb,
  Award,
  Workflow,
  Search,
  PenTool,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

// Extended icon map for menu items
export const menuIconMap: Record<string, LucideIcon> = {
  // Original icons
  Globe,
  Smartphone,
  Palette,
  Megaphone,
  Shield,
  Monitor,
  ShoppingCart,
  Code,
  Layout,
  Settings,
  Zap,
  Building,
  // Additional icons
  Briefcase,
  Users,
  FileText,
  Image,
  Video,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Star,
  Heart,
  Target,
  Rocket,
  TrendingUp,
  Database,
  Cpu,
  BarChart,
  Lightbulb,
  Award,
  Workflow,
  Search,
  PenTool,
  // Lowercase variants for flexibility
  globe: Globe,
  smartphone: Smartphone,
  palette: Palette,
  megaphone: Megaphone,
  shield: Shield,
  monitor: Monitor,
  shoppingcart: ShoppingCart,
  shopping_cart: ShoppingCart,
  code: Code,
  layout: Layout,
  settings: Settings,
  zap: Zap,
  building: Building,
  briefcase: Briefcase,
  users: Users,
  filetext: FileText,
  file_text: FileText,
  image: Image,
  video: Video,
  mail: Mail,
  phone: Phone,
  mappin: MapPin,
  map_pin: MapPin,
  calendar: Calendar,
  clock: Clock,
  checkcircle: CheckCircle,
  check_circle: CheckCircle,
  arrowright: ArrowRight,
  arrow_right: ArrowRight,
  chevronright: ChevronRight,
  chevron_right: ChevronRight,
  star: Star,
  heart: Heart,
  target: Target,
  rocket: Rocket,
  trendingup: TrendingUp,
  trending_up: TrendingUp,
  database: Database,
  cpu: Cpu,
  barchart: BarChart,
  bar_chart: BarChart,
  lightbulb: Lightbulb,
  light_bulb: Lightbulb,
  award: Award,
  workflow: Workflow,
  search: Search,
  pentool: PenTool,
  pen_tool: PenTool,
} as const;

export type MenuItem = Tables<"menu_items">;

export interface MenuItemWithChildren extends MenuItem {
  children?: MenuItemWithChildren[];
}

export interface MegaMenuLink {
  title: string;
  href: string;
  description?: string;
  iconName?: string;
  icon?: LucideIcon;
}

export interface MegaMenuSection {
  title: string;
  href?: string;
  description?: string;
  iconName?: string;
  icon?: LucideIcon;
  items?: MegaMenuLink[];
}

export interface MegaMenuDefinition {
  summaryTitle: string;
  summaryText: string;
  ctaLabel?: string;
  ctaHref?: string;
  sections: MegaMenuSection[];
}

/**
 * Resolves an icon name string to a Lucide icon component
 * @param iconName - The icon name (case-insensitive, supports kebab-case and snake_case)
 * @returns The Lucide icon component or null if not found
 */
export function resolveIcon(iconName: string | null | undefined): LucideIcon | null {
  if (!iconName) return null;
  
  // Try exact match first
  if (menuIconMap[iconName]) {
    return menuIconMap[iconName];
  }
  
  // Try case-insensitive match
  const normalized = iconName
    .replace(/[-_]/g, '')
    .toLowerCase();
  
  for (const [key, icon] of Object.entries(menuIconMap)) {
    if (key.replace(/[-_]/g, '').toLowerCase() === normalized) {
      return icon;
    }
  }
  
  return null;
}

/**
 * Validates if an icon name exists in the icon map
 */
export function isValidIconName(iconName: string | null | undefined): boolean {
  return resolveIcon(iconName) !== null;
}

/**
 * Gets a list of all available icon names for the admin panel
 */
export function getAvailableIconNames(): string[] {
  return Object.keys(menuIconMap).filter(key => 
    !key.includes('_') && !key.includes('-') && key[0] === key[0].toUpperCase()
  );
}

/**
 * Transforms a flat list of menu items into a tree structure
 */
export function buildMenuTree(items: MenuItem[]): MenuItemWithChildren[] {
  const byId = new Map<string, MenuItemWithChildren>();
  
  // Create map of all items
  items.forEach((item) => {
    byId.set(item.id, { ...item, children: [] });
  });
  
  const roots: MenuItemWithChildren[] = [];
  
  // Build tree structure
  byId.forEach((item) => {
    if (item.parent_id && byId.has(item.parent_id)) {
      const parent = byId.get(item.parent_id)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(item);
    } else {
      roots.push(item);
    }
  });
  
  // Sort recursively by display_order
  const sortRecursive = (nodes: MenuItemWithChildren[]) => {
    nodes.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortRecursive(node.children);
      }
    });
  };
  
  sortRecursive(roots);
  
  return roots;
}

/**
 * Transforms a menu item tree into a MegaMenuDefinition structure
 * Expects a 3-level hierarchy: top-level (level 0) -> categories (level 1) -> items (level 2)
 * @param topLevelItem - The top-level menu item with children
 * @param pagesMap - Optional map of page_id to page slug for URL resolution
 */
export function transformToMegaMenu(
  topLevelItem: MenuItemWithChildren,
  pagesMap?: Map<string, string>
): MegaMenuDefinition | null {
  // Validate that this is a top-level item
  const itemLevel = topLevelItem.item_level ?? 0;
  if (itemLevel !== 0) {
    return null;
  }

  // Check if it's a mega menu type OR has children that could form a mega menu structure
  const isMegaType = topLevelItem.menu_type === 'mega';
  const hasChildren = topLevelItem.children && topLevelItem.children.length > 0;
  
  // If not explicitly mega type and no children, return null
  if (!isMegaType && !hasChildren) {
    return null;
  }
  
  // Get summary data
  const summaryTitle = topLevelItem.mega_summary_title || topLevelItem.label;
  const summaryText = topLevelItem.mega_summary_text || topLevelItem.description || '';
  const ctaLabel = topLevelItem.mega_cta_label || undefined;
  const ctaHref = topLevelItem.mega_cta_href || topLevelItem.url || undefined;
  
  // Get categories (level 1 children, or any direct children if levels aren't set)
  const categories = (topLevelItem.children || []).filter(
    child => {
      const childLevel = child.item_level ?? (hasChildren ? 1 : 0);
      return childLevel === 1 && child.is_active !== false;
    }
  );
  
  // If no level 1 children but we have direct children, treat them as categories
  const effectiveCategories = categories.length > 0 
    ? categories 
    : (topLevelItem.children || []).filter(child => child.is_active !== false);
  
  // Helper to resolve URL from page_id or use direct URL
  const resolveUrl = (item: MenuItem): string => {
    if (item.url) {
      return item.url;
    }
    if (item.page_id && pagesMap) {
      const slug = pagesMap.get(item.page_id);
      if (slug) {
        return `/${slug}`;
      }
    }
    return '#';
  };
  
  // Transform categories into sections
  const sections: MegaMenuSection[] = effectiveCategories.map((category) => {
    // Get items within this category (level 2 children, or direct children if levels aren't set)
    const categoryLevel = category.item_level ?? 1;
    const items = (category.children || []).filter(
      item => {
        const itemLevel = item.item_level ?? (category.children?.length ? 2 : 1);
        return itemLevel === 2 && item.is_active !== false;
      }
    );
    
    // Transform items
    const menuItems: MegaMenuLink[] = items.map((item) => {
      const href = resolveUrl(item);
      const icon = resolveIcon(item.icon_name || undefined);
      
      return {
        title: item.label,
        href,
        description: item.description || undefined,
        iconName: item.icon_name || undefined,
        icon: icon || undefined,
      };
    });
    
    const categoryIcon = resolveIcon(category.icon_name || undefined);
    
    return {
      title: category.label,
      href: resolveUrl(category),
      description: category.description || undefined,
      iconName: category.icon_name || undefined,
      icon: categoryIcon || undefined,
      items: menuItems.length > 0 ? menuItems : undefined,
    };
  });
  
  return {
    summaryTitle,
    summaryText,
    ctaLabel,
    ctaHref,
    sections: sections.length > 0 ? sections : [],
  };
}

/**
 * Gets the URL for a menu item, handling both page_id and direct URL
 */
export function getMenuItemUrl(item: MenuItem): string {
  if (item.url) {
    return item.url;
  }
  
  if (item.page_id) {
    // In a real implementation, you might want to fetch the page slug
    // For now, return a placeholder that can be resolved later
    return `#page-${item.page_id}`;
  }
  
  return '#';
}

/**
 * Validates menu item data structure
 */
export function validateMenuStructure(items: MenuItem[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const byId = new Map<string, MenuItem>();
  
  items.forEach(item => byId.set(item.id, item));
  
  // Check for circular references
  items.forEach(item => {
    if (item.parent_id) {
      let currentId: string | null = item.parent_id;
      const visited = new Set<string>([item.id]);
      
      while (currentId && byId.has(currentId)) {
        if (visited.has(currentId)) {
          errors.push(`Circular reference detected in menu item: ${item.label}`);
          break;
        }
        visited.add(currentId);
        currentId = byId.get(currentId)?.parent_id || null;
      }
    }
  });
  
  // Validate item levels
  items.forEach(item => {
    if (item.parent_id) {
      const parent = byId.get(item.parent_id);
      if (parent) {
        const expectedLevel = (parent.item_level ?? 0) + 1;
        if (item.item_level !== expectedLevel) {
          errors.push(`Item "${item.label}" has incorrect level. Expected ${expectedLevel}, got ${item.item_level}`);
        }
      }
    } else if (item.item_level !== 0) {
      errors.push(`Top-level item "${item.label}" should have level 0`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
