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

export const megaMenuConfig: Record<string, MegaMenuDefinition> = {
  services: {
    summaryTitle: "Services",
    summaryText:
      "You have come to the right place to get the right solutions to expand, grow and better your business. Explore our full range of digital and technology services.",
    ctaLabel: "Explore More",
    ctaHref: "/services",
    sections: [
      {
        title: "Web Based Solutions",
        description: "Modern, secure and scalable web applications tailored to your business.",
        iconName: "Globe",
        items: [
          {
            title: "Web Design & Development",
            href: "/services/web-design-development",
            iconName: "Layout",
          },
          {
            title: "Custom CMS Development",
            href: "/services/custom-cms-development",
            iconName: "Code",
          },
          {
            title: "e‑Commerce Website Development",
            href: "/services/ecommerce-website-development",
            iconName: "ShoppingCart",
          },
          {
            title: "Web Application Development",
            href: "/services/web-application-development",
            iconName: "Monitor",
          },
          {
            title: "Software Development",
            href: "/services/software-development",
            iconName: "Code",
          },
        ],
      },
      {
        title: "Digital Experience",
        description: "Delight your users with thoughtful, conversion‑focused experiences.",
        iconName: "Palette",
        items: [
          {
            title: "UI/UX Design",
            href: "/services/ui-ux-design",
            iconName: "Palette",
          },
          {
            title: "Website Optimization Services",
            href: "/services/website-optimization",
            iconName: "Zap",
          },
          {
            title: "Digital Marketing",
            href: "/services/digital-marketing",
            iconName: "Megaphone",
          },
        ],
      },
      {
        title: "Managed Solutions",
        description: "Reliable long‑term partnership to keep your systems running smoothly.",
        iconName: "Settings",
        items: [
          {
            title: "Quality Assurance",
            href: "/services/quality-assurance",
            iconName: "Shield",
          },
          {
            title: "Managed IT Services",
            href: "/services/managed-it-services",
            iconName: "Monitor",
          },
        ],
      },
    ],
  },
};

