import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Palette, Pen, Layout, Sparkles, ArrowRight } from "lucide-react";

const Designing = () => {
  const services = [
    {
      icon: Palette,
      title: "Brand Identity",
      description: "Complete brand systems including logo design, color palettes, typography, and brand guidelines.",
    },
    {
      icon: Layout,
      title: "UI/UX Design",
      description: "User-centered interface design that combines aesthetics with intuitive functionality.",
    },
    {
      icon: Pen,
      title: "Graphic Design",
      description: "Visual content for digital and print media, from social graphics to marketing materials.",
    },
    {
      icon: Sparkles,
      title: "Visual Identity",
      description: "Cohesive visual language that communicates your brand's unique personality.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/services" className="text-primary hover:text-primary/80 inline-flex items-center mb-6">
              ← Back to Services
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Design Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Creating visually stunning and user-centric designs that elevate your brand and
              engage your audience.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <service.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Brand?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's create a visual identity that sets you apart from the competition.
          </p>
          <Button size="lg" asChild>
            <Link to="/contact">
              Start Your Design Project <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Designing;
