import { useState } from "react";
import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Screenshot {
  url: string;
  caption?: string;
}

interface ScreenshotGallerySectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    screenshots?: Screenshot[];
    show_captions?: boolean;
  };
}

export const ScreenshotGallerySection = ({ title, subtitle, content }: ScreenshotGallerySectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const screenshots = content?.screenshots || [
    { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80", caption: "Dashboard Overview" },
    { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", caption: "Analytics View" },
    { url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80", caption: "Settings Panel" },
  ];

  const showCaptions = content?.show_captions !== false;

  const next = () => setCurrentIndex((i) => (i + 1) % screenshots.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + screenshots.length) % screenshots.length);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title || "Product Screenshots"}
            </h2>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="max-w-4xl mx-auto">
            {/* Main Image */}
            <div className="relative rounded-lg overflow-hidden bg-card shadow-xl mb-4">
              <img
                src={screenshots[currentIndex].url}
                alt={screenshots[currentIndex].caption || `Screenshot ${currentIndex + 1}`}
                className="w-full aspect-video object-cover cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />
              
              {screenshots.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    onClick={prev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={next}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {showCaptions && screenshots[currentIndex].caption && (
              <p className="text-center text-muted-foreground mb-4">
                {screenshots[currentIndex].caption}
              </p>
            )}

            {/* Thumbnails */}
            {screenshots.length > 1 && (
              <div className="flex justify-center gap-2 overflow-x-auto">
                {screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition-colors ${
                      index === currentIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={screenshot.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Lightbox */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img
              src={screenshots[currentIndex].url}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>
    </section>
  );
};
