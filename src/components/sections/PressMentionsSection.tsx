import { Quote } from "lucide-react";

interface PressItem {
  publication: string;
  logo_url?: string;
  quote?: string;
  link?: string;
}

interface PressMentionsSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: PressItem[];
  };
}

export const PressMentionsSection = ({ title, subtitle, content }: PressMentionsSectionProps) => {
  const items = content?.items || [
    { publication: "TechCrunch", quote: "A game-changing solution for modern businesses" },
    { publication: "Forbes", quote: "Leading innovation in the digital space" },
    { publication: "Wired", quote: "The future of digital transformation" },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">As Seen In</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title || "Press & Media"}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={index} className="text-center p-6">
                {item.logo_url ? (
                  <img 
                    src={item.logo_url} 
                    alt={item.publication} 
                    className="h-8 mx-auto mb-4 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" 
                  />
                ) : (
                  <div className="text-2xl font-bold text-muted-foreground mb-4">{item.publication}</div>
                )}
                {item.quote && (
                  <div className="relative">
                    <Quote className="h-6 w-6 text-primary/20 mx-auto mb-2" />
                    <p className="text-muted-foreground italic">"{item.quote}"</p>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
