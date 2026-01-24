import { useState } from "react";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Callout {
  time: string;
  text: string;
}

interface VideoDemoSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    video_url?: string;
    poster_image?: string;
    callouts?: Callout[];
  };
}

export const VideoDemoSection = ({ title, subtitle, content }: VideoDemoSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoUrl = content?.video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ";
  const posterImage = content?.poster_image || "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80";
  const callouts = content?.callouts || [];

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title || "See It In Action"}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
            <div className="relative rounded-lg overflow-hidden aspect-video bg-card shadow-xl">
              {!isPlaying ? (
                <>
                  <img
                    src={posterImage}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="rounded-full w-20 h-20"
                      onClick={() => setIsPlaying(true)}
                    >
                      <Play className="h-8 w-8 ml-1" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <iframe
                    src={getEmbedUrl(videoUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setIsPlaying(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {callouts.length > 0 && (
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                {callouts.map((callout, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      {callout.time}
                    </span>
                    <p className="text-sm">{callout.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </section>
  );
};
