import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { CheckCircle, ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface BenefitItem {
  title: string;
  description?: string;
  icon?: string;
}

interface OutcomesBenefitsSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: BenefitItem[];
    layout?: "grid" | "list";
  };
}

export const OutcomesBenefitsSection = ({ title, subtitle, content }: OutcomesBenefitsSectionProps) => {
  const items = content?.items || [
    { title: "Increased Efficiency", description: "Automate repetitive tasks and focus on growth", icon: "Zap" },
    { title: "Better Customer Experience", description: "Delight users with seamless interactions", icon: "Heart" },
    { title: "Higher Revenue", description: "Convert more leads and retain customers", icon: "TrendingUp" },
    { title: "Competitive Edge", description: "Stay ahead with cutting-edge technology", icon: "Target" },
  ];

  const layout = content?.layout || "grid";

  const getIcon = (iconName: string): LucideIcon => {
    const icon = (Icons as unknown as Record<string, LucideIcon>)[iconName];
    return icon || CheckCircle;
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title || "What You'll Achieve"}
            </h2>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </ScrollReveal>

        {layout === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => {
              const IconComponent = getIcon(item.icon || "CheckCircle");
              return (
                <ScrollReveal key={index} delay={index * 100}>
                  <div className="p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow h-full">
                    <IconComponent className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {items.map((item, index) => (
              <ScrollReveal key={index} delay={index * 50}>
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
