import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Palette, Code, TrendingUp, Video, Star, CheckCircle, Users, Briefcase, Award, Zap } from "lucide-react";
import heroImage from "@/assets/hero-main.jpg";
import { useServiceCategories } from "@/hooks/useServices";
import { useProjects } from "@/hooks/useProjects";
import { useTestimonials } from "@/hooks/useTestimonials";
import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { AnimatedCounter } from "@/components/interactive/AnimatedCounter";
import { TiltCard } from "@/components/interactive/TiltCard";
import { TypewriterText } from "@/components/interactive/TypewriterText";
import { FloatingElements } from "@/components/interactive/FloatingElements";
import { TestimonialCarousel } from "@/components/interactive/TestimonialCarousel";
import { BackToTop } from "@/components/interactive/BackToTop";
import { BentoGrid, BentoCard } from "@/components/interactive/BentoGrid";

const iconMap: Record<string, React.ElementType> = {
  designing: Palette,
  development: Code,
  marketing: TrendingUp,
  creative: Video,
};

const stats = [
  { value: 150, suffix: "+", label: "Projects Delivered", icon: Briefcase },
  { value: 50, suffix: "+", label: "Happy Clients", icon: Users },
  { value: 8, suffix: "+", label: "Years Experience", icon: Award },
  { value: 99, suffix: "%", label: "Client Satisfaction", icon: Star },
];

const whyChooseUs = [
  { icon: Zap, title: "Lightning Fast", description: "Quick turnaround without compromising quality" },
  { icon: CheckCircle, title: "Quality First", description: "Every detail matters in our deliverables" },
  { icon: Users, title: "Dedicated Team", description: "Experts who care about your success" },
  { icon: Award, title: "Award Winning", description: "Recognized for excellence in digital" },
];

const Index = () => {
  const { data: categories, isLoading: loadingCategories } = useServiceCategories();
  const { data: projects, isLoading: loadingProjects } = useProjects(3);
  const { data: testimonials, isLoading: loadingTestimonials } = useTestimonials(5);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <FloatingElements />
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.05,
          }}
        />
        <div className="absolute inset-0 bg-gradient-radial z-0" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <ScrollReveal animation="fade-in">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Full-Service Digital Agency
              </span>
            </ScrollReveal>
            
            <ScrollReveal animation="slide-up" delay={100}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-foreground mb-6 leading-tight">
                We Create{" "}
                <span className="text-gradient">
                  <TypewriterText 
                    texts={["Digital Excellence", "Brand Stories", "Web Solutions", "Growth Strategy"]}
                  />
                </span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-in" delay={200}>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Transform your business with our comprehensive solutions in design,
                development, marketing, and multimedia.
              </p>
            </ScrollReveal>
            
            <ScrollReveal animation="scale-in" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/30" asChild>
                  <Link to="/contact">
                    Start Your Project <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl" asChild>
                  <Link to="/portfolio">View Our Work</Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-muted-foreground/30 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <ScrollReveal key={index} animation="scale-in" delay={index * 100}>
                <TiltCard className="glass-card rounded-2xl p-6 text-center" tiltAmount={5}>
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                  <div className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Bento Grid */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                What We Do
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Our Services
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive solutions tailored to elevate your brand and drive results.
              </p>
            </div>
          </ScrollReveal>
          
          {loadingCategories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[200px] rounded-2xl" />
              ))}
            </div>
          ) : (
            <BentoGrid>
              {categories?.map((category, index) => {
                const IconComponent = iconMap[category.slug] || Palette;
                const sizes = ["large", "small", "small", "wide"] as const;
                return (
                  <BentoCard key={category.id} size={sizes[index % 4]}>
                    <Link to={`/services/${category.slug}`} className="block h-full">
                      <div className="h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <h3 className="text-xl font-display font-semibold text-foreground">
                            {category.name}
                          </h3>
                        </div>
                        <p className="text-muted-foreground flex-1">{category.description}</p>
                        <div className="mt-4 flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                          Explore <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </BentoCard>
                );
              })}
            </BentoGrid>
          )}
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                Our Work
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Featured Projects
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore our portfolio of successful projects and innovative solutions.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingProjects ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))
            ) : (
              projects?.map((project, index) => {
                const category = project.project_services?.[0]?.services?.services_categories?.name || "Project";
                return (
                  <ScrollReveal key={project.id} animation="slide-up" delay={index * 100}>
                    <Link to={`/portfolio/${project.slug}`} className="group block">
                      <TiltCard className="overflow-hidden rounded-2xl">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={project.cover_image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-2">
                              {category}
                            </span>
                            <h3 className="text-xl font-display font-semibold text-foreground">
                              {project.title}
                            </h3>
                          </div>
                        </div>
                      </TiltCard>
                    </Link>
                  </ScrollReveal>
                );
              })
            )}
          </div>
          
          <ScrollReveal animation="fade-in" delay={400}>
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" className="rounded-xl" asChild>
                <Link to="/portfolio">
                  View All Projects <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Testimonials
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                What Clients Say
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Trusted by leading brands and innovative startups worldwide.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="max-w-4xl mx-auto">
            {loadingTestimonials ? (
              <Skeleton className="h-[300px] rounded-3xl" />
            ) : testimonials && testimonials.length > 0 ? (
              <ScrollReveal animation="scale-in" delay={100}>
                <TestimonialCarousel testimonials={testimonials} />
              </ScrollReveal>
            ) : null}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                Why Us
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Why Choose DOTR
              </h2>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <ScrollReveal key={index} animation="slide-up" delay={index * 100}>
                <TiltCard className="glass-card rounded-2xl p-6 text-center h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                    <item.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-90" />
        <FloatingElements className="opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal animation="scale-in">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
                Ready to Start Your Project?
              </h2>
              <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
                Let's discuss how we can help bring your vision to life with our comprehensive
                services.
              </p>
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-6 rounded-xl shadow-xl"
                asChild
              >
                <Link to="/contact">
                  Get in Touch <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
