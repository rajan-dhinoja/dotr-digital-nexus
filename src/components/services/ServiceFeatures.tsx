import { Card, CardContent } from "@/components/ui/card";
import { icons, CheckCircle } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface ServiceFeaturesProps {
  features: Feature[];
}

export function ServiceFeatures({ features }: ServiceFeaturesProps) {
  if (!features || features.length === 0) return null;

  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Key Features & Benefits
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            What makes our service stand out from the rest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon && feature.icon in icons
              ? icons[feature.icon as keyof typeof icons]
              : CheckCircle;

            return (
              <Card 
                key={index} 
                className="border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
              >
                <CardContent className="pt-6">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}