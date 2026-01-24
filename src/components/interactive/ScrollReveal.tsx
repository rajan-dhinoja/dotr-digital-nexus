import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  AnimateInView,
  type AnimateInViewPreset,
} from "@/components/interactive/AnimateInView";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-in" | "fade-in-left" | "fade-in-right" | "scale-in" | "slide-up";
  delay?: number;
  threshold?: number;
  duration?: number;
  once?: boolean;
  /** Disable entrance (e.g. forms). Content stays visible. */
  disabled?: boolean;
}

const ANIMATION_TO_PRESET: Record<
  NonNullable<ScrollRevealProps["animation"]>,
  AnimateInViewPreset
> = {
  "fade-in": "subtle",
  "fade-in-left": "subtle",
  "fade-in-right": "subtle",
  "scale-in": "scale",
  "slide-up": "smooth",
};

/**
 * Visible-first scroll reveal. Children render visible immediately; when in view
 * a subtle transform-only entrance runs. Respects prefers-reduced-motion.
 * Use AnimateInView directly for section-level wrapping; ScrollReveal remains
 * for local use with legacy animation names.
 */
export const ScrollReveal = ({
  children,
  className,
  animation = "fade-in",
  delay = 0,
  threshold = 0.1,
  duration = 600,
  once = true,
  disabled = false,
}: ScrollRevealProps) => {
  const preset = ANIMATION_TO_PRESET[animation];

  return (
    <AnimateInView
      className={cn(className)}
      animation={disabled ? "none" : preset}
      delay={delay}
      duration={duration}
      disabled={disabled}
      threshold={threshold}
      rootMargin="0px 0px 100px 0"
    >
      {children}
    </AnimateInView>
  );
};
