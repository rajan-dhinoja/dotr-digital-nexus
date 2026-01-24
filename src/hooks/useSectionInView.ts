import { useEffect, useRef, useState } from "react";
import { useSectionObserverContext } from "@/contexts/SectionObserverContext";

export interface UseSectionInViewOptions {
  /** Fraction of element visible to consider "in view" (0–1). Default 0.1 */
  threshold?: number;
  /** Root margin for IO, e.g. "0px 0px 100px 0" to trigger slightly before entry. Default "0px 0px 100px 0" */
  rootMargin?: string;
  /** Stop observing after first intersection. Default true */
  once?: boolean;
}

export interface UseSectionInViewResult {
  ref: React.RefObject<HTMLDivElement | null>;
  inView: boolean;
  /** True if the element was in the initial viewport at mount. Use to skip entrance for above-the-fold content. */
  wasAboveFold: boolean;
}

/**
 * Intersection Observer hook for section-level animation triggers.
 * Uses shared observer from SectionObserverProvider when available (e.g. inside SectionRenderer);
 * otherwise creates a per-hook observer. Returns inView, wasAboveFold, and ref.
 */
export function useSectionInView(
  options: UseSectionInViewOptions = {}
): UseSectionInViewResult {
  const { threshold = 0.1, rootMargin = "0px 0px 100px 0", once = true } = options;
  const ctx = useSectionObserverContext();
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [wasAboveFold, setWasAboveFold] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (ctx) {
      const unregister = ctx.register(el, {
        once,
        setInView,
        setWasAboveFold,
      });
      return unregister;
    }

    const rect = el.getBoundingClientRect();
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    setWasAboveFold(rect.top < viewportHeight);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ctx, threshold, rootMargin, once]);

  return { ref, inView, wasAboveFold };
}
