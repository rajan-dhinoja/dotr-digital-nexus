import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ProcessStep {
  step?: number;
  title: string;
  description: string;
  icon?: string;
}

interface ProcessSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, unknown>;
}

export function ProcessSection({ title, subtitle, content }: ProcessSectionProps) {
  const items = ((content as Record<string, unknown>).items as ProcessStep[]) || [];

  const getIcon = (iconName?: string): LucideIcon => {
    if (!iconName) return LucideIcons.ArrowRight;
    const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];
    return Icon || LucideIcons.ArrowRight;
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        {(title || subtitle) && (
          <div className="text-center max-w-2xl mx-auto mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
          
          <div className="space-y-8">
            {items.map((item, index) => {
              const Icon = getIcon(item.icon);
              return (
                <div key={index} className="relative flex gap-6 md:gap-8">
                  <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {item.step || index + 1}
                  </div>
                  <div className="flex-1 pt-3">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
