import { useEffect, useRef, useState } from 'react';
import { 
  Star, Code, Cpu, BarChart, Maximize, Zap, Shield, Users, 
  Target, Rocket, Settings, Globe, Heart, Clock, CheckCircle,
  Lightbulb, TrendingUp, Award, Briefcase, Database
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Static icon map to avoid importing entire lucide library
const iconMap: Record<string, LucideIcon> = {
  Star, Code, Cpu, BarChart, Maximize, Zap, Shield, Users,
  Target, Rocket, Settings, Globe, Heart, Clock, CheckCircle,
  Lightbulb, TrendingUp, Award, Briefcase, Database,
  // Lowercase versions for flexibility
  star: Star, code: Code, cpu: Cpu, barchart: BarChart, 
  maximize: Maximize, zap: Zap, shield: Shield, users: Users,
  target: Target, rocket: Rocket, settings: Settings, globe: Globe,
  heart: Heart, clock: Clock, checkcircle: CheckCircle,
  lightbulb: Lightbulb, trendingup: TrendingUp, award: Award,
  briefcase: Briefcase, database: Database,
};

interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

interface FeaturesSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, unknown>;
}

export function FeaturesSection({ title, subtitle, content }: FeaturesSectionProps) {
  const items = ((content as Record<string, unknown>).items as FeatureItem[]) || [];
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const getIcon = (iconName?: string): LucideIcon => {
    if (!iconName) return Star;
    return iconMap[iconName] || iconMap[iconName.toLowerCase()] || Star;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      
      <div className="container relative z-10">
        {(title || subtitle) && (
          <div 
            className={cn(
              "text-center max-w-2xl mx-auto mb-16 transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {title && (
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="text-gradient">{title}</span>
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => {
            const Icon = getIcon(item.icon);
            return (
              <div
                key={index}
                className={cn(
                  "group relative p-8 rounded-2xl border bg-card/50 backdrop-blur-sm",
                  "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
                  "transition-all duration-500 cursor-default",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ 
                  transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
                }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Icon with animated background */}
                <div className="relative mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <Icon className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 w-14 h-14 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                </div>
                
                <h3 className="relative text-xl font-semibold mb-3 transition-colors duration-300 group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="relative text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {/* Corner decoration */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-border/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:w-10 group-hover:h-10" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
