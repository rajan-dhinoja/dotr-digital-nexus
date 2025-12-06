import { icons, ArrowRight } from "lucide-react";

interface ProcessStep {
  title: string;
  description: string;
  icon?: string;
}

interface ServiceProcessProps {
  steps: ProcessStep[];
}

export function ServiceProcess({ steps }: ServiceProcessProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Process
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            How we deliver exceptional results, step by step
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, index) => {
                const IconComponent = step.icon && step.icon in icons
                  ? icons[step.icon as keyof typeof icons]
                  : ArrowRight;

                return (
                  <div 
                    key={index}
                    className="relative flex gap-6 group"
                  >
                    {/* Step number */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <h3 className="text-xl font-semibold text-foreground">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}