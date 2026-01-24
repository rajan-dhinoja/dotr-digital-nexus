import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  title: string;
  description: string;
  icon?: ReactNode;
  year?: string;
}

interface InteractiveTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const InteractiveTimeline = ({ items, className }: InteractiveTimelineProps) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-8 top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-px" />

      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "relative flex items-start gap-6 pb-12 last:pb-0",
            "md:items-center",
            index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
          )}
        >
          <div
            className={cn(
              "flex-1 ml-16 md:ml-0",
              index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
            )}
          >
            <div className="glass-card rounded-xl p-6 hover:shadow-lg transition-shadow">
              {item.year && (
                <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-3">
                  {item.year}
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full",
              "bg-gradient-primary shadow-lg shadow-primary/30",
              "ring-4 ring-background"
            )}
          />

          <div className="hidden md:block flex-1" />
        </div>
      ))}
    </div>
  );
};
