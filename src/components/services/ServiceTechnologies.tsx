import { Badge } from "@/components/ui/badge";

interface ServiceTechnologiesProps {
  technologies: string[];
  description?: string | null;
}

export function ServiceTechnologies({ technologies, description }: ServiceTechnologiesProps) {
  if (!technologies || technologies.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Technologies & Tools
              </h2>
              <p className="text-muted-foreground mb-6">
                We leverage the latest and most reliable technologies to deliver exceptional results.
              </p>
              {description && (
                <p className="text-foreground leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {technologies.map((tech, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-sm py-2 px-4 hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}