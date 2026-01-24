import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

const DEFAULT_THRESHOLD = 0.1;
const DEFAULT_ROOT_MARGIN = "0px 0px 100px 0";

type RegisteredEntry = {
  setInView: (v: boolean) => void;
  setWasAboveFold: (v: boolean) => void;
  once: boolean;
};

type RegisterFn = (
  el: HTMLElement | null,
  opts: {
    once: boolean;
    setInView: (v: boolean) => void;
    setWasAboveFold: (v: boolean) => void;
  }
) => () => void;

const SectionObserverContext = createContext<{ register: RegisterFn } | null>(
  null
);

export function useSectionObserverContext(): { register: RegisterFn } | null {
  return useContext(SectionObserverContext);
}

export interface SectionObserverProviderProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Single shared IntersectionObserver for all section wrappers. Use with
 * SectionRenderer to avoid one observer per section.
 */
export function SectionObserverProvider({
  children,
  threshold = DEFAULT_THRESHOLD,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: SectionObserverProviderProps) {
  const mapRef = useRef<Map<Element, RegisteredEntry>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const reg = map.get(entry.target);
          if (!reg) continue;
          if (entry.isIntersecting) {
            reg.setInView(true);
            if (reg.once) {
              observer.unobserve(entry.target);
              map.delete(entry.target);
            }
          } else if (!reg.once) {
            reg.setInView(false);
          }
        }
      },
      { threshold, rootMargin }
    );
    observerRef.current = observer;
    return () => {
      observer.disconnect();
      observerRef.current = null;
      map.clear();
    };
  }, [threshold, rootMargin]);

  const register = useCallback<RegisterFn>(
    (el, opts) => {
      if (!el) return () => {};
      const map = mapRef.current;
      const observer = observerRef.current;
      if (!observer) return () => {};

      const rect = el.getBoundingClientRect();
      const vh = typeof window !== "undefined" ? window.innerHeight : 0;
      opts.setWasAboveFold(rect.top < vh);

      map.set(el, {
        setInView: opts.setInView,
        setWasAboveFold: opts.setWasAboveFold,
        once: opts.once,
      });
      observer.observe(el);

      return () => {
        observer.unobserve(el);
        map.delete(el);
      };
    },
    []
  );

  const value = useMemo(() => ({ register }), [register]);

  return (
    <SectionObserverContext.Provider value={value}>
      {children}
    </SectionObserverContext.Provider>
  );
}
