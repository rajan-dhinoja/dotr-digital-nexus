import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { Star } from "lucide-react";

interface ReviewPlatform {
  platform: string;
  rating: number;
  review_count: number;
  logo_url?: string;
}

interface RatingsReviewsSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    items?: ReviewPlatform[];
    show_aggregate?: boolean;
  };
}

export const RatingsReviewsSection = ({ title, subtitle, content }: RatingsReviewsSectionProps) => {
  const items = content?.items || [
    { platform: "Google", rating: 4.9, review_count: 250 },
    { platform: "Clutch", rating: 4.8, review_count: 120 },
    { platform: "Trustpilot", rating: 4.7, review_count: 180 },
  ];

  const averageRating = items.length > 0 
    ? (items.reduce((acc, item) => acc + item.rating, 0) / items.length).toFixed(1)
    : "5.0";

  const totalReviews = items.reduce((acc, item) => acc + item.review_count, 0);

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title || "What Our Clients Say"}
            </h2>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
            {content?.show_aggregate !== false && (
              <div className="mt-6">
                <div className="inline-flex items-center gap-2 bg-card rounded-full px-6 py-3 shadow-sm">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className="text-2xl font-bold">{averageRating}</span>
                  <span className="text-muted-foreground">from {totalReviews}+ reviews</span>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                {item.logo_url ? (
                  <img src={item.logo_url} alt={item.platform} className="h-8 mx-auto mb-4" />
                ) : (
                  <div className="text-xl font-bold mb-4">{item.platform}</div>
                )}
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(item.rating) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                    />
                  ))}
                </div>
                <div className="text-2xl font-bold mb-1">{item.rating}</div>
                <div className="text-sm text-muted-foreground">{item.review_count} reviews</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
