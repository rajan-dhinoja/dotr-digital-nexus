import { AnimatedCounter } from '@/components/interactive/AnimatedCounter';

interface StatItem {
  value: string;
  label: string;
  suffix?: string;
}

interface StatsSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, unknown>;
}

export function StatsSection({ title, subtitle, content }: StatsSectionProps) {
  const items = (content.items as StatItem[]) || [];

  const parseValue = (value: string): number => {
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container">
        {(title || subtitle) && (
          <div className="text-center max-w-2xl mx-auto mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className="text-lg opacity-90">{subtitle}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedCounter end={parseValue(item.value)} duration={2000} />
                {item.suffix || (item.value.includes('+') ? '+' : '')}
              </div>
              <p className="text-lg opacity-90">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
