import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ValuePropositionSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    headline?: string;
    supporting_points?: string[];
    cta_text?: string;
    cta_url?: string;
  };
}

export const ValuePropositionSection = ({ title, subtitle, content }: ValuePropositionSectionProps) => {
  const headline = content?.headline || "Transform your business with solutions that actually work.";
  const points = content?.supporting_points || [
    "Save 20+ hours per week on manual tasks",
    "Increase revenue by up to 40%",
    "Get results in weeks, not months",
  ];
  const ctaText = content?.cta_text || "Get Started";
  const ctaUrl = content?.cta_url || "/contact";

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {title && (
            <p className="text-sm uppercase tracking-wider text-primary mb-4">{title}</p>
          )}
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {headline}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground mb-8">
              {subtitle}
            </p>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-8">
            {points.map((point, index) => (
              <div key={index} className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">{point}</span>
              </div>
            ))}
          </div>

          <Button size="lg" asChild>
            <Link to={ctaUrl}>{ctaText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
