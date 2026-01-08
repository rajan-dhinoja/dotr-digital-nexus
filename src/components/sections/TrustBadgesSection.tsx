import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { ShieldCheck, Lock, CreditCard, CheckCircle } from "lucide-react";

interface TrustBadge {
  title: string;
  description?: string;
  icon?: string;
  image_url?: string;
}

interface TrustBadgesSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: TrustBadge[];
  };
}

export const TrustBadgesSection = ({ title, content }: TrustBadgesSectionProps) => {
  const items = content?.items || [
    { title: "SSL Secured", description: "256-bit encryption", icon: "Lock" },
    { title: "GDPR Compliant", description: "Data protection", icon: "ShieldCheck" },
    { title: "Secure Payments", description: "PCI DSS certified", icon: "CreditCard" },
    { title: "99.9% Uptime", description: "Guaranteed availability", icon: "CheckCircle" },
  ];

  const iconMap: Record<string, React.ElementType> = {
    ShieldCheck,
    Lock,
    CreditCard,
    CheckCircle,
  };

  return (
    <section className="py-8 bg-muted/20 border-y border-border">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          {title && (
            <h3 className="text-center text-sm uppercase tracking-wider text-muted-foreground mb-6">
              {title}
            </h3>
          )}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {items.map((item, index) => {
              const IconComponent = iconMap[item.icon || "ShieldCheck"] || ShieldCheck;
              return (
                <div key={index} className="flex items-center gap-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="h-10" />
                  ) : (
                    <IconComponent className="h-8 w-8 text-primary" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{item.title}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
