import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          project_services(service_id, services(*, services_categories(*)))
        `)
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ["project-gallery", project?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("project_gallery_images")
        .select("*")
        .eq("project_id", project!.id)
        .order("display_order");
      return data ?? [];
    },
    enabled: !!project?.id,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Portfolio
          </Link>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : project ? (
            <div>
              {project.cover_image_url && (
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
                />
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {project.project_services?.map((ps: any) => (
                  <Badge key={ps.service_id} variant="secondary">
                    {ps.services?.title}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {project.title}
              </h1>

              {project.client_name && (
                <p className="text-lg text-muted-foreground mb-6">
                  Client: {project.client_name}
                </p>
              )}

              {project.summary && (
                <p className="text-lg text-foreground mb-6">{project.summary}</p>
              )}

              {project.description && (
                <div className="prose max-w-none text-foreground mb-8">
                  {project.description.split("\n").map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}

              {project.achievements && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Achievements</h2>
                  <p className="text-muted-foreground">{project.achievements}</p>
                </div>
              )}

              {project.project_url && (
                <Button asChild>
                  <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" /> Visit Project
                  </a>
                </Button>
              )}

              {gallery.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Gallery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gallery.map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={img.image_url}
                          alt={img.caption || "Project image"}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {img.caption && (
                          <p className="text-sm text-muted-foreground mt-2">{img.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-foreground mb-2">Project Not Found</h2>
              <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
