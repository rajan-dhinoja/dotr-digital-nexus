import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";

const Testimonials = () => {
  const { data: testimonials, isLoading } = useTestimonials();

  // Extract unique companies for the "Trusted By" section
  const clients = testimonials
    ?.map(t => t.company)
    .filter((company, index, self) => company && self.indexOf(company) === index)
    .slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Client Testimonials
            </h1>
            <p className="text-xl text-muted-foreground">
              Trusted by leading brands and innovative startups worldwide. Here's what our
              clients have to say about working with us.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="pt-6">
                    <Skeleton className="h-5 w-28 mb-4" />
                    <Skeleton className="h-24 w-full mb-6" />
                    <div className="pt-4 border-t border-border">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-40 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              testimonials?.map((testimonial) => (
                <Card key={testimonial.id} className="border-border hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">
                      "{testimonial.testimonial_text}"
                    </p>
                    <div className="pt-4 border-t border-border">
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.designation}, {testimonial.company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Client Logos */}
      {clients.length > 0 && (
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Trusted By</h2>
              <p className="text-muted-foreground">
                Proud to work with innovative companies around the world
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {clients.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center h-20 bg-background rounded-lg border border-border"
                >
                  <span className="text-foreground font-semibold">{client}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Testimonials;
