import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { Check } from "lucide-react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface FeatureItem {
  text: string;
  icon?: string;
}

interface FeatureListSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: FeatureItem[];
    columns?: 1 | 2 | 3;
  };
}

export const FeatureListSection = ({ title, subtitle, content }: FeatureListSectionProps) => {
  const items = content?.items || [
    { text: "Unlimited projects", icon: "Infinity" },
    { text: "Advanced analytics", icon: "BarChart3" },
    { text: "Priority support", icon: "Headphones" },
    { text: "Custom integrations", icon: "Plug" },
    { text: "Team collaboration", icon: "Users" },
    { text: "API access", icon: "Code" },
  ];

  const columns = content?.columns || 2;

  const getIcon = (iconName: string): LucideIcon => {
    const icon = (Icons as unknown as Record<string, LucideIcon>)[iconName];
    return icon || Check;
  };

  const gridCols = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title || "Everything You Need"}
            </h2>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </ScrollReveal>

        <div className={`max-w-3xl mx-auto grid ${gridCols[columns]} gap-4`}>
          {items.map((item, index) => {
            const IconComponent = getIcon(item.icon || "Check");
            return (
              <ScrollReveal key={index} delay={index * 50}>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
