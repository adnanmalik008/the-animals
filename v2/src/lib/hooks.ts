"use client";

import { useEffect, useRef, useState } from "react";

/* True once the element has entered the viewport (fires once). */
export function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // require a real box: collapsed (zero-height) modules report
        // isIntersecting and would consume the one-shot trigger while hidden
        if (entries.some((e) => e.isIntersecting && e.boundingClientRect.height > 0)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, inView]);

  return { ref, inView };
}

/* localStorage-persisted state. Reads after mount to stay hydration-safe. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    // async so the rehydrate never causes a cascading synchronous render
    const id = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) setValue(JSON.parse(raw) as T);
      } catch {
        /* unavailable or corrupted — keep initial */
      }
    });
    return () => cancelAnimationFrame(id);
  }, [key]);

  const set = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* quota/private mode — in-memory only */
      }
      return resolved;
    });
  };

  return [value, set] as const;
}

/* Animates 0 → target with ease-out once `start` is true. */
export function useCountUp(target: number, start: boolean, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const progress = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Number((target * eased).toFixed(decimals)));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration, decimals]);

  return value;
}
