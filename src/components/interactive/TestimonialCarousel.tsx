import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
  id: string;
  name: string;
  designation?: string | null;
  company?: string | null;
  testimonial_text: string;
  photo_url?: string | null;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlayInterval?: number;
  className?: string;
}

export const TestimonialCarousel = ({
  testimonials,
  autoPlayInterval = 5000,
  className,
}: TestimonialCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, autoPlayInterval]);

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (!testimonials.length) return null;

  const current = testimonials[currentIndex];

  return (
    <div className={cn("relative", className)}>
      <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <Quote className="absolute top-6 left-6 h-16 w-16 text-primary/10" />
        
        <div className="relative z-10">
          <div className="flex mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-primary text-primary" />
            ))}
          </div>
          
          <p
            className={cn(
              "text-lg md:text-xl text-foreground mb-8 leading-relaxed transition-all duration-500",
              isAnimating && "opacity-0 translate-y-4"
            )}
          >
            "{current.testimonial_text}"
          </p>
          
          <div
            className={cn(
              "flex items-center gap-4 transition-all duration-500",
              isAnimating && "opacity-0 translate-y-4"
            )}
          >
            {current.photo_url ? (
              <img
                src={current.photo_url}
                alt={current.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                {current.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">{current.name}</p>
              <p className="text-sm text-muted-foreground">
                {current.designation}{current.company && `, ${current.company}`}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrev}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setCurrentIndex(index);
                setTimeout(() => setIsAnimating(false), 500);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-border hover:bg-muted"
              )}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
