import { useEffect, useRef, useState } from "react";

export interface UseSectionInViewOptions {
  /** Fraction of element visible to consider "in view" (0–1). Default 0.1 */
  threshold?: number;
  /** Root margin for IO, e.g. "100px" to trigger slightly before entry. Default "0px 0px -50px 0px" */
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
 * Returns inView, wasAboveFold, and ref. Use wasAboveFold to avoid entrance animations
 * for above-the-fold content (visible first, optional emphasis-only).
 */
export function useSectionInView(
  options: UseSectionInViewOptions = {}
): UseSectionInViewResult {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", once = true } = options;
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [wasAboveFold, setWasAboveFold] = useState(false);
  const measuredRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!measuredRef.current) {
      measuredRef.current = true;
      const rect = el.getBoundingClientRect();
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
      setWasAboveFold(rect.top < viewportHeight);
    }

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
  }, [threshold, rootMargin, once]);

  return { ref, inView, wasAboveFold };
}
