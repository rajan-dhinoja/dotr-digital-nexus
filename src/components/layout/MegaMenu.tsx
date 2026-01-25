import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMegaMenu } from "@/hooks/useMegaMenu";
import { resolveIcon, transformToMegaMenu, type MegaMenuDefinition } from "@/lib/menuUtils";
import { Skeleton } from "@/components/ui/skeleton";
import type { NavigationTreeItem } from "@/hooks/useNavigationMenu";

interface MegaMenuProps {
  label: string;
  href: string;
  slug?: string;
  menuItemId?: string;
  menuItem?: NavigationTreeItem; // Full menu item tree for direct transformation
  isActive: boolean;
}

export const MegaMenu = ({ label, href, slug, menuItemId, menuItem, isActive }: MegaMenuProps) => {
  const [open, setOpen] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Extract slug from href if not provided
  const extractSlugFromHref = (href: string): string | null => {
    if (!href || href === '/') return null;
    const slug = href.replace(/^\//, '').split('/')[0].toLowerCase();
    return slug || null;
  };

  // Use menuItemId, slug (from prop or extracted from href), or normalized label to identify the menu item
  // Prefer slug over label for better matching with database menu items
  const extractedSlug = slug || extractSlugFromHref(href);
  const identifier = menuItemId || extractedSlug || label.toLowerCase();

  // If we have the full menuItem, try to transform it directly (optimization)
  const directMegaMenuData = React.useMemo(() => {
    if (menuItem && menuItem.menu_type === 'mega' && menuItem.children && menuItem.children.length > 0) {
      // Build pages map from menu item tree
      const pagesMap = new Map<string, string>();
      const collectPages = (item: NavigationTreeItem) => {
        if ((item as any).page?.slug) {
          pagesMap.set(item.page_id!, (item as any).page.slug);
        }
        item.children?.forEach(collectPages);
      };
      collectPages(menuItem);
      
      return transformToMegaMenu(menuItem, pagesMap);
    }
    return null;
  }, [menuItem]);

  // Fetch mega menu data only when shouldFetch is true and we don't have direct data
  const { data: fetchedMegaMenuData, isLoading, isError } = useMegaMenu(
    shouldFetch && !directMegaMenuData ? identifier : null,
    "header",
    { enabled: shouldFetch && !directMegaMenuData }
  );

  // Use direct data if available, otherwise use fetched data
  const megaMenuData = directMegaMenuData || fetchedMegaMenuData;

  // Debug logging for query results (can be removed in production)
  useEffect(() => {
    if (shouldFetch && process.env.NODE_ENV === 'development') {
      console.log('[MegaMenu] Query state:', {
        identifier,
        isLoading,
        isError,
        hasData: !!megaMenuData,
        sectionsCount: megaMenuData?.sections?.length || 0
      });
    }
  }, [shouldFetch, identifier, isLoading, isError, megaMenuData]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setShouldFetch(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus trap when menu is open
  useEffect(() => {
    if (!open || !menuRef.current) return;

    const focusableElements = menuRef.current.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => document.removeEventListener("keydown", handleTab);
  }, [open, megaMenuData]);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Start fetching on hover
    setShouldFetch(true);
    // Small delay before opening to allow data to load
    timeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, 100);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Add a small delay before closing to allow mouse movement
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
      // Keep fetching enabled for a bit in case user hovers again
      setTimeout(() => {
        if (!open) {
          setShouldFetch(false);
        }
      }, 500);
    }, 150);
  }, [open]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Always toggle the menu on click, don't navigate
    e.preventDefault();
    if (!open) {
      setShouldFetch(true);
    }
    setOpen(!open);
  }, [open]);

  // Determine if this is a mega menu (has menu_type='mega' or has children)
  const isMegaMenu = menuItem?.menu_type === 'mega' || (menuItem?.children && menuItem.children.length > 0);
  
  // For simple menus, just show a link
  if (!isMegaMenu && !shouldFetch) {
    return (
      <Link
        to={href}
        className={cn(
          "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group flex items-center gap-1",
          isActive
            ? "text-primary"
            : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
        )}
      >
        <span className="relative z-10">{label}</span>
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
        )}
      </Link>
    );
  }

  // Render mega menu - show button with dropdown
  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={menuRef}
    >
      <button
        className={cn(
          "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group flex items-center gap-1",
          isActive
            ? "text-primary"
            : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
        )}
        onClick={handleClick}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={`mega-menu-${identifier}`}
      >
        <span className="relative z-10">{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            open && "rotate-180"
          )}
        />
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
        )}
      </button>

      {open && (
        <div
          id={`mega-menu-${identifier}`}
          className="absolute left-1/2 top-full z-[60] w-screen max-w-6xl -translate-x-1/2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="menu"
          aria-label={`${label} submenu`}
        >
          {/* Invisible bridge to fill any gap */}
          <div className="absolute -top-1 left-0 right-0 h-1" />
          <div className="mt-1 overflow-hidden rounded-3xl bg-background/95 shadow-2xl shadow-background/20 ring-1 ring-border/60 backdrop-blur">
            {isLoading && shouldFetch ? (
              // Loading state
              <div className="p-8">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (megaMenuData && (!isLoading || !shouldFetch)) ? (
              // Mega menu with data - HORIZONTAL LAYOUT
              <div className="p-6 lg:p-8">
                {/* Optional Summary Header (full width) */}
                {(megaMenuData.summaryTitle || megaMenuData.summaryText) && (
                  <div className="mb-6 pb-6 border-b border-border/50">
                    {megaMenuData.summaryTitle && (
                      <h3 className="text-xl font-semibold mb-2">
                        {megaMenuData.summaryTitle}
                      </h3>
                    )}
                    {megaMenuData.summaryText && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {megaMenuData.summaryText}
                      </p>
                    )}
                    {megaMenuData.ctaLabel && megaMenuData.ctaHref && (
                      <div className="mt-4">
                        <Link
                          to={megaMenuData.ctaHref}
                          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          role="menuitem"
                        >
                          {megaMenuData.ctaLabel}
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Horizontal sections layout */}
                {megaMenuData.sections.length > 0 ? (
                  <div className="flex flex-wrap gap-6">
                    {megaMenuData.sections.map((section) => {
                      const SectionIcon = section.icon || resolveIcon(section.iconName || undefined);
                      return (
                        <div key={section.title} className="flex-shrink-0 w-[240px] min-w-[200px] max-w-[280px] space-y-3" role="group" aria-label={section.title}>
                          <div className="flex items-start gap-3">
                            {SectionIcon && (
                              <span className="text-primary mt-0.5 flex-shrink-0" aria-hidden="true">
                                {React.createElement(SectionIcon, { className: "h-5 w-5" })}
                              </span>
                            )}
                            <div className="flex-1">
                              {section.href ? (
                                <Link
                                  to={section.href}
                                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                                >
                                  {section.title}
                                </Link>
                              ) : (
                                <p className="text-sm font-semibold text-foreground">
                                  {section.title}
                                </p>
                              )}
                              {section.description && (
                                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                  {section.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {section.items && section.items.length > 0 && (
                            <div className="space-y-1.5" role="group">
                              {section.items.map((item) => {
                                const ItemIcon = item.icon || resolveIcon(item.iconName || undefined);
                                return (
                                  <Link
                                    key={item.title}
                                    to={item.href}
                                    className="group flex items-start gap-2 rounded-xl px-3 py-2 text-xs text-foreground/80 hover:bg-muted/70 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                                    role="menuitem"
                                  >
                                    {ItemIcon && (
                                      <span className="mt-0.5 text-primary flex-shrink-0" aria-hidden="true">
                                        {React.createElement(ItemIcon, { className: "h-4 w-4" })}
                                      </span>
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium">{item.title}</p>
                                      {item.description && (
                                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No menu items available</p>
                  </div>
                )}
              </div>
            ) : (
              // Empty state - show simple link if no mega menu data
              <div className="p-6 lg:p-8">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm mb-2">No menu items configured yet.</p>
                  <Link
                    to={href}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    role="menuitem"
                  >
                    Explore {label}
                  </Link>
                  <p className="text-xs mt-3">Go to Admin → Menus to set up this mega menu.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
