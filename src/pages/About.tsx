import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Users, Lightbulb, Award } from "lucide-react";
import aboutBg from "@/assets/about-bg.jpg";
import { useTeamMembers } from "@/hooks/useTeamMembers";

const About = () => {
  const { data: teamMembers, isLoading: loadingTeam } = useTeamMembers();

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We empower businesses with innovative digital solutions that drive growth and transformation.",
    },
    {
      icon: Users,
      title: "Client-Focused",
      description: "Your success is our success. We build lasting partnerships based on trust and results.",
    },
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "Staying ahead of trends and technologies to deliver cutting-edge solutions.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to the highest standards of quality in everything we create.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${aboutBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.08,
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              About DOTR
            </h1>
            <p className="text-xl text-muted-foreground">
              We are a full-service tech and creative agency dedicated to crafting exceptional
              digital experiences that drive business success.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6">Our Story</h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                Founded in 2015, DOTR began with a simple yet powerful vision: to bridge the gap
                between technology and creativity, delivering solutions that are not only
                functional but truly inspiring.
              </p>
              <p>
                Over the years, we've grown from a small team of passionate creatives and
                developers into a full-service agency trusted by leading brands and innovative
                startups alike. Our multidisciplinary approach combines design thinking, technical
                expertise, and strategic marketing to deliver comprehensive solutions.
              </p>
              <p>
                Today, we continue to push boundaries, embracing emerging technologies and creative
                trends to help our clients stay ahead in an ever-evolving digital landscape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground">
                To empower businesses of all sizes with innovative digital solutions that drive
                growth, enhance brand presence, and create meaningful connections with their
                audiences.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-lg text-muted-foreground">
                To be the leading force in digital transformation, setting new standards for
                creativity and technical excellence while fostering long-term partnerships built
                on trust and results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-border">
                <CardContent className="pt-6 text-center">
                  <value.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Talented professionals passionate about delivering excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {loadingTeam ? (
              [...Array(4)].map((_, i) => (
                <Card key={i} className="border-border text-center">
                  <CardContent className="pt-6">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-5 w-32 mx-auto mb-1" />
                    <Skeleton className="h-4 w-24 mx-auto mb-1" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))
            ) : (
              teamMembers?.map((member) => (
                <Card key={member.id} className="border-border text-center">
                  <CardContent className="pt-6">
                    {member.profile_image_url ? (
                      <img
                        src={member.profile_image_url}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4" />
                    )}
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary text-sm font-medium mb-1">{member.title}</p>
                    {member.bio && (
                      <p className="text-muted-foreground text-sm line-clamp-2">{member.bio}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              How We Work
            </h2>
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Discovery",
                  description: "We start by understanding your goals, challenges, and vision through in-depth consultations.",
                },
                {
                  step: "02",
                  title: "Strategy",
                  description: "Our team develops a comprehensive plan tailored to your specific needs and objectives.",
                },
                {
                  step: "03",
                  title: "Execution",
                  description: "We bring the strategy to life with creativity, precision, and attention to detail.",
                },
                {
                  step: "04",
                  title: "Optimization",
                  description: "Continuous improvement through testing, feedback, and refinement ensures optimal results.",
                },
              ].map((phase, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                      {phase.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground mb-2">
                      {phase.title}
                    </h3>
                    <p className="text-muted-foreground text-lg">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
