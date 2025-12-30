import { 
  Star, Code, Cpu, BarChart, Maximize, Zap, Shield, Users, 
  Target, Rocket, Settings, Globe, Heart, Clock, CheckCircle,
  Lightbulb, TrendingUp, Award, Briefcase, Database
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

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

  const getIcon = (iconName?: string): LucideIcon => {
    if (!iconName) return Star;
    // Try exact match, then lowercase
    return iconMap[iconName] || iconMap[iconName.toLowerCase()] || Star;
  };

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
          {items.map((item, index) => {
            const Icon = getIcon(item.icon);
            return (
              <div
                key={index}
                className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
