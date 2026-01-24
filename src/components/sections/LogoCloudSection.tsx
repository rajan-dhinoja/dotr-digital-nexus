interface LogoItem {
  logo_url: string;
  name: string;
  link?: string;
}

interface LogoCloudSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, unknown>;
}

export function LogoCloudSection({ title, subtitle, content }: LogoCloudSectionProps) {
  const items = (content?.items as LogoItem[]) || [];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
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

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {items.map((item, index) => (
            <div
              key={index}
              className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={item.logo_url}
                    alt={item.name}
                    className="h-12 md:h-16 w-auto object-contain"
                  />
                </a>
              ) : (
                <img
                  src={item.logo_url}
                  alt={item.name}
                  className="h-12 md:h-16 w-auto object-contain"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
