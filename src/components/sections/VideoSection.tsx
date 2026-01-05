import { useState } from 'react';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { Play } from 'lucide-react';

interface VideoSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, unknown>;
}

export function VideoSection({ title, subtitle, content }: VideoSectionProps) {
  const videoUrl = (content?.video_url as string) || '';
  const posterImage = (content?.poster_image as string) || '';
  const autoplay = content?.autoplay === true;
  
  const [isPlaying, setIsPlaying] = useState(autoplay);

  // Extract video ID from YouTube/Vimeo URLs
  const getEmbedUrl = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    
    return url;
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          {(title || subtitle) && (
            <div className="text-center mb-12">
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="relative max-w-4xl mx-auto rounded-xl overflow-hidden aspect-video bg-muted">
            {isPlaying ? (
              <iframe
                src={getEmbedUrl(videoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div 
                className="relative w-full h-full cursor-pointer group"
                onClick={() => setIsPlaying(true)}
              >
                {posterImage ? (
                  <img
                    src={posterImage}
                    alt={title || 'Video thumbnail'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-background/30 group-hover:bg-background/40 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
