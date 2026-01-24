import * as LucideIcons from 'lucide-react';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon?: string;
}

interface TimelineSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, unknown>;
}

export function TimelineSection({ title, subtitle, content }: TimelineSectionProps) {
  const items = (content?.items as TimelineItem[]) || [];

  const getIcon = (iconName?: string) => {
    if (!iconName) return LucideIcons.Circle;
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const Icon = icons[iconName];
    return Icon || LucideIcons.Circle;
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />

          {items.map((item, index) => {
            const Icon = getIcon(item.icon);
            const isEven = index % 2 === 0;

            return (
              <div key={index} className={`relative flex items-start mb-12 last:mb-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ml-12 md:ml-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-2">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                  <Icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="hidden md:block flex-1" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
