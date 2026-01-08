import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { AnimatedCounter } from "@/components/interactive/AnimatedCounter";

interface KpiItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

interface KpiStripSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: KpiItem[];
    animate?: boolean;
  };
}

export const KpiStripSection = ({ content }: KpiStripSectionProps) => {
  const items = content?.items || [
    { value: 500, suffix: "+", label: "Clients" },
    { value: 98, suffix: "%", label: "Satisfaction" },
    { value: 24, suffix: "/7", label: "Support" },
    { value: 10, suffix: "+", label: "Years" },
  ];
  const animate = content?.animate !== false;

  return (
    <section className="py-6 bg-muted/50">
      <ScrollReveal>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {items.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {item.prefix}
                  {animate ? (
                    <AnimatedCounter end={item.value} duration={2000} />
                  ) : (
                    item.value
                  )}
                  {item.suffix}
                </div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
