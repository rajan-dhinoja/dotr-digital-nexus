import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, Palette, Code, TrendingUp, Video, CheckCircle } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  designing: Palette,
  development: Code,
  marketing: TrendingUp,
  creative: Video,
};

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

  const IconComponent = category ? iconMap[category] || Palette : Palette;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link 
                to="/services" 
                className="text-primary hover:text-primary/80 inline-flex items-center mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Services
              </Link>

              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-16 mb-6" />
                  <Skeleton className="h-14 w-3/4" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : data ? (
                <>
                  <IconComponent className="h-16 w-16 text-primary mb-6" />
                  <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                    {data.category.name} Services
                  </h1>
                  {data.category.description && (
                    <p className="text-xl text-muted-foreground">
                      {data.category.description}
                    </p>
                  )}
                </>
              ) : (
                <h1 className="text-3xl font-bold text-foreground">Category Not Found</h1>
              )}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="pt-6">
                      <Skeleton className="h-12 w-12 mb-4" />
                      <Skeleton className="h-8 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : data && data.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {data.services.map((service) => (
                  <Card 
                    key={service.id} 
                    className="border-border hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="pt-6">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-40 object-cover rounded-md mb-4"
                        />
                      ) : (
                        <CheckCircle className="h-12 w-12 text-primary mb-4" />
                      )}
                      <h3 className="text-2xl font-semibold text-foreground mb-3">
                        {service.title}
                      </h3>
                      {service.short_summary && (
                        <p className="text-muted-foreground mb-2">{service.short_summary}</p>
                      )}
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : data ? (
              <p className="text-center text-muted-foreground py-8">
                No services available in this category yet.
              </p>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-foreground mb-2">Category Not Found</h2>
                <p className="text-muted-foreground">
                  The service category you're looking for doesn't exist.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        {data && (
          <section className="py-20 bg-card">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Need {data.category.name} Solutions?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Let's discuss how we can help bring your vision to life with our expert team.
              </p>
              <Button size="lg" asChild>
                <Link to="/contact">
                  Start Your Project <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
