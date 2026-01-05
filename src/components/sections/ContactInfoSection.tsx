import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { GlassCard } from '@/components/interactive/GlassCard';
import { Mail, Phone, MapPin } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

interface ContactInfoSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, unknown>;
}

export function ContactInfoSection({ title, subtitle, content }: ContactInfoSectionProps) {
  const email = (content?.email as string) || '';
  const phone = (content?.phone as string) || '';
  const address = (content?.address as string) || '';
  const mapEmbedUrl = (content?.map_embed_url as string) || '';
  const socialLinks = (content?.social_links as SocialLink[]) || [];

  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;

  const getIcon = (iconName?: string) => {
    if (!iconName) return LucideIcons.Link;
    return icons[iconName] || LucideIcons.Link;
  };

  const contactItems = [
    { icon: Mail, label: 'Email', value: email, href: `mailto:${email}` },
    { icon: Phone, label: 'Phone', value: phone, href: `tel:${phone}` },
    { icon: MapPin, label: 'Address', value: address },
  ].filter(item => item.value);

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <ScrollReveal delay={0.1}>
            <GlassCard className="p-8 h-full">
              <h3 className="text-xl font-semibold text-foreground mb-6">Get in Touch</h3>
              
              <div className="space-y-6">
                {contactItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        {item.href ? (
                          <a 
                            href={item.href} 
                            className="text-foreground hover:text-primary transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-foreground">{item.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {socialLinks.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">Follow Us</p>
                  <div className="flex gap-3">
                    {socialLinks.map((link, index) => {
                      const Icon = getIcon(link.icon);
                      return (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </GlassCard>
          </ScrollReveal>

          {mapEmbedUrl && (
            <ScrollReveal delay={0.2}>
              <div className="rounded-lg overflow-hidden h-full min-h-[300px]">
                <iframe
                  src={mapEmbedUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
