import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface GalleryItem {
  image_url: string;
  caption?: string;
  alt?: string;
}

interface GallerySectionProps {
  title?: string | null;
  subtitle?: string | null;
  content: Record<string, unknown>;
}

export function GallerySection({ title, subtitle, content }: GallerySectionProps) {
  const items = (content.items as GalleryItem[]) || [];
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {(title || subtitle) && (
          <div className="text-center max-w-2xl mx-auto mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(item)}
              className="relative aspect-square overflow-hidden rounded-lg group"
            >
              <img
                src={item.image_url}
                alt={item.alt || item.caption || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {item.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-sm font-medium">{item.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedImage && (
            <div>
              <img
                src={selectedImage.image_url}
                alt={selectedImage.alt || selectedImage.caption || 'Gallery image'}
                className="w-full h-auto"
              />
              {selectedImage.caption && (
                <p className="p-4 text-center text-muted-foreground">
                  {selectedImage.caption}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
