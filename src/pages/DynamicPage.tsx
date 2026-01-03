import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/interactive/BackToTop";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { usePageSections } from "@/hooks/usePageSections";
import { usePageBySlug } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "./NotFound";

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading: pageLoading } = usePageBySlug(slug || "");
  const { data: sections, isLoading: sectionsLoading } = usePageSections(slug || "");

  const isLoading = pageLoading || sectionsLoading;

  // If page doesn't exist after loading, show 404
  if (!pageLoading && !page) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {isLoading ? (
        <div className="pt-20">
          <Skeleton className="h-[50vh] w-full" />
          <div className="container mx-auto px-4 py-20">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : sections && sections.length > 0 ? (
        <SectionRenderer sections={sections} />
      ) : (
        <div className="pt-32 pb-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-foreground mb-4">{page?.title}</h1>
            {page?.description && (
              <p className="text-muted-foreground">{page.description}</p>
            )}
            {!page?.description && (
              <p className="text-muted-foreground">
                Add sections to this page from the admin panel.
              </p>
            )}
          </div>
        </div>
      )}

      <Footer />
      <BackToTop />
    </div>
  );
};

export default DynamicPage;
