import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-6">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: March 2024</p>

            <div className="prose prose-lg max-w-none space-y-6">
              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  Introduction
                </h2>
                <p className="text-muted-foreground">
                  At DOTR Agency, we are committed to protecting your privacy and ensuring the
                  security of your personal information. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your information when you visit our
                  website or use our services.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  Information We Collect
                </h2>
                <p className="text-muted-foreground mb-3">
                  We may collect information about you in a variety of ways, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Personal Data: Name, email address, phone number, company name</li>
                  <li>Usage Data: Information about how you interact with our website</li>
                  <li>Technical Data: IP address, browser type, device information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  How We Use Your Information
                </h2>
                <p className="text-muted-foreground mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide and maintain our services</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Improve our website and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">
                  Data Security
                </h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your
                  personal information against unauthorized access, alteration, disclosure, or
                  destruction.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">Your Rights</h2>
                <p className="text-muted-foreground mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-foreground mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:privacy@dotr.agency" className="text-primary hover:underline">
                    privacy@dotr.agency
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

export default PrivacyPolicy;
