import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, ChevronDown, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import logoLight from "@/assets/dotr-logo-light.jpg";
import logoDark from "@/assets/dotr-logo-dark.jpg";
import { useNavPages, Page } from "@/hooks/usePages";
import { MegaMenu } from "@/components/layout/MegaMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MegaMenuLink {
  title: string;
  href: string;
  description?: string;
  icon?: ReactNode;
}

interface MegaMenuSection {
  title: string;
  href?: string;
  description?: string;
  icon?: ReactNode;
  items?: MegaMenuLink[];
}

interface NavItem {
  name: string;
  href: string;
  slug?: string;
  description?: string | null;
  children?: NavItem[];
  sections?: MegaMenuSection[];
}

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMobileDropdowns, setOpenMobileDropdowns] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { data: pages = [], isLoading } = useNavPages();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setOpenMobileDropdowns([]);
  }, [location.pathname]);

  // Build navigation tree from pages
  const buildNavigation = (pages: Page[]): NavItem[] => {
    // Separate parent pages (no parent_id) and child pages
    const parentPages = pages.filter(p => !p.parent_id);
    const childPages = pages.filter(p => p.parent_id);

    return parentPages.map(parent => {
      const children: NavItem[] = childPages
        .filter(child => child.parent_id === parent.id)
        .map(child => ({
          name: child.title,
          href: getPageHref(child),
          slug: child.slug,
          description: child.description,
        }));

      return {
        name: parent.title,
        href: getPageHref(parent),
        slug: parent.slug,
        description: parent.description,
        children: children.length > 0 ? children : undefined,
      };
    });
  };

  // Get correct href based on page slug
  const getPageHref = (page: Page): string => {
    // Map common system page slugs to their routes
    const systemRoutes: Record<string, string> = {
      'home': '/',
      'about': '/about',
      'services': '/services',
      'portfolio': '/portfolio',
      'blog': '/blog',
      'contact': '/contact',
      'testimonials': '/testimonials',
      'privacy-policy': '/privacy-policy',
      'terms-of-service': '/terms-of-service',
    };

    return systemRoutes[page.slug] || `/${page.slug}`;
  };

  const navigation = buildNavigation(pages);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const toggleMobileDropdown = (name: string) => {
    setOpenMobileDropdowns(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "glass py-3 shadow-lg shadow-background/5"
          : "bg-transparent py-5"
      )}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center group"
          >
            <img 
              src={theme === "dark" ? logoDark : logoLight} 
              alt="DOTR - DHINOJA OmniTech Resolutions" 
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <MegaMenu
                key={item.name}
                label={item.name}
                href={item.href}
                slug={item.slug}
                isActive={isActive(item.href)}
              />
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="gradient" size="default" className="rounded-xl group" asChild>
              <Link to="/contact">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-xl"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            isMenuOpen ? "max-h-[500px] mt-4" : "max-h-0"
          )}
        >
          <div className="glass-card rounded-2xl p-4 space-y-2">
            {navigation.map((item) => (
              item.children && item.children.length > 0 ? (
                <Collapsible 
                  key={item.name}
                  open={openMobileDropdowns.includes(item.name)}
                  onOpenChange={() => toggleMobileDropdown(item.name)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl text-foreground font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        openMobileDropdowns.includes(item.name) && "rotate-180"
                      )} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1 mt-1">
                    <Link
                      to={item.href}
                      className={cn(
                        "block px-4 py-2 rounded-xl text-foreground/80 font-medium transition-colors",
                        isActive(item.href) && location.pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      All {item.name}
                    </Link>
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={cn(
                          "block px-4 py-2 rounded-xl text-foreground/80 font-medium transition-colors",
                          isActive(child.href)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-foreground font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50"
                  )}
                >
                  {item.name}
                </Link>
              )
            ))}
            <Button className="w-full bg-gradient-primary hover:opacity-90 rounded-xl mt-2" asChild>
              <Link to="/contact">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};
