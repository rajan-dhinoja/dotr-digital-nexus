import { Award, Trophy, Medal, Star } from "lucide-react";

interface AwardItem {
  title: string;
  organization?: string;
  year?: string;
  image_url?: string;
}

interface AwardsBadgesSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: AwardItem[];
  };
}

export const AwardsBadgesSection = ({ title, subtitle, content }: AwardsBadgesSectionProps) => {
  const items = content?.items || [
    { title: "Best Design Agency", organization: "Design Awards", year: "2024" },
    { title: "Top Developer", organization: "Tech Excellence", year: "2024" },
    { title: "Innovation Award", organization: "Industry Leaders", year: "2023" },
    { title: "Customer Choice", organization: "Business Awards", year: "2023" },
  ];

  const icons = [Award, Trophy, Medal, Star];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title || "Awards & Recognition"}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const IconComponent = icons[index % icons.length];
            return (
              <div key={index} className="text-center p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="h-16 mx-auto mb-4 object-contain" />
                  ) : (
                    <IconComponent className="h-12 w-12 mx-auto mb-4 text-primary" />
                  )}
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  {item.organization && (
                    <p className="text-sm text-muted-foreground">{item.organization}</p>
                  )}
                  {item.year && (
                    <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {item.year}
                    </span>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
