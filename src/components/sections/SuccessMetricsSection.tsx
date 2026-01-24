import { GlassCard } from "@/components/interactive/GlassCard";
import { TrendingUp, ArrowUpRight } from "lucide-react";

interface MetricItem {
  client?: string;
  metric: string;
  value: string;
  description?: string;
}

interface SuccessMetricsSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: MetricItem[];
  };
}

export const SuccessMetricsSection = ({ title, subtitle, content }: SuccessMetricsSectionProps) => {
  const items = content?.items || [
    { client: "TechCorp", metric: "Revenue Growth", value: "+150%", description: "Increased monthly revenue" },
    { client: "StartupX", metric: "User Acquisition", value: "3x", description: "Tripled user base in 6 months" },
    { client: "EnterpriseCo", metric: "Cost Reduction", value: "-40%", description: "Reduced operational costs" },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title || "Client Success Stories"}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <GlassCard key={index} className="p-6 text-center h-full">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-1">
                {item.value}
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div className="font-semibold mb-1">{item.metric}</div>
              {item.client && (
                <div className="text-sm text-muted-foreground mb-2">— {item.client}</div>
              )}
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};
