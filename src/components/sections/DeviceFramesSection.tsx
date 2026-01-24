import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeviceFramesSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    device_type?: "iphone" | "android" | "laptop" | "tablet";
    screenshots?: string[];
  };
}

export const DeviceFramesSection = ({ title, subtitle, content }: DeviceFramesSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const deviceType = content?.device_type || "iphone";
  const screenshots = content?.screenshots || [
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=400&q=80",
  ];

  const next = () => setCurrentIndex((i) => (i + 1) % screenshots.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + screenshots.length) % screenshots.length);

  const deviceStyles = {
    iphone: {
      frame: "w-64 h-[520px] bg-foreground rounded-[40px] p-3",
      screen: "rounded-[28px] overflow-hidden h-full bg-card",
      notch: "absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-full z-10",
    },
    android: {
      frame: "w-64 h-[520px] bg-foreground rounded-[24px] p-2",
      screen: "rounded-[16px] overflow-hidden h-full bg-card",
      notch: "absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-foreground rounded-full z-10",
    },
    laptop: {
      frame: "w-full max-w-2xl bg-foreground rounded-t-lg p-2 pb-6",
      screen: "rounded-sm overflow-hidden aspect-video bg-card",
      notch: "",
    },
    tablet: {
      frame: "w-80 h-[440px] bg-foreground rounded-[20px] p-3",
      screen: "rounded-[10px] overflow-hidden h-full bg-card",
      notch: "",
    },
  };

  const style = deviceStyles[deviceType];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title || "Experience on Any Device"}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center">
            <div className="relative">
              {/* Device Frame */}
              <div className={style.frame}>
                {style.notch && <div className={style.notch} />}
                <div className={style.screen}>
                  <img
                    src={screenshots[currentIndex]}
                    alt={`Screenshot ${currentIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Laptop Base */}
              {deviceType === "laptop" && (
                <div className="w-full max-w-2xl h-4 bg-foreground rounded-b-lg mx-auto">
                  <div className="w-20 h-1 bg-muted-foreground/50 rounded mx-auto mt-1" />
                </div>
              )}
            </div>

            {/* Navigation */}
            {screenshots.length > 1 && (
              <div className="flex items-center gap-4 mt-8">
                <Button variant="outline" size="icon" onClick={prev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-2">
                  {screenshots.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <Button variant="outline" size="icon" onClick={next}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
      </div>
    </section>
  );
};
