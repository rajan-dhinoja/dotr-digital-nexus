import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, DollarSign, ArrowRight } from "lucide-react";

interface ServicePricingProps {
  pricingInfo?: string | null;
  deliveryTime?: string | null;
  serviceTitle: string;
}

export function ServicePricing({ pricingInfo, deliveryTime, serviceTitle }: ServicePricingProps) {
  if (!pricingInfo && !deliveryTime) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Investment & Timeline
            </h2>
            <p className="text-muted-foreground">
              Transparent pricing and realistic timelines
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pricingInfo && (
              <Card className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Pricing
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {pricingInfo}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    * Final pricing depends on project scope and requirements
                  </p>
                </CardContent>
              </Card>
            )}

            {deliveryTime && (
              <Card className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Delivery Time
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {deliveryTime}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    * Timeline may vary based on project complexity
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/contact">
                Request a Quote for {serviceTitle}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}