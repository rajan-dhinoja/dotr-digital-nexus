import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Video, Film, Camera, Music, ArrowRight } from "lucide-react";

const Creative = () => {
  const services = [
    {
      icon: Video,
      title: "Video Production",
      description: "Professional video content from concept to final cut, including commercials and corporate videos.",
    },
    {
      icon: Film,
      title: "Motion Graphics",
      description: "Engaging animated content and motion design for digital and broadcast media.",
    },
    {
      icon: Camera,
      title: "Photography",
      description: "High-quality product, commercial, and brand photography that tells your story.",
    },
    {
      icon: Music,
      title: "Audio Production",
      description: "Sound design, music production, and audio editing for various media formats.",
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
              Creative / Multimedia Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Engaging visual and audio content that tells your story and captivates your
              audience across all platforms.
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
            Bring Your Vision to Life
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's create compelling multimedia content that resonates with your audience.
          </p>
          <Button size="lg" asChild>
            <Link to="/contact">
              Start Your Project <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Creative;
