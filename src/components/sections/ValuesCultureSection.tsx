import { GlassCard } from "@/components/interactive/GlassCard";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface ValueItem {
  title: string;
  description: string;
  icon?: string;
}

interface ValuesCultureSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: ValueItem[];
    culture_text?: string;
  };
}

export const ValuesCultureSection = ({ title, subtitle, content }: ValuesCultureSectionProps) => {
  const items = content?.items || [
    { title: "Innovation", description: "We constantly push boundaries and embrace new ideas", icon: "Lightbulb" },
    { title: "Integrity", description: "Honesty and transparency in everything we do", icon: "Shield" },
    { title: "Excellence", description: "Committed to delivering the highest quality work", icon: "Star" },
    { title: "Collaboration", description: "Great things happen when we work together", icon: "Users" },
    { title: "Growth", description: "Continuous learning and improvement", icon: "TrendingUp" },
    { title: "Impact", description: "Making a meaningful difference for our clients", icon: "Target" },
  ];

  const cultureText = content?.culture_text;

  const getIcon = (iconName: string): LucideIcon => {
    const icon = (Icons as unknown as Record<string, LucideIcon>)[iconName];
    return icon || Icons.Heart;
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title || "Our Values"}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {items.map((item, index) => {
            const IconComponent = getIcon(item.icon || "Heart");
            return (
              <GlassCard key={index} className="p-6 h-full">
                <IconComponent className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </GlassCard>
            );
          })}
        </div>

        {cultureText && (
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground italic">
              "{cultureText}"
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
