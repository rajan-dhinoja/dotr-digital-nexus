import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X, Gift } from "lucide-react";

interface ExitIntentCtaSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    headline?: string;
    description?: string;
    button_text?: string;
    button_url?: string;
    show_after_scroll?: number;
    offer_text?: string;
  };
}

export const ExitIntentCtaSection = ({ title, subtitle, content }: ExitIntentCtaSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const showAfterScroll = content?.show_after_scroll || 50;
  const headline = content?.headline || title || "Wait! Don't Leave Yet";
  const description = content?.description || subtitle || "Get 10% off your first order when you sign up today.";
  const buttonText = content?.button_text || "Claim Offer";
  const buttonUrl = content?.button_url || "/contact";
  const offerText = content?.offer_text;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= showAfterScroll && !isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterScroll, isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-card border border-border rounded-lg shadow-xl p-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">{headline}</h3>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            {offerText && (
              <p className="text-sm font-semibold text-primary mb-4">{offerText}</p>
            )}
            <Button size="sm" asChild>
              <Link to={buttonUrl}>{buttonText}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
