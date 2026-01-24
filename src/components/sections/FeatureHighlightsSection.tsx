import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface FeatureHighlight {
  title: string;
  description: string;
  image_url?: string;
  image?: string;
  icon?: string;
  bullets?: string[];
}

interface FeatureHighlightsSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: FeatureHighlight[];
  };
}

export const FeatureHighlightsSection = ({ title, subtitle, content }: FeatureHighlightsSectionProps) => {
  const items = content?.items || [
    {
      title: "Powerful Analytics",
      description: "Get deep insights into your data with our advanced analytics dashboard.",
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      bullets: ["Real-time data", "Custom reports", "Export to CSV"],
    },
    {
      title: "Team Collaboration",
      description: "Work together seamlessly with built-in collaboration tools.",
      image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
      bullets: ["Shared workspaces", "Comments & mentions", "Version history"],
    },
    {
      title: "Enterprise Security",
      description: "Bank-grade security to keep your data safe and compliant.",
      image_url: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=600&q=80",
      bullets: ["SOC 2 Type II", "End-to-end encryption", "SSO support"],
    },
  ];

  const getIcon = (iconName: string): LucideIcon => {
    const icon = (Icons as unknown as Record<string, LucideIcon>)[iconName];
    return icon || Icons.Star;
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <ScrollReveal>
            <div className="text-center mb-16">
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              )}
              {subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          </ScrollReveal>
        )}

        <div className="space-y-16 md:space-y-24">
          {items.map((item, index) => {
            const isEven = index % 2 === 1;
            const IconComponent = item.icon ? getIcon(item.icon) : null;
            const imgSrc = item.image_url || item.image;

            return (
              <ScrollReveal key={index}>
                <div className={`flex flex-col ${isEven ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-12`}>
                  {/* Image */}
                  {imgSrc && (
                    <div className="flex-1 w-full">
                      <div className="rounded-lg overflow-hidden shadow-xl">
                        <img
                          src={imgSrc}
                          alt={item.title}
                          className="w-full aspect-video object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 w-full">
                    {IconComponent && (
                      <IconComponent className="h-10 w-10 text-primary mb-4" />
                    )}
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">{item.title}</h3>
                    <p className="text-lg text-muted-foreground mb-6">{item.description}</p>
                    {item.bullets && item.bullets.length > 0 && (
                      <ul className="space-y-3">
                        {item.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <Icons.Check className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
