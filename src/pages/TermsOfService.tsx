import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-6">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: March 2024</p>

            <div className="prose prose-lg max-w-none space-y-6">
              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  Agreement to Terms
                </h2>
                <p className="text-muted-foreground">
                  By accessing and using the DOTR Agency website and services, you agree to be
                  bound by these Terms of Service and all applicable laws and regulations. If you
                  do not agree with any of these terms, you are prohibited from using this site.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  Use of Services
                </h2>
                <p className="text-muted-foreground mb-3">
                  When using our services, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide accurate and complete information</li>
                  <li>Use our services only for lawful purposes</li>
                  <li>Not interfere with or disrupt our services</li>
                  <li>Respect intellectual property rights</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  Intellectual Property
                </h2>
                <p className="text-muted-foreground">
                  All content, features, and functionality on our website, including but not
                  limited to text, graphics, logos, and software, are the exclusive property of
                  DOTR Agency and are protected by copyright, trademark, and other intellectual
                  property laws.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  Service Delivery
                </h2>
                <p className="text-muted-foreground">
                  We strive to deliver high-quality services according to agreed-upon
                  specifications and timelines. However, delivery dates are estimates and may be
                  subject to change due to unforeseen circumstances.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  Payment Terms
                </h2>
                <p className="text-muted-foreground mb-3">
                  Payment terms will be specified in individual project agreements. Generally:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Deposits may be required before work begins</li>
                  <li>Final payment is due upon project completion</li>
                  <li>Late payments may incur additional fees</li>
                  <li>Refund policies are outlined in project agreements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-muted-foreground">
                  DOTR Agency shall not be liable for any indirect, incidental, special, or
                  consequential damages arising out of or in connection with our services,
                  including but not limited to loss of profits, data, or business opportunities.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  Modifications
                </h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms of Service at any time. Changes will
                  be effective immediately upon posting to our website. Your continued use of our
                  services constitutes acceptance of any modifications.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us at{" "}
                  <a href="mailto:legal@dotr.agency" className="text-primary hover:underline">
                    legal@dotr.agency
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;
