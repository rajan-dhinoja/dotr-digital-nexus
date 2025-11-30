import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Code, TrendingUp, Video, ArrowRight } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Palette,
      title: "Designing",
      description: "Creating visually stunning and user-centric designs that elevate your brand.",
      features: [
        "Brand Identity & Logo Design",
        "UI/UX Design",
        "Graphic Design",
        "Print & Digital Media",
      ],
      link: "/services/designing",
    },
    {
      icon: Code,
      title: "Web & Software Development",
      description: "Building robust, scalable, and high-performance digital solutions.",
      features: [
        "Custom Web Applications",
        "E-Commerce Solutions",
        "Mobile App Development",
        "API Development & Integration",
      ],
      link: "/services/development",
    },
    {
      icon: TrendingUp,
      title: "Marketing",
      description: "Data-driven strategies that amplify your reach and drive measurable results.",
      features: [
        "Digital Marketing Strategy",
        "SEO & SEM",
        "Social Media Marketing",
        "Content Marketing",
      ],
      link: "/services/marketing",
    },
    {
      icon: Video,
      title: "Creative / Multimedia",
      description: "Engaging visual content that tells your story and captivates your audience.",
      features: [
        "Video Production",
        "Motion Graphics & Animation",
        "Photography",
        "Audio Production",
      ],
      link: "/services/creative",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Our Services
            </h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive solutions across design, development, marketing, and multimedia to
              help your business thrive in the digital age.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {services.map((service, index) => (
              <Card
                key={index}
                className="border-border overflow-hidden hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-8 md:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className={index % 2 === 0 ? "lg:order-1" : "lg:order-2"}>
                      <service.icon className="h-16 w-16 text-primary mb-6" />
                      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        {service.title}
                      </h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        {service.description}
                      </p>
                      <ul className="space-y-3 mb-6">
                        {service.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start text-foreground"
                          >
                            <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-1" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild size="lg">
                        <Link to={service.link}>
                          Learn More <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                    <div className={index % 2 === 0 ? "lg:order-2" : "lg:order-1"}>
                      <div className="aspect-video bg-muted rounded-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Need a Custom Solution?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We combine multiple services to create tailored solutions that perfectly fit your
            unique needs.
          </p>
          <Button size="lg" asChild>
            <Link to="/contact">
              Discuss Your Project <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
