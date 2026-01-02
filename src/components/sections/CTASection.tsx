import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

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
  
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <div className="container relative z-10">
        <div 
          className={cn(
            "max-w-4xl mx-auto text-center",
            "p-12 md:p-16 rounded-3xl",
            "glass-card",
            "transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
          )}
        >
          {/* Decorative sparkle */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>

          <h2 
            className={cn(
              "text-3xl md:text-5xl font-bold mb-4 transition-all duration-700 delay-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="text-gradient">{headline}</span>
          </h2>
          
          {description && (
            <p 
              className={cn(
                "text-lg text-muted-foreground mb-10 max-w-2xl mx-auto transition-all duration-700 delay-200",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              {description}
            </p>
          )}
          
          <div 
            className={cn(
              "flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Button asChild size="lg" variant="gradient" className="group">
              <Link to={primaryCtaLink}>
                {primaryCtaText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            {secondaryCtaText && secondaryCtaLink && (
              <Button asChild variant="outline" size="lg" className="group">
                <Link to={secondaryCtaLink}>
                  {secondaryCtaText}
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
