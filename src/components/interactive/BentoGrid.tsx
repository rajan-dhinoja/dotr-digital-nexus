import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TiltCard } from "./TiltCard";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: "small" | "medium" | "large" | "wide" | "tall";
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({ children, className, size = "small" }: BentoCardProps) => {
  const sizeClasses = {
    small: "",
    medium: "lg:col-span-2",
    large: "lg:col-span-2 lg:row-span-2",
    wide: "md:col-span-2 lg:col-span-2",
    tall: "row-span-2",
  };

  return (
    <TiltCard
      className={cn(
        "glass-card rounded-2xl p-6 overflow-hidden group cursor-pointer",
        "transition-all duration-300 hover:shadow-lg hover:shadow-primary/5",
        sizeClasses[size],
        className
      )}
      tiltAmount={5}
    >
      {children}
    </TiltCard>
  );
};
