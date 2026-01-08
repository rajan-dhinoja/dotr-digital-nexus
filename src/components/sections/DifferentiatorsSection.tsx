import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { Check, X } from "lucide-react";

interface DifferentiatorItem {
  feature: string;
  us: boolean | string;
  competitors?: boolean | string;
}

interface DifferentiatorsSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: DifferentiatorItem[];
    show_comparison?: boolean;
    our_label?: string;
    competitor_label?: string;
  };
}

export const DifferentiatorsSection = ({ title, subtitle, content }: DifferentiatorsSectionProps) => {
  const items = content?.items || [
    { feature: "24/7 Premium Support", us: true, competitors: false },
    { feature: "Custom Solutions", us: true, competitors: false },
    { feature: "No Hidden Fees", us: true, competitors: false },
    { feature: "Money-Back Guarantee", us: true, competitors: false },
    { feature: "Dedicated Account Manager", us: true, competitors: false },
  ];

  const showComparison = content?.show_comparison !== false;
  const ourLabel = content?.our_label || "Us";
  const competitorLabel = content?.competitor_label || "Others";

  const renderValue = (value: boolean | string) => {
    if (typeof value === "string") return <span className="text-sm">{value}</span>;
    return value ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-red-400" />
    );
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title || "Why Choose Us"}
            </h2>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="max-w-2xl mx-auto">
            {showComparison ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-3 bg-muted/50 p-4 font-semibold">
                  <div>Feature</div>
                  <div className="text-center text-primary">{ourLabel}</div>
                  <div className="text-center text-muted-foreground">{competitorLabel}</div>
                </div>
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-3 p-4 border-t border-border items-center">
                    <div>{item.feature}</div>
                    <div className="flex justify-center">{renderValue(item.us)}</div>
                    <div className="flex justify-center">{renderValue(item.competitors || false)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item.feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
