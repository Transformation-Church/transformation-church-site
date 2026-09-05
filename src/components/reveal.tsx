"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Progressive scroll reveal.
 *
 * Adds `.js` to <html> so the hiding styles only ever apply when we can
 * actually un-hide things — without JS the page renders fully visible.
 *
 * Re-runs on navigation rather than watching the DOM: a MutationObserver over
 * the whole body fires constantly (Next's dev overlay alone is enough) and a
 * full re-query on every mutation is expensive on long pages.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("js");
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of document.querySelectorAll("[data-reveal]")) {
        el.classList.add("is-visible");
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    for (const el of document.querySelectorAll("[data-reveal]:not(.is-visible)")) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
