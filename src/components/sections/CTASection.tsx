import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, unknown>;
}

export function CTASection({ title, subtitle, content }: CTASectionProps) {
  const headline = (content.headline as string) || title || 'Ready to Get Started?';
  const description = (content.description as string) || subtitle || '';
  const primaryCtaText = (content.primary_cta_text as string) || 'Get Started';
  const primaryCtaLink = (content.primary_cta_link as string) || '/contact';
  const secondaryCtaText = content.secondary_cta_text as string;
  const secondaryCtaLink = content.secondary_cta_link as string;

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{headline}</h2>
          {description && (
            <p className="text-lg text-muted-foreground mb-8">{description}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to={primaryCtaLink}>
                {primaryCtaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {secondaryCtaText && secondaryCtaLink && (
              <Button asChild variant="outline" size="lg">
                <Link to={secondaryCtaLink}>{secondaryCtaText}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
