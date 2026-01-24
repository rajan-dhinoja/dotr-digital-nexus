interface AboutUsSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    story?: string;
    mission?: string;
    vision?: string;
    founder_image?: string;
    founder_name?: string;
    founder_title?: string;
    founded_year?: string;
  };
}

export const AboutUsSection = ({ title, subtitle, content }: AboutUsSectionProps) => {
  const story = content?.story || "We started with a simple idea: technology should empower businesses, not complicate them. Since our founding, we've helped hundreds of companies transform their operations and achieve remarkable growth.";
  const mission = content?.mission || "To deliver innovative digital solutions that drive real business results.";
  const founderImage = content?.founder_image;
  const founderName = content?.founder_name;
  const founderTitle = content?.founder_title;
  const foundedYear = content?.founded_year;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title || "About Us"}
            </h2>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
                <h3 className="text-xl font-semibold mb-4">Our Story</h3>
                <p className="text-muted-foreground mb-6">{story}</p>
                
                {mission && (
                  <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
                    <h4 className="font-semibold mb-2">Our Mission</h4>
                    <p className="text-muted-foreground">{mission}</p>
                  </div>
                )}

                {content?.vision && (
                  <div className="p-4 rounded-lg bg-muted/50 mt-4">
                    <h4 className="font-semibold mb-2">Our Vision</h4>
                    <p className="text-muted-foreground">{content.vision}</p>
                  </div>
                )}

                {foundedYear && (
                  <p className="mt-6 text-sm text-muted-foreground">
                    Founded in {foundedYear}
                  </p>
                )}
            </div>

            <div className="text-center">
              {founderImage ? (
                <div className="relative inline-block">
                  <img
                    src={founderImage}
                    alt={founderName || "Founder"}
                    className="w-64 h-64 rounded-full object-cover mx-auto shadow-xl"
                  />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-card px-4 py-2 rounded-full shadow-lg">
                    <p className="font-semibold">{founderName}</p>
                    {founderTitle && (
                      <p className="text-sm text-muted-foreground">{founderTitle}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-8 text-center">
                  <div className="text-6xl font-bold text-primary/20 mb-4">
                    {foundedYear || new Date().getFullYear()}
                  </div>
                  <p className="text-muted-foreground">Years of Excellence</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
