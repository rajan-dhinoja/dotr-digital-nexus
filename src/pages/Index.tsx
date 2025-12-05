import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Palette, Code, TrendingUp, Video, Star, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-main.jpg";
import { useServiceCategories } from "@/hooks/useServices";
import { useProjects } from "@/hooks/useProjects";
import { useTestimonials } from "@/hooks/useTestimonials";

const iconMap: Record<string, React.ElementType> = {
  designing: Palette,
  development: Code,
  marketing: TrendingUp,
  creative: Video,
};

const Index = () => {
  const { data: categories, isLoading: loadingCategories } = useServiceCategories();
  const { data: projects, isLoading: loadingProjects } = useProjects(3);
  const { data: testimonials, isLoading: loadingTestimonials } = useTestimonials(2);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.1,
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              We Create Digital Excellence
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Full-service tech & creative agency delivering transformative solutions in design,
              development, marketing, and multimedia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">
                  Start Your Project <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/portfolio">View Our Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions tailored to elevate your brand and drive results.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loadingCategories ? (
              [...Array(4)].map((_, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="pt-6">
                    <Skeleton className="h-12 w-12 mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-16 w-full mb-4" />
                    <Skeleton className="h-5 w-24" />
                  </CardContent>
                </Card>
              ))
            ) : (
              categories?.map((category) => {
                const IconComponent = iconMap[category.slug] || Palette;
                return (
                  <Card key={category.id} className="border-border hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <IconComponent className="h-12 w-12 text-primary mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground mb-4">{category.description}</p>
                      <Link
                        to={`/services/${category.slug}`}
                        className="text-primary hover:text-primary/80 font-medium inline-flex items-center"
                      >
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Featured Work</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our portfolio of successful projects and innovative solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingProjects ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-border">
                  <Skeleton className="aspect-video" />
                  <CardContent className="pt-4">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-6 w-48" />
                  </CardContent>
                </Card>
              ))
            ) : (
              projects?.map((project) => {
                const category = project.project_services?.[0]?.services?.services_categories?.name || "Project";
                return (
                  <Link key={project.id} to="/portfolio" className="group">
                    <Card className="overflow-hidden border-border hover:shadow-xl transition-all">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={project.cover_image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="pt-4">
                        <p className="text-sm text-primary font-medium mb-1">{category}</p>
                        <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/portfolio">
                View All Projects <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">What Clients Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trusted by leading brands and innovative startups worldwide.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {loadingTestimonials ? (
              [...Array(2)].map((_, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="pt-6">
                    <Skeleton className="h-5 w-28 mb-4" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </CardContent>
                </Card>
              ))
            ) : (
              testimonials?.map((testimonial) => (
                <Card key={testimonial.id} className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.testimonial_text}"</p>
                    <div>
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

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              Why Choose DOTR
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Full-service capabilities under one roof",
                "Experienced team of specialists",
                "Data-driven approach to every project",
                "Transparent communication & collaboration",
                "Proven track record of success",
                "Cutting-edge technology & methods",
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-foreground text-lg">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can help bring your vision to life with our comprehensive
            services.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/contact">
              Get in Touch <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
