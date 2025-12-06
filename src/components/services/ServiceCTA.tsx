import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";

interface ServiceCTAProps {
  serviceTitle: string;
}

export function ServiceCTA({ serviceTitle }: ServiceCTAProps) {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started with {serviceTitle}?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Let's discuss your project and see how we can help bring your vision to life.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              asChild
            >
              <Link to="/contact">
                Start Your Project <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/portfolio">
                View Portfolio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}