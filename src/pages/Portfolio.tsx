import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Portfolio = () => {
  const projects = [
    {
      title: "TechStart E-Commerce Platform",
      category: "Development",
      tags: ["Web Development", "E-Commerce", "UX"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      description: "Full-featured e-commerce platform with custom CMS and payment integration.",
    },
    {
      title: "Innovate Labs Brand Identity",
      category: "Designing",
      tags: ["Branding", "Logo Design", "Visual Identity"],
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      description: "Complete brand redesign including logo, color system, and brand guidelines.",
    },
    {
      title: "GrowthCo Marketing Campaign",
      category: "Marketing",
      tags: ["Digital Marketing", "SEO", "Social Media"],
      image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&q=80",
      description: "Multi-channel marketing campaign that increased conversion by 250%.",
    },
    {
      title: "Corporate Video Production",
      category: "Creative",
      tags: ["Video Production", "Motion Graphics"],
      image: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&q=80",
      description: "Series of brand videos and motion graphics for corporate communication.",
    },
    {
      title: "HealthTech Mobile App",
      category: "Development",
      tags: ["Mobile Development", "Healthcare", "iOS/Android"],
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
      description: "Cross-platform healthcare app with real-time data synchronization.",
    },
    {
      title: "Restaurant Brand Package",
      category: "Designing",
      tags: ["Branding", "Print Design", "Packaging"],
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
      description: "Complete brand package including menu design, signage, and packaging.",
    },
  ];

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
            {projects.map((project, index) => (
              <Card
                key={index}
                className="border-border overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="pt-6">
                  <Badge className="mb-2">{project.category}</Badge>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
