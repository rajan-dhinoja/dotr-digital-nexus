import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useProjects";

const Portfolio = () => {
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Our Portfolio
            </h1>
            <p className="text-xl text-muted-foreground">
              Showcasing our best work across design, development, marketing, and multimedia
              projects.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="border-border overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-7 w-48 mb-2" />
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              projects?.map((project) => {
                const category = project.project_services?.[0]?.services?.services_categories?.name || "Project";
                const serviceNames = project.project_services?.map(
                  ps => ps.services?.title
                ).filter(Boolean) || [];

                return (
                  <Card
                    key={project.id}
                    className="border-border overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={project.cover_image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="pt-6">
                      <Badge className="mb-2">{category}</Badge>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{project.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        {serviceNames.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
