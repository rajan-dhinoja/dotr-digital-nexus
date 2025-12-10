import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useProjects";
import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { TiltCard } from "@/components/interactive/TiltCard";
import { FloatingElements } from "@/components/interactive/FloatingElements";
import { BackToTop } from "@/components/interactive/BackToTop";
import { cn } from "@/lib/utils";

const Portfolio = () => {
  const { data: projects, isLoading } = useProjects();
  const [activeFilter, setActiveFilter] = useState("all");

  const categories = projects
    ? ["all", ...new Set(projects.flatMap(p => p.technologies || []).filter(Boolean))]
    : ["all"];

  const filteredProjects = activeFilter === "all"
    ? projects
    : projects?.filter(p => p.technologies?.includes(activeFilter));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="relative pt-32 pb-20 min-h-[50vh] flex items-center overflow-hidden">
        <FloatingElements />
        <div className="absolute inset-0 bg-gradient-radial z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal animation="fade-in">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">Our Work</span>
            </ScrollReveal>
            <ScrollReveal animation="slide-up" delay={100}>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6">
                Our <span className="text-gradient">Portfolio</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal animation="fade-in" delay={200}>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Showcasing our best work across design, development, marketing, and multimedia projects.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="pb-8 sticky top-20 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.slice(0, 6).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category as string)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                    activeFilter === category
                      ? "bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {category === "all" ? "All Projects" : category}
                </button>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)
            ) : (
              filteredProjects?.map((project, index) => (
                <ScrollReveal key={project.id} animation="slide-up" delay={index * 50}>
                  <Link to={`/portfolio/${project.slug}`} className="group block">
                    <TiltCard className="overflow-hidden rounded-2xl h-full">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={project.cover_image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <h3 className="text-xl font-display font-semibold text-foreground mb-2">{project.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
                        </div>
                      </div>
                      <div className="p-6 bg-card group-hover:bg-card/50 transition-colors lg:hidden">
                        <h3 className="text-lg font-display font-semibold text-foreground mb-2">{project.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
                      </div>
                    </TiltCard>
                  </Link>
                </ScrollReveal>
              ))
            )}
          </div>
        </div>
      </section>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Portfolio;
