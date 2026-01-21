import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MegaMenuItem {
  name: string;
  href: string;
  description?: string | null;
  children?: MegaMenuItem[];
}

interface MegaMenuProps {
  item: MegaMenuItem;
}

export const MegaMenu = ({ item }: MegaMenuProps) => {
  const sections = item.children ?? [];

  return (
    <div className="w-full md:w-[880px] lg:w-[1040px]">
      <div className="glass-card grid gap-8 rounded-3xl border bg-popover/95 p-6 shadow-2xl backdrop-blur md:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] md:p-8">
        {/* Left intro column */}
        <div className="flex flex-col justify-between gap-6 border-b pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
              Explore
            </p>
            <h3 className="mt-3 text-xl font-bold tracking-tight md:text-2xl">
              {item.name}
            </h3>
            {item.description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={item.href}
              className={cn(
                "inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md transition hover:shadow-lg hover:brightness-105"
              )}
            >
              View all {item.name}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
            <p className="text-xs text-muted-foreground/80">
              Browse by category or jump straight into a specific service.
            </p>
          </div>
        </div>

        {/* Right multi-column content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const children = section.children ?? [];

            return (
              <div key={section.href} className="space-y-2">
                <Link
                  to={section.href}
                  className="group inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  <span>{section.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>

                {children.length > 0 && (
                  <ul className="mt-1 space-y-1.5">
                    {children.map((child) => (
                      <li key={child.href}>
                        <Link
                          to={child.href}
                          className="group block rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-foreground/90 group-hover:text-foreground text-sm">
                              {child.name}
                            </span>
                          </div>
                          {child.description && (
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                              {child.description}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

