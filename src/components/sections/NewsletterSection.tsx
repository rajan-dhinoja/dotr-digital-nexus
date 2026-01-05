import { useState } from 'react';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewsletterSectionProps {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, unknown>;
}

export function NewsletterSection({ title, subtitle, content }: NewsletterSectionProps) {
  const placeholderText = (content?.placeholder_text as string) || 'Enter your email';
  const buttonText = (content?.button_text as string) || 'Subscribe';
  const successMessage = (content?.success_message as string) || 'Thanks for subscribing!';

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_leads')
        .insert({
          name: 'Newsletter Subscriber',
          email,
          source: 'newsletter',
          status: 'new'
        });

      if (error) throw error;

      setIsSuccess(true);
      setEmail('');
      toast.success(successMessage);
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground mb-8">
                {subtitle}
              </p>
            )}

            {isSuccess ? (
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                <span>{successMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholderText}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Subscribing...' : buttonText}
                </Button>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
