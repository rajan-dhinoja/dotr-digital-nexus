import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { megaMenuConfig, MegaMenuDefinition, iconMap } from "@/config/megaMenu";

interface MegaMenuProps {
  label: string;
  href: string;
  slug?: string;
  isActive: boolean;
}

export const MegaMenu = ({ label, href, slug, isActive }: MegaMenuProps) => {
  const [open, setOpen] = useState(false);

  const key = slug || href.replace(/^\//, "");
  const config: MegaMenuDefinition | undefined = megaMenuConfig[key];

  if (!config) {
    return (
      <Link
        to={href}
        className={cn(
          "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group",
          isActive
            ? "text-primary"
            : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
        )}
      >
        <span className="relative z-10">{label}</span>
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
        )}
        <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={cn(
          "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group flex items-center gap-1",
          isActive
            ? "text-primary"
            : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
        )}
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
          className="absolute left-1/2 top-full z-[60] pt-4 w-screen max-w-5xl -translate-x-1/2"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {/* Invisible bridge to prevent mouse from leaving hover area */}
          <div className="absolute top-0 left-0 right-0 h-4" />
          <div className="overflow-hidden rounded-3xl bg-background/95 shadow-2xl shadow-background/20 ring-1 ring-border/60 backdrop-blur">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              {/* Left summary column */}
              <div className="relative bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    {config.summaryTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {config.summaryText}
                  </p>
                </div>
                {config.ctaLabel && config.ctaHref && (
                  <div className="mt-6">
                    <Link
                      to={config.ctaHref}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-shadow"
                    >
                      {config.ctaLabel}
                    </Link>
                  </div>
                )}
              </div>

              {/* Right columns */}
              <div className="p-6 md:p-8 grid gap-6 md:grid-cols-3">
                {config.sections.map(section => {
                  const SectionIcon = section.iconName ? iconMap[section.iconName] : null;
                  return (
                    <div key={section.title} className="space-y-3">
                      <div className="flex items-start gap-3">
                        {SectionIcon && (
                          <span className="text-primary mt-0.5 flex-shrink-0">
                            <SectionIcon className="h-5 w-5" />
                          </span>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {section.title}
                          </p>
                          {section.description && (
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                              {section.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {section.items?.map(item => {
                          const ItemIcon = item.iconName ? iconMap[item.iconName] : null;
                          return (
                            <Link
                              key={item.title}
                              to={item.href}
                              className="group flex items-start gap-2 rounded-xl px-3 py-2 text-xs text-foreground/80 hover:bg-muted/70 hover:text-foreground transition-colors"
                            >
                              {ItemIcon && (
                                <span className="mt-0.5 text-primary flex-shrink-0">
                                  <ItemIcon className="h-4 w-4" />
                                </span>
                              )}
                              <div>
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

