import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSectionInView } from "@/hooks/useSectionInView";

export type AnimateInViewPreset = "subtle" | "smooth" | "scale" | "none";

export interface AnimateInViewProps {
  children: ReactNode;
  className?: string;
  /** Animation preset. 'none' or disabled = no entrance. */
  animation?: AnimateInViewPreset;
  /** Delay in ms before animation runs. */
  delay?: number;
  /** Duration in ms. Default from preset. */
  duration?: number;
  /** Stagger index (e.g. grid child index). */
  staggerIndex?: number;
  /** Max stagger index; delays cap at staggerMax * 80ms. Default 6. */
  staggerMax?: number;
  /** Disable entrance animation. Content stays visible. */
  disabled?: boolean;
  /** IO threshold 0–1. Default 0.1. */
  threshold?: number;
  /** IO rootMargin. Default "0px 0px 100px 0". */
  rootMargin?: string;
}

const STAGGER_STEP_MS = 80;
const DEFAULT_STAGGER_MAX = 6;

const PRESET_KEYFRAME: Record<Exclude<AnimateInViewPreset, "none">, string> = {
  subtle: "subtle-in",
  smooth: "smooth-in",
  scale: "scale-in-soft",
};

const PRESET_DURATION_MS: Record<Exclude<AnimateInViewPreset, "none">, number> = {
  subtle: 400,
  smooth: 500,
  scale: 400,
};

const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Visible-first, non-blocking animation wrapper. Content is always visible;
 * when in view we run a subtle entrance animation (transform-only, no hide/reveal).
 * Respects prefers-reduced-motion and skips entrance when disabled.
 */
export function AnimateInView({
  children,
  className,
  animation = "subtle",
  delay = 0,
  duration,
  staggerIndex = 0,
  staggerMax = DEFAULT_STAGGER_MAX,
  disabled = false,
  threshold = 0.1,
  rootMargin = "0px 0px 100px 0",
}: AnimateInViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView, wasAboveFold } = useSectionInView({
    threshold,
    rootMargin,
    once: true,
  });

  const skipEntrance =
    disabled ||
    prefersReducedMotion ||
    animation === "none";

  const cappedIndex = Math.min(staggerIndex, staggerMax);
  const staggerDelayMs = cappedIndex * STAGGER_STEP_MS;
  const totalDelayMs = delay + staggerDelayMs;

  const runAnimation = !skipEntrance && inView;
  const effectiveDuration =
    duration ??
    (wasAboveFold ? 200 : PRESET_DURATION_MS[animation as Exclude<AnimateInViewPreset, "none">] ?? 400);
  const keyframe = animation !== "none" ? PRESET_KEYFRAME[animation as Exclude<AnimateInViewPreset, "none">] : "emphasis";

  return (
    <div
      ref={ref}
      className={cn(className)}
      data-animate-in-view={runAnimation ? "true" : undefined}
      style={
        runAnimation
          ? {
              animation: `${keyframe} ${effectiveDuration}ms ${EASING} forwards`,
              animationDelay: `${totalDelayMs}ms`,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
