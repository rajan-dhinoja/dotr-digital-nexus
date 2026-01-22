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
  Zap
} from "lucide-react";

export interface MegaMenuLink {
  title: string;
  href: string;
  description?: string;
  icon?: ReactNode;
}

export interface MegaMenuSection {
  title: string;
  href?: string;
  description?: string;
  icon?: ReactNode;
  items?: MegaMenuLink[];
}

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
        icon: <Globe className="h-5 w-5" />,
        items: [
          {
            title: "Web Design & Development",
            href: "/services/web-design-development",
            icon: <Layout className="h-4 w-4" />,
          },
          {
            title: "Custom CMS Development",
            href: "/services/custom-cms-development",
            icon: <Code className="h-4 w-4" />,
          },
          {
            title: "e‑Commerce Website Development",
            href: "/services/ecommerce-website-development",
            icon: <ShoppingCart className="h-4 w-4" />,
          },
          {
            title: "Web Application Development",
            href: "/services/web-application-development",
            icon: <Monitor className="h-4 w-4" />,
          },
          {
            title: "Software Development",
            href: "/services/software-development",
            icon: <Code className="h-4 w-4" />,
          },
        ],
      },
      {
        title: "Digital Experience",
        description: "Delight your users with thoughtful, conversion‑focused experiences.",
        icon: <Palette className="h-5 w-5" />,
        items: [
          {
            title: "UI/UX Design",
            href: "/services/ui-ux-design",
            icon: <Palette className="h-4 w-4" />,
          },
          {
            title: "Website Optimization Services",
            href: "/services/website-optimization",
            icon: <Zap className="h-4 w-4" />,
          },
          {
            title: "Digital Marketing",
            href: "/services/digital-marketing",
            icon: <Megaphone className="h-4 w-4" />,
          },
        ],
      },
      {
        title: "Managed Solutions",
        description: "Reliable long‑term partnership to keep your systems running smoothly.",
        icon: <Settings className="h-5 w-5" />,
        items: [
          {
            title: "Quality Assurance",
            href: "/services/quality-assurance",
            icon: <Shield className="h-4 w-4" />,
          },
          {
            title: "Managed IT Services",
            href: "/services/managed-it-services",
            icon: <Monitor className="h-4 w-4" />,
          },
        ],
      },
    ],
  },
};

