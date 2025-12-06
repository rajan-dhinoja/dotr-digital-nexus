import { useState } from "react";
import { z } from "zod";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { TiltCard } from "@/components/interactive/TiltCard";
import { FloatingElements } from "@/components/interactive/FloatingElements";
import { BackToTop } from "@/components/interactive/BackToTop";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  company: z.string().trim().max(100, "Company name must be less than 100 characters").optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000, "Message must be less than 5000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;
type FormErrors = Partial<Record<keyof ContactFormData, string>>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof ContactFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = error.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: "Validation Error", description: "Please fix the errors in the form.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_leads").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company?.trim() || null,
        message: formData.message.trim(),
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({ title: "Message Sent!", description: "Thank you for contacting us. We'll get back to you soon." });
      setFormData({ name: "", email: "", company: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({ title: "Error", description: "Failed to send your message. Please try again later.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (isSuccess) setIsSuccess(false);
  };

  const contactInfo = [
    { icon: Mail, title: "Email", content: "dhinojaomnitechresolutions@gmail.com", link: "mailto:dhinojaomnitechresolutions@gmail.com", color: "primary" },
    { icon: Phone, title: "Phone", content: "+91 90236 80848", link: "tel:+919023680848", color: "accent" },
    { icon: MapPin, title: "Office", content: "Ahmedabad, Gujarat", link: "https://maps.google.com/?q=Ahmedabad,Gujarat", color: "success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-[50vh] flex items-center overflow-hidden">
        <FloatingElements />
        <div className="absolute inset-0 bg-gradient-radial z-0" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal animation="fade-in">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Contact Us
              </span>
            </ScrollReveal>
            
            <ScrollReveal animation="slide-up" delay={100}>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6">
                Let's <span className="text-gradient">Connect</span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-in" delay={200}>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have a project in mind? Let's discuss how we can help bring your vision to life.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactInfo.map((info, index) => (
              <ScrollReveal key={index} animation="slide-up" delay={index * 100}>
                <a href={info.link} target={info.title === "Office" ? "_blank" : undefined} rel="noopener noreferrer">
                  <TiltCard className="glass-card rounded-2xl p-6 text-center h-full group">
                    <div className={cn(
                      "w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110",
                      "bg-gradient-primary"
                    )}>
                      <info.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2">{info.title}</h3>
                    <p className="text-muted-foreground text-sm group-hover:text-primary transition-colors">
                      {info.content}
                    </p>
                  </TiltCard>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <ScrollReveal animation="fade-in">
              <TiltCard className="glass-card rounded-3xl p-8 md:p-12" tiltAmount={3}>
                {isSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-success/20 mx-auto mb-6 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-success" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button
                      onClick={() => setIsSuccess(false)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                        Send us a message
                      </h2>
                      <p className="text-muted-foreground">
                        Fill out the form below and we'll get back to you soon.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className={cn(
                            "block text-sm font-medium mb-2 transition-colors",
                            focusedField === "name" ? "text-primary" : "text-foreground"
                          )}
                        >
                          Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Your name"
                          maxLength={100}
                          className={cn(
                            "rounded-xl transition-all",
                            errors.name ? "border-destructive" : "",
                            focusedField === "name" ? "ring-2 ring-primary/20" : ""
                          )}
                          disabled={isSubmitting}
                        />
                        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                      </div>
                      
                      <div>
                        <label
                          htmlFor="email"
                          className={cn(
                            "block text-sm font-medium mb-2 transition-colors",
                            focusedField === "email" ? "text-primary" : "text-foreground"
                          )}
                        >
                          Email *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="your@email.com"
                          maxLength={255}
                          className={cn(
                            "rounded-xl transition-all",
                            errors.email ? "border-destructive" : "",
                            focusedField === "email" ? "ring-2 ring-primary/20" : ""
                          )}
                          disabled={isSubmitting}
                        />
                        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label
                        htmlFor="company"
                        className={cn(
                          "block text-sm font-medium mb-2 transition-colors",
                          focusedField === "company" ? "text-primary" : "text-foreground"
                        )}
                      >
                        Company
                      </label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("company")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Your company"
                        maxLength={100}
                        className={cn(
                          "rounded-xl transition-all",
                          errors.company ? "border-destructive" : "",
                          focusedField === "company" ? "ring-2 ring-primary/20" : ""
                        )}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label
                        htmlFor="message"
                        className={cn(
                          "block text-sm font-medium mb-2 transition-colors",
                          focusedField === "message" ? "text-primary" : "text-foreground"
                        )}
                      >
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("message")}
                        onBlur={() => setFocusedField(null)}
                        rows={5}
                        placeholder="Tell us about your project..."
                        maxLength={5000}
                        className={cn(
                          "rounded-xl transition-all resize-none",
                          errors.message ? "border-destructive" : "",
                          focusedField === "message" ? "ring-2 ring-primary/20" : ""
                        )}
                        disabled={isSubmitting}
                      />
                      {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {formData.message.length}/5000
                      </p>
                    </div>
                    
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-primary hover:opacity-90 rounded-xl py-6 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video rounded-3xl overflow-hidden glass-card">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235014.15716891798!2d72.41493086757398!3d23.020157814984895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1699876543210!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Contact;
