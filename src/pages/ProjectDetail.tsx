import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useProjectBySlug, useProjectGallery } from "@/hooks/useProjects";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading } = useProjectBySlug(slug || "");
  const { data: gallery = [] } = useProjectGallery(project?.id || "");

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
              {project.cover_image && (
                <img src={project.cover_image} alt={project.title} className="w-full h-64 md:h-96 object-cover rounded-lg mb-8" />
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies?.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{project.title}</h1>
              {project.client && <p className="text-lg text-muted-foreground mb-6">Client: {project.client}</p>}
              {project.description && (
                <div className="prose max-w-none text-foreground mb-8">
                  {project.description.split("\n").map((p, i) => <p key={i}>{p}</p>)}
                </div>
              )}
              {project.challenge && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Challenge</h2>
                  <p className="text-muted-foreground">{project.challenge}</p>
                </div>
              )}
              {project.solution && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Solution</h2>
                  <p className="text-muted-foreground">{project.solution}</p>
                </div>
              )}
              {project.results && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Results</h2>
                  <p className="text-muted-foreground">{project.results}</p>
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
                    {gallery.map((img: any) => (
                      <div key={img.id} className="relative">
                        <img src={img.image_url} alt={img.caption || "Project image"} className="w-full h-48 object-cover rounded-lg" />
                        {img.caption && <p className="text-sm text-muted-foreground mt-2">{img.caption}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-foreground mb-2">Project Not Found</h2>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
