import { Quote } from 'lucide-react';

interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  image?: string;
}

interface TestimonialsSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, unknown>;
}

export function TestimonialsSection({ title, subtitle, content }: TestimonialsSectionProps) {
  const items = (content.items as TestimonialItem[]) || [];

  return (
    <section className="py-16 md:py-24">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border bg-card"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <p className="text-muted-foreground mb-6 italic">"{item.quote}"</p>
              <div className="flex items-center gap-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {item.author.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold">{item.author}</p>
                  {(item.role || item.company) && (
                    <p className="text-sm text-muted-foreground">
                      {item.role}{item.role && item.company && ' at '}{item.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
