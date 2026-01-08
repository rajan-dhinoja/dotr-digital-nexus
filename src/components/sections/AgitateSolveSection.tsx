import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { AlertCircle, ArrowDown, Lightbulb } from "lucide-react";

interface AgitateSolveSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    problem?: string;
    agitation?: string;
    solution?: string;
  };
}

export const AgitateSolveSection = ({ title, content }: AgitateSolveSectionProps) => {
  const problem = content?.problem || "Your team spends hours on tasks that should take minutes.";
  const agitation = content?.agitation || "Every day, inefficiency costs you money, frustrates your team, and puts you behind competitors who've already modernized.";
  const solution = content?.solution || "Our solution automates the busywork so your team can focus on what actually matters—growing your business.";

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {title}
            </h2>
          )}
        </ScrollReveal>

        <div className="max-w-2xl mx-auto space-y-8">
          <ScrollReveal>
            <div className="p-6 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">The Problem</h3>
                  <p className="text-muted-foreground">{problem}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="flex justify-center">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="p-6 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-orange-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Why It Matters</h3>
                  <p className="text-muted-foreground">{agitation}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex justify-center">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-4">
                <Lightbulb className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">The Solution</h3>
                  <p className="text-muted-foreground">{solution}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
