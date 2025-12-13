import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Palette, Code, TrendingUp, Video, ArrowRight } from "lucide-react";
import { useServicesWithCategories } from "@/hooks/useServices";

const iconMap: Record<string, React.ElementType> = {
  designing: Palette,
  development: Code,
  marketing: TrendingUp,
  creative: Video,
};

const Services = () => {
  const { data: categoriesWithServices, isLoading } = useServicesWithCategories();

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
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <Card key={i} className="border-border overflow-hidden">
                  <CardContent className="p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      <div>
                        <Skeleton className="h-16 w-16 mb-6" />
                        <Skeleton className="h-10 w-64 mb-4" />
                        <Skeleton className="h-6 w-full mb-6" />
                        <div className="space-y-3 mb-6">
                          {[...Array(4)].map((_, j) => (
                            <Skeleton key={j} className="h-5 w-48" />
                          ))}
                        </div>
                        <Skeleton className="h-11 w-36" />
                      </div>
                      <Skeleton className="aspect-video rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              categoriesWithServices?.map((category, index) => {
                const IconComponent = iconMap[category.slug] || Palette;
                return (
                  <Card
                    key={category.id}
                    className="border-border overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <CardContent className="p-8 md:p-12">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className={index % 2 === 0 ? "lg:order-1" : "lg:order-2"}>
                          <IconComponent className="h-16 w-16 text-primary mb-6" />
                          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            {category.name}
                          </h2>
                          <p className="text-lg text-muted-foreground mb-6">
                            {category.description}
                          </p>
                          <ul className="space-y-3 mb-6">
                            {category.services?.map((service) => (
                              <li
                                key={service.id}
                                className="flex items-start text-foreground"
                              >
                                <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-1" />
                                <span>{service.name}</span>
                              </li>
                            ))}
                          </ul>
                          <Button asChild size="lg">
                            <Link to={`/services/${category.slug}`}>
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
                );
              })
            )}
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