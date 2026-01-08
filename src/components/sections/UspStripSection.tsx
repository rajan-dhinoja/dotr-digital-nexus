import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface UspItem {
  icon?: string;
  text: string;
}

interface UspStripSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: UspItem[];
    background_color?: string;
  };
}

export const UspStripSection = ({ content }: UspStripSectionProps) => {
  const items = content?.items || [
    { icon: "Zap", text: "Fast Delivery" },
    { icon: "Shield", text: "100% Secure" },
    { icon: "Award", text: "Award Winning" },
    { icon: "HeadphonesIcon", text: "24/7 Support" },
  ];

  const getIcon = (iconName: string): LucideIcon => {
    const icon = (Icons as unknown as Record<string, LucideIcon>)[iconName];
    return icon || Icons.Star;
  };

  return (
    <section className="py-4 bg-primary text-primary-foreground">
      <ScrollReveal>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {items.map((item, index) => {
              const IconComponent = getIcon(item.icon || "Star");
              return (
                <div key={index} className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
