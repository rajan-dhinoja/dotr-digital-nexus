import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, unknown>;
}

export function HeroSection({ title, subtitle, content }: HeroSectionProps) {
  const headline = (content.headline as string) || title || 'Welcome';
  const description = (content.subtitle as string) || subtitle || '';
  const ctaText = (content.cta_text as string) || 'Get Started';
  const ctaLink = (content.cta_link as string) || '/contact';
  const backgroundImage = content.background_image as string;

  return (
    <section
      className="relative py-20 md:py-32 overflow-hidden"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {headline}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              {description}
            </p>
          )}
          <Button asChild size="lg">
            <Link to={ctaLink}>
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
