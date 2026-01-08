import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface PrimaryCtaBannerSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    headline?: string;
    description?: string;
    button_text?: string;
    button_url?: string;
    secondary_button_text?: string;
    secondary_button_url?: string;
  };
}

export const PrimaryCtaBannerSection = ({ title, subtitle, content }: PrimaryCtaBannerSectionProps) => {
  const headline = content?.headline || title || "Ready to Get Started?";
  const description = content?.description || subtitle || "Join thousands of satisfied customers and transform your business today.";
  const buttonText = content?.button_text || "Get Started Now";
  const buttonUrl = content?.button_url || "/contact";

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-primary/80">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {headline}
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to={buttonUrl}>
                  {buttonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {content?.secondary_button_text && content?.secondary_button_url && (
                <Button size="lg" variant="outline" className="border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
                  <Link to={content.secondary_button_url}>
                    {content.secondary_button_text}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
