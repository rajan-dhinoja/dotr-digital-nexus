import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/interactive/BackToTop";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { usePageSections } from "@/hooks/usePageSections";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: sections, isLoading } = usePageSections("home");

  return (
    <div className="min-h-screen bg-background relative">
      {/* Global animated background for the landing page */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-radial opacity-60" />
        <div className="absolute inset-0 bg-gradient-hero opacity-70" />
        <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-accent/15 blur-3xl animate-float" />
      </div>

      <Header />

      {isLoading ? (
        <div className="pt-32">
          <Skeleton className="h-[50vh] w-full rounded-none" />
          <div className="container mx-auto px-4 py-20 space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-80" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : sections && sections.length > 0 ? (
        <main className="pt-24 pb-20">
          <SectionRenderer sections={sections} />
        </main>
      ) : (
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Welcome to <span className="text-gradient">DOTR Digital Nexus</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Craft your perfect homepage by adding sections from the admin panel. 
              Your changes will appear here instantly in a fully animated, dark‑modern layout.
            </p>
          </div>
        </main>
      )}

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
