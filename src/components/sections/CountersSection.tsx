import { AnimatedCounter } from '@/components/interactive/AnimatedCounter';
import * as LucideIcons from 'lucide-react';

interface CounterItem {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
}

interface CountersSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, unknown>;
}

export function CountersSection({ title, subtitle, content }: CountersSectionProps) {
  const items = (content?.items as CounterItem[]) || [];

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const Icon = icons[iconName];
    return Icon || null;
  };

  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg opacity-80 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, index) => {
            const Icon = getIcon(item.icon);

            return (
              <div key={index} className="text-center">
                {Icon && (
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                )}
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {item.prefix}
                  <AnimatedCounter end={item.value} duration={2000} />
                  {item.suffix}
                </div>
                <p className="text-sm md:text-base opacity-80">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
