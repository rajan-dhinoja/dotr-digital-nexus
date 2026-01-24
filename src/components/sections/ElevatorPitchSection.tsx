import { Quote } from "lucide-react";

interface ElevatorPitchSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    pitch?: string;
    tagline?: string;
    author?: string;
    author_title?: string;
  };
}

export const ElevatorPitchSection = ({ content }: ElevatorPitchSectionProps) => {
  const pitch = content?.pitch || "We help ambitious companies build world-class digital experiences that drive growth, delight customers, and outpace the competition.";
  const tagline = content?.tagline || "Your vision. Our expertise. Extraordinary results.";

  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Quote className="h-12 w-12 mx-auto mb-6 opacity-50" />
          <p className="text-xl md:text-2xl lg:text-3xl font-medium mb-6 leading-relaxed">
            {pitch}
          </p>
          <p className="text-lg md:text-xl opacity-80 italic">
            {tagline}
          </p>
          {content?.author && (
            <div className="mt-8">
              <p className="font-semibold">{content.author}</p>
              {content.author_title && (
                <p className="text-sm opacity-70">{content.author_title}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
