import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, ChevronDown, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import logoLight from "@/assets/dotr-logo-light.jpg";
import logoDark from "@/assets/dotr-logo-dark.jpg";
import { useNavPages, Page } from "@/hooks/usePages";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MegaMenu } from "@/components/layout/MegaMenu";

interface NavItem {
  id: string;
  name: string;
  href: string;
  description?: string | null;
  children?: NavItem[];
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

  // Build recursive navigation tree from pages
  const buildNavigation = (pages: Page[]): NavItem[] => {
    if (!pages || pages.length === 0) return [];

    const pagesByParent = new Map<string | null, Page[]>();

    for (const page of pages) {
      const key = page.parent_id;
      const existing = pagesByParent.get(key) ?? [];
      existing.push(page);
      pagesByParent.set(key, existing);
    }

    const buildItemsForParent = (parentId: string | null): NavItem[] => {
      const children = pagesByParent.get(parentId) ?? [];

      return children.map((page) => ({
        id: page.id,
        name: page.title,
        href: getPageHref(page),
        description: page.meta_description || page.description,
        children: buildItemsForParent(page.id),
      }));
    };

    // Root pages have no parent_id
    return buildItemsForParent(null);
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

  const toggleMobileDropdown = (id: string) => {
    setOpenMobileDropdowns(prev => 
      prev.includes(id) 
        ? prev.filter(n => n !== id)
        : [...prev, id]
    );
  };

  const mobileIndentClasses = ["pl-0", "pl-4", "pl-8", "pl-12"];

  const renderMobileItems = (items: NavItem[], depth = 0): JSX.Element[] => {
    const indentClass =
      mobileIndentClasses[Math.min(depth, mobileIndentClasses.length - 1)];

    return items.map((item) =>
      item.children && item.children.length > 0 ? (
        <Collapsible
          key={item.id}
          open={openMobileDropdowns.includes(item.id)}
          onOpenChange={() => toggleMobileDropdown(item.id)}
        >
          <CollapsibleTrigger className="w-full">
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-foreground font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50",
                indentClass
              )}
            >
              <span>{item.name}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  openMobileDropdowns.includes(item.id) && "rotate-180"
                )}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
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
            {renderMobileItems(item.children, depth + 1)}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <Link
          key={item.id}
          to={item.href}
          className={cn(
            "block px-4 py-3 rounded-xl text-foreground font-medium transition-colors",
            indentClass,
            isActive(item.href)
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted/50"
          )}
        >
          {item.name}
        </Link>
      )
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "glass py-4 shadow-lg shadow-background/5"
          : "bg-transparent py-6"
      )}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-6">
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
          <NavigationMenu className="hidden md:flex flex-1 justify-center">
            <NavigationMenuList>
              {navigation.map((item) =>
                item.children && item.children.length > 0 ? (
                  <NavigationMenuItem key={item.id}>
                    <NavigationMenuTrigger
                      className={cn(
                        "relative px-5 py-3 text-sm lg:text-base font-semibold rounded-2xl bg-background/60/80 hover:bg-muted/60 transition-all duration-300",
                        isActive(item.href)
                          ? "text-primary data-[state=open]:bg-primary/10"
                          : "text-foreground/80 hover:text-foreground"
                      )}
                    >
                      <span className="relative z-10">{item.name}</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="border-none bg-transparent p-0">
                      <MegaMenu item={item} />
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.id}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "relative px-5 py-3 text-sm lg:text-base font-semibold transition-all duration-300 rounded-2xl group",
                          isActive(item.href)
                            ? "text-primary bg-primary/5"
                            : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        <span className="relative z-10">{item.name}</span>
                        {isActive(item.href) && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                        )}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="hidden md:flex items-center gap-3">
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
            {renderMobileItems(navigation)}
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
