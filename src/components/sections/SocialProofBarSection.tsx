import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { Users, Star, ThumbsUp } from "lucide-react";

interface Platform {
  name: string;
  followers?: string;
  icon?: string;
}

interface SocialProofBarSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    user_count?: string;
    rating?: number;
    review_count?: string;
    platforms?: Platform[];
  };
}

export const SocialProofBarSection = ({ content }: SocialProofBarSectionProps) => {
  const userCount = content?.user_count || "10,000+";
  const rating = content?.rating || 4.9;
  const reviewCount = content?.review_count || "500+";

  return (
    <section className="py-4 bg-background border-y border-border">
      <ScrollReveal>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold">{userCount}</span>
              <span className="text-muted-foreground">Happy Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                  />
                ))}
              </div>
              <span className="font-semibold">{rating}</span>
              <span className="text-muted-foreground">({reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-primary" />
              <span className="font-semibold">98%</span>
              <span className="text-muted-foreground">Recommend</span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
