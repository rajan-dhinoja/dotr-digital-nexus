import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ImageTextSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, unknown>;
}

export function ImageTextSection({ title, subtitle, content }: ImageTextSectionProps) {
  const imageUrl = (content?.image_url as string) || '';
  const description = (content?.description as string) || '';
  const imagePosition = (content?.image_position as string) || 'left';
  const ctaText = (content?.cta_text as string) || '';
  const ctaLink = (content?.cta_link as string) || '';

  const isImageLeft = imagePosition === 'left';

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${!isImageLeft ? 'lg:flex-row-reverse' : ''}`}>
          <ScrollReveal delay={isImageLeft ? 0 : 0.2}>
            <div className={`${!isImageLeft ? 'lg:order-2' : ''}`}>
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt={title || 'Section image'}
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none" />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={isImageLeft ? 0.2 : 0}>
            <div className={`${!isImageLeft ? 'lg:order-1' : ''}`}>
              {subtitle && (
                <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">
                  {subtitle}
                </p>
              )}
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {description}
                </p>
              )}
              {ctaText && ctaLink && (
                <Button asChild size="lg">
                  <Link to={ctaLink}>
                    {ctaText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
