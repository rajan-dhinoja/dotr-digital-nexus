import type { NavigationTreeItem } from "./api";

export interface UiNavItem {
  id: string;
  label: string;
  href: string | null;
  description?: string | null;
  iconKey?: string | null;
  badgeText?: string | null;
  isMegaRoot?: boolean;
  layoutVariant?: string | null;
  children?: UiNavItem[];
  columnIndex?: number | null;
  groupKey?: string | null;
  isFeatured?: boolean;
}

export function mapTreeToUi(items: NavigationTreeItem[]): UiNavItem[] {
  return items.map(mapItem);
}

function mapItem(node: NavigationTreeItem): UiNavItem {
  const href =
    node.target_type === "external_url"
      ? node.external_url
      : node.target_type === "page" && node.page_id
      ? null // The frontend can resolve page_id to slug if needed; for now, keep null
      : null;

  return {
    id: node.id,
    label: node.label,
    href,
    description: node.description,
    iconKey: node.icon_key,
    badgeText: node.badge_text,
    isMegaRoot: !!node.is_mega_root || node.layout_variant === "mega",
    layoutVariant: node.layout_variant,
    children: node.children?.map(mapItem) ?? [],
    columnIndex: node.column_index,
    groupKey: node.group_key,
    isFeatured: !!node.is_featured,
  };
}

