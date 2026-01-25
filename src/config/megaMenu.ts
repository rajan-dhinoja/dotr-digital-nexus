import { ReactNode } from "react";
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
  LucideIcon
} from "lucide-react";

export interface MegaMenuLink {
  title: string;
  href: string;
  description?: string;
  iconName?: keyof typeof iconMap;
}

export interface MegaMenuSection {
  title: string;
  href?: string;
  description?: string;
  iconName?: keyof typeof iconMap;
  items?: MegaMenuLink[];
}

// Icon map for easy lookup
export const iconMap = {
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
} as const;

export interface MegaMenuDefinition {
  summaryTitle: string;
  summaryText: string;
  ctaLabel?: string;
  ctaHref?: string;
  sections: MegaMenuSection[];
}

// Static config removed - all menu data is now dynamic from the database
export const megaMenuConfig: Record<string, MegaMenuDefinition> = {};

