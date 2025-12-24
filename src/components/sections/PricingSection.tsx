import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingTier {
  name: string;
  price: string;
  description?: string;
  features: string[];
  cta_text?: string;
  is_featured?: boolean;
}

interface PricingSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, unknown>;
}

export function PricingSection({ title, subtitle, content }: PricingSectionProps) {
  const items = (content.items as PricingTier[]) || [];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {items.map((tier, index) => (
            <div
              key={index}
              className={cn(
                'relative p-8 rounded-lg border bg-card',
                tier.is_featured && 'border-primary shadow-lg ring-1 ring-primary'
              )}
            >
              {tier.is_featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Popular
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
              <div className="text-3xl font-bold mb-2">{tier.price}</div>
              {tier.description && (
                <p className="text-muted-foreground mb-6">{tier.description}</p>
              )}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full"
                variant={tier.is_featured ? 'default' : 'outline'}
              >
                <Link to="/contact">{tier.cta_text || 'Get Started'}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
