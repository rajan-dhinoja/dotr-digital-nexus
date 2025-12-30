import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/interactive/BackToTop";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { usePageSections } from "@/hooks/usePageSections";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { CTASection } from "@/components/sections/CTASection";

const Index = () => {
  const { data: sections, isLoading } = usePageSections("home");

  // Default content for when no dynamic sections exist
  const hasContent = sections && sections.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {isLoading ? (
        <div className="pt-20 min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : hasContent ? (
        <SectionRenderer sections={sections} />
      ) : (
        // Default sections when no dynamic content is configured
        <>
          <HeroSection 
            title="Hero"
            subtitle=""
            content={{
              headline: "Transform Your Business with DOTR",
              subtitle: "Full-service tech & creative agency delivering exceptional digital experiences through design, development, marketing, and multimedia.",
              cta_text: "Get Started",
              cta_link: "/contact"
            }}
          />
          <FeaturesSection
            title="Our Services"
            subtitle="We provide comprehensive digital solutions"
            content={{
              items: [
                { title: "Web Development", description: "Custom websites and web applications built with modern technologies.", icon: "Code" },
                { title: "AI & Automation", description: "Intelligent solutions to streamline your business processes.", icon: "Cpu" },
                { title: "Digital Marketing", description: "Strategic marketing campaigns to grow your online presence.", icon: "TrendingUp" },
              ]
            }}
          />
          <CTASection
            title="CTA"
            subtitle=""
            content={{
              headline: "Ready to Get Started?",
              description: "Let's discuss your project and create something amazing together.",
              primary_cta_text: "Contact Us",
              primary_cta_link: "/contact",
              secondary_cta_text: "View Portfolio",
              secondary_cta_link: "/portfolio"
            }}
          />
        </>
      )}

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
