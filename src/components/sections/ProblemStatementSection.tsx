import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { AlertTriangle } from "lucide-react";

interface Problem {
  title: string;
  description?: string;
}

interface ProblemStatementSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    problems?: Problem[];
    empathy_text?: string;
  };
}

export const ProblemStatementSection = ({ title, subtitle, content }: ProblemStatementSectionProps) => {
  const problems = content?.problems || [
    { title: "Wasting time on repetitive tasks", description: "Hours spent on manual work that could be automated" },
    { title: "Struggling to scale", description: "Growth limited by outdated systems and processes" },
    { title: "Missing opportunities", description: "Unable to act fast enough on market changes" },
  ];

  const empathyText = content?.empathy_text || "We understand the frustration. You're not alone.";

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title || "Sound Familiar?"}
            </h2>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          <div className="grid gap-4 mb-8">
            {problems.map((problem, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="flex gap-4 p-6 rounded-lg bg-card border border-destructive/20">
                  <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">{problem.title}</h3>
                    {problem.description && (
                      <p className="text-muted-foreground">{problem.description}</p>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={300}>
            <p className="text-center text-lg text-muted-foreground italic">
              {empathyText}
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
