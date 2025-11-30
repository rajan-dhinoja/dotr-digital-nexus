import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO",
      company: "TechStart Inc.",
      content: "DOTR transformed our vision into reality with exceptional design and flawless execution. Their team's creativity and professionalism are unmatched.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Founder",
      company: "Innovate Labs",
      content: "The team's creativity and technical expertise exceeded all expectations. They delivered a solution that perfectly aligned with our business goals.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "GrowthCo",
      content: "Working with DOTR was a game-changer for our marketing efforts. Their strategic approach led to a 250% increase in conversions.",
      rating: 5,
    },
    {
      name: "David Kim",
      role: "CTO",
      company: "HealthTech Solutions",
      content: "The development team's technical skills and attention to detail resulted in a robust, scalable application that our users love.",
      rating: 5,
    },
    {
      name: "Lisa Thompson",
      role: "Brand Manager",
      company: "StyleHub",
      content: "DOTR's design team created a brand identity that truly captures our essence. The results have been phenomenal.",
      rating: 5,
    },
    {
      name: "James Wilson",
      role: "Operations Manager",
      company: "LogiFlow",
      content: "From initial consultation to final delivery, DOTR demonstrated professionalism and expertise. Highly recommend their services.",
      rating: 5,
    },
  ];

  const clients = [
    "TechStart Inc.",
    "Innovate Labs",
    "GrowthCo",
    "HealthTech Solutions",
    "StyleHub",
    "LogiFlow",
    "Digital Ventures",
    "Creative Minds",
  ];

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
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="pt-4 border-t border-border">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Client Logos */}
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

      <Footer />
    </div>
  );
};

export default Testimonials;
