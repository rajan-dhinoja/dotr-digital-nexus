import { GlassCard } from "@/components/interactive/GlassCard";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface PersonaItem {
  persona: string;
  icon?: string;
  description: string;
  benefits?: string[];
}

interface WhoItsForSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    personas?: PersonaItem[];
  };
}

export const WhoItsForSection = ({ title, subtitle, content }: WhoItsForSectionProps) => {
  const personas = content?.personas || [
    { 
      persona: "Startups", 
      icon: "Rocket", 
      description: "Move fast and scale efficiently with modern solutions",
      benefits: ["Rapid deployment", "Cost-effective", "Scalable architecture"]
    },
    { 
      persona: "Enterprises", 
      icon: "Building2", 
      description: "Enterprise-grade solutions for complex requirements",
      benefits: ["Custom integrations", "Dedicated support", "Security compliance"]
    },
    { 
      persona: "Agencies", 
      icon: "Users", 
      description: "White-label solutions to expand your service offerings",
      benefits: ["Partner program", "Volume pricing", "Training resources"]
    },
  ];

  const getIcon = (iconName: string): LucideIcon => {
    const icon = (Icons as unknown as Record<string, LucideIcon>)[iconName];
    return icon || Icons.User;
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title || "Who We Serve"}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {personas.map((item, index) => {
            const IconComponent = getIcon(item.icon || "User");
            return (
              <GlassCard key={index} className="p-6 h-full">
                  <IconComponent className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{item.persona}</h3>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  {item.benefits && item.benefits.length > 0 && (
                    <ul className="space-y-2">
                      {item.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Icons.Check className="h-4 w-4 text-primary" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
