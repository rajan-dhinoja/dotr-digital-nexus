import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { FloatingElements } from '@/components/interactive/FloatingElements';
import { useEffect, useState } from 'react';

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-gradient-radial opacity-60" />
      
      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      {backgroundImage && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}

      {/* Floating decorative elements */}
      <FloatingElements />
      
      <div className="container relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated badge */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">Transforming Ideas into Reality</span>
          </div>

          {/* Main headline with gradient text */}
          <h1 
            className={`text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="block">{headline.split(' ').slice(0, -1).join(' ')}</span>
            <span className="text-gradient">{headline.split(' ').slice(-1)}</span>
          </h1>
          
          {description && (
            <p 
              className={`text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {description}
            </p>
          )}
          
          {/* CTA buttons with micro-interactions */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Button asChild size="xl" variant="gradient" className="group">
              <Link to={ctaLink}>
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="glass" className="group">
              <Link to="/portfolio">
                <Play className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                View Our Work
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div 
            className={`grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-border/30 transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {[
              { value: '50+', label: 'Projects Completed' },
              { value: '100%', label: 'Client Satisfaction' },
              { value: '5+', label: 'Years Experience' },
            ].map((stat, index) => (
              <div 
                key={index}
                className="text-center group cursor-default"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-1 transition-transform duration-300 group-hover:scale-110">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
}
