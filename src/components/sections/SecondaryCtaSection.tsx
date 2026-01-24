import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface SecondaryCtaSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    text?: string;
    button_text?: string;
    button_url?: string;
  };
}

export const SecondaryCtaSection = ({ content }: SecondaryCtaSectionProps) => {
  const text = content?.text || "Want to learn more about how we can help?";
  const buttonText = content?.button_text || "Contact Us";
  const buttonUrl = content?.button_url || "/contact";

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <p className="text-muted-foreground">{text}</p>
          <Button variant="outline" size="sm" asChild>
            <Link to={buttonUrl}>
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
