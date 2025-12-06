import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Zap } from "lucide-react";
import { icons } from "lucide-react";

interface ServiceHeroProps {
  title: string;
  summary?: string | null;
  categoryName: string;
  categorySlug: string;
  iconName?: string | null;
  heroImageUrl?: string | null;
}

export function ServiceHero({ 
  title, 
  summary, 
  categoryName, 
  categorySlug, 
  iconName,
  heroImageUrl 
}: ServiceHeroProps) {
  const IconComponent = iconName && iconName in icons 
    ? icons[iconName as keyof typeof icons]
    : Zap;

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background */}
      {heroImageUrl ? (
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-0" />
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Link 
            to={`/services/${categorySlug}`}
            className="text-primary hover:text-primary/80 inline-flex items-center mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to {categoryName}
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <IconComponent className="h-10 w-10 text-primary" />
            </div>
            <Badge variant="secondary" className="text-sm">
              {categoryName}
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            {title}
          </h1>

          {summary && (
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl animate-fade-in">
              {summary}
            </p>
          )}

          <div className="flex flex-wrap gap-4 animate-fade-in">
            <Button size="lg" asChild>
              <Link to="/contact">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/portfolio">
                View Our Work
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}