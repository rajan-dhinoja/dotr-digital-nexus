import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Youtube, Github } from "lucide-react";
import { useTheme } from "next-themes";
import logoLight from "@/assets/dotr-logo-light.jpg";
import logoDark from "@/assets/dotr-logo-dark.jpg";

export const Footer = () => {
  const { theme } = useTheme();
  
  const services = [
    { name: "Designing", href: "/services/designing" },
    { name: "Development", href: "/services/development" },
    { name: "Marketing", href: "/services/marketing" },
    { name: "Creative", href: "/services/creative" },
  ];

  const company = [
    { name: "About", href: "/about" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
    { name: "Testimonials", href: "/testimonials" },
  ];

  const legal = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ];

  const social = [
    { icon: Instagram, href: "https://www.instagram.com/d_ot_r/", label: "Instagram" },
    { icon: Facebook, href: "https://www.facebook.com/dhinoja.omnitech.resolution", label: "Facebook" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/dhinoja-omnitech-resolutions/", label: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/d_ot_r", label: "Twitter" },
    { icon: Youtube, href: "https://www.youtube.com/@d_ot_r", label: "YouTube" },
    { icon: Github, href: "https://github.com/d-ot-r", label: "GitHub" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img 
                src={theme === "dark" ? logoDark : logoLight} 
                alt="DOTR - DHINOJA OmniTech Resolutions" 
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Full-service tech & creative agency delivering exceptional digital experiences
              through design, development, marketing, and multimedia.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:dhinojaomnitechresolutions@gmail.com" className="text-sm hover:text-primary transition-colors">
                  dhinojaomnitechresolutions@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="tel:+919023680848" className="text-sm hover:text-primary transition-colors">
                  +91 90236 80848
                </a>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Ahmedabad, Gujarat</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2">
              {services.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              {company.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} DOTR - DHINOJA OmniTech Resolutions. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            {social.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
              >
                <item.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
