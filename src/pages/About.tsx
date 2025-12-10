import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Users, Lightbulb, Award, Linkedin, Twitter } from "lucide-react";
import aboutBg from "@/assets/about-bg.jpg";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { ScrollReveal } from "@/components/interactive/ScrollReveal";
import { TiltCard } from "@/components/interactive/TiltCard";
import { FloatingElements } from "@/components/interactive/FloatingElements";
import { InteractiveTimeline } from "@/components/interactive/InteractiveTimeline";
import { BackToTop } from "@/components/interactive/BackToTop";
import { AnimatedCounter } from "@/components/interactive/AnimatedCounter";

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

  const milestones = [
    { year: "2015", title: "Founded DOTR", description: "Started with a vision to bridge technology and creativity" },
    { year: "2017", title: "Expanded Services", description: "Added marketing and multimedia to our offerings" },
    { year: "2019", title: "50+ Clients", description: "Reached our first major milestone of happy clients" },
    { year: "2021", title: "Global Reach", description: "Started working with international clients" },
    { year: "2023", title: "Award Recognition", description: "Recognized for excellence in digital solutions" },
    { year: "2024", title: "Innovation Hub", description: "Launched our innovation lab for emerging tech" },
  ];

  const processSteps = [
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
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-[70vh] flex items-center overflow-hidden">
        <FloatingElements />
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${aboutBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.05,
          }}
        />
        <div className="absolute inset-0 bg-gradient-radial z-0" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal animation="fade-in">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                About Us
              </span>
            </ScrollReveal>
            
            <ScrollReveal animation="slide-up" delay={100}>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6">
                We Are <span className="text-gradient">DOTR</span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-in" delay={200}>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A full-service tech and creative agency dedicated to crafting exceptional
                digital experiences that drive business success.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 8, suffix: "+", label: "Years Experience" },
              { value: 150, suffix: "+", label: "Projects Completed" },
              { value: 50, suffix: "+", label: "Happy Clients" },
              { value: 15, suffix: "+", label: "Team Members" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-display font-bold text-gradient">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal animation="fade-in-left">
              <div>
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Our Story
                </span>
                <h2 className="text-4xl font-display font-bold text-foreground mb-6">
                  From Vision to Reality
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Founded in 2015, DOTR began with a simple yet powerful vision: to bridge the gap
                    between technology and creativity, delivering solutions that are not only
                    functional but truly inspiring.
                  </p>
                  <p>
                    Over the years, we've grown from a small team of passionate creatives and
                    developers into a full-service agency trusted by leading brands and innovative
                    startups alike.
                  </p>
                  <p>
                    Today, we continue to push boundaries, embracing emerging technologies and creative
                    trends to help our clients stay ahead in an ever-evolving digital landscape.
                  </p>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-in-right" delay={200}>
              <div className="grid grid-cols-2 gap-4">
                <TiltCard className="glass-card rounded-2xl p-6 text-center">
                  <div className="text-4xl font-display font-bold text-gradient mb-2">
                    <AnimatedCounter end={99} suffix="%" />
                  </div>
                  <p className="text-muted-foreground text-sm">Client Satisfaction</p>
                </TiltCard>
                <TiltCard className="glass-card rounded-2xl p-6 text-center mt-8">
                  <div className="text-4xl font-display font-bold text-gradient mb-2">
                    <AnimatedCounter end={24} suffix="/7" />
                  </div>
                  <p className="text-muted-foreground text-sm">Support Available</p>
                </TiltCard>
                <TiltCard className="glass-card rounded-2xl p-6 text-center">
                  <div className="text-4xl font-display font-bold text-gradient mb-2">
                    <AnimatedCounter end={100} suffix="%" />
                  </div>
                  <p className="text-muted-foreground text-sm">On-Time Delivery</p>
                </TiltCard>
                <TiltCard className="glass-card rounded-2xl p-6 text-center mt-8">
                  <div className="text-4xl font-display font-bold text-gradient mb-2">
                    <AnimatedCounter end={50} suffix="+" />
                  </div>
                  <p className="text-muted-foreground text-sm">Global Clients</p>
                </TiltCard>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <ScrollReveal animation="slide-up">
              <TiltCard className="glass-card rounded-2xl p-8 h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To empower businesses of all sizes with innovative digital solutions that drive
                  growth, enhance brand presence, and create meaningful connections with their
                  audiences.
                </p>
              </TiltCard>
            </ScrollReveal>
            
            <ScrollReveal animation="slide-up" delay={100}>
              <TiltCard className="glass-card rounded-2xl p-8 h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6">
                  <Lightbulb className="h-7 w-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To be the leading force in digital transformation, setting new standards for
                  creativity and technical excellence while fostering long-term partnerships built
                  on trust and results.
                </p>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                What Drives Us
              </span>
              <h2 className="text-4xl font-display font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <ScrollReveal key={index} animation="slide-up" delay={index * 100}>
                <TiltCard className="glass-card rounded-2xl p-6 text-center h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                    <value.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Our Journey
              </span>
              <h2 className="text-4xl font-display font-bold text-foreground mb-4">Milestones</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Key moments that shaped who we are today.
              </p>
            </div>
          </ScrollReveal>
          
          <InteractiveTimeline items={milestones} className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                The People
              </span>
              <h2 className="text-4xl font-display font-bold text-foreground mb-4">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Talented professionals passionate about delivering excellence.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {loadingTeam ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[300px] rounded-2xl" />
              ))
            ) : (
              teamMembers?.map((member, index) => (
                <ScrollReveal key={member.id} animation="slide-up" delay={index * 100}>
                  <TiltCard className="glass-card rounded-2xl overflow-hidden group">
                    <div className="aspect-square overflow-hidden relative">
                      {member.image_url ? (
                        <img
                          src={member.image_url}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                          <span className="text-6xl font-display font-bold text-primary-foreground">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                        {member.name}
                      </h3>
                      <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                      {member.bio && (
                        <p className="text-muted-foreground text-sm line-clamp-2">{member.bio}</p>
                      )}
                    </div>
                  </TiltCard>
                </ScrollReveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-in">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Our Process
              </span>
              <h2 className="text-4xl font-display font-bold text-foreground mb-4">How We Work</h2>
            </div>
          </ScrollReveal>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processSteps.map((phase, index) => (
                <ScrollReveal key={index} animation="slide-up" delay={index * 100}>
                  <TiltCard className="glass-card rounded-2xl p-6 h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                        <span className="text-lg font-display font-bold text-primary-foreground">
                          {phase.step}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                          {phase.title}
                        </h3>
                        <p className="text-muted-foreground">{phase.description}</p>
                      </div>
                    </div>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default About;
