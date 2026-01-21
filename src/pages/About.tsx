import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/interactive/BackToTop";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { usePageSections } from "@/hooks/usePageSections";
import { Skeleton } from "@/components/ui/skeleton";

const About = () => {
  const { data: sections, isLoading } = usePageSections("about");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {isLoading ? (
        <div className="pt-32">
          <Skeleton className="h-[40vh] w-full rounded-none" />
          <div className="container mx-auto px-4 py-16 space-y-4">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-80" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      ) : sections && sections.length > 0 ? (
        <main className="pt-24 pb-20">
          <SectionRenderer sections={sections} />
        </main>
      ) : (
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-medium text-primary/80 mb-3 tracking-wide uppercase">
              About DOTR
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              The team behind <span className="text-gradient">Digital Nexus</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Add rich story-driven sections from the admin panel to showcase your vision,
              mission, and the people who power your projects.
            </p>
          </div>
        </main>
      )}

      <Footer />
      <BackToTop />
    </div>
  );
};

export default About;
