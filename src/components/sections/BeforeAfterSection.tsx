import { useState } from "react";
import { ScrollReveal } from "@/components/interactive/ScrollReveal";

interface BeforeAfterSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    before_image?: string;
    after_image?: string;
    before_label?: string;
    after_label?: string;
  };
}

export const BeforeAfterSection = ({ title, subtitle, content }: BeforeAfterSectionProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  
  const beforeImage = content?.before_image || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80";
  const afterImage = content?.after_image || "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80";
  const beforeLabel = content?.before_label || "Before";
  const afterLabel = content?.after_label || "After";

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title || "See the Difference"}
            </h2>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-lg overflow-hidden aspect-video select-none">
              {/* After Image (Background) */}
              <img
                src={afterImage}
                alt={afterLabel}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Before Image (Overlay with clip) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={beforeImage}
                  alt={beforeLabel}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Slider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-background cursor-ew-resize"
                style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-background rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded text-sm font-medium">
                {beforeLabel}
              </div>
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded text-sm font-medium">
                {afterLabel}
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Drag the slider to compare
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
