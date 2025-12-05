import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function ServiceDetail() {
  const { category } = useParams<{ category: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["service-category", category],
    queryFn: async () => {
      const { data: cat, error: catError } = await supabase
        .from("services_categories")
        .select("*")
        .eq("slug", category)
        .single();
      if (catError) throw catError;

      const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("category_id", cat.id)
        .order("display_order");

      return { category: cat, services: services ?? [] };
    },
    enabled: !!category,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <Link to="/services" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Link>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-6 w-3/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            </div>
          ) : data ? (
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {data.category.name}
              </h1>
              {data.category.description && (
                <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
                  {data.category.description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.services.map((service) => (
                  <Card key={service.id} className="bg-card">
                    <CardHeader>
                      {service.image_url && (
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-40 object-cover rounded-md mb-4"
                        />
                      )}
                      <CardTitle className="text-foreground">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {service.short_summary && (
                        <p className="text-muted-foreground mb-4">{service.short_summary}</p>
                      )}
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {data.services.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No services available in this category yet.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-foreground mb-2">Category Not Found</h2>
              <p className="text-muted-foreground">The service category you're looking for doesn't exist.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
