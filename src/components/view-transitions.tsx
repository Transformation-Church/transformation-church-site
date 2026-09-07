"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Cross-page transitions.
 *
 * Every route opens on the same navy title block, so a hard cut between them
 * throws away the one thing that makes the site feel continuous. This runs the
 * browser's own View Transitions API over App Router navigation: the outgoing
 * page fades, the incoming one rises into place, and the fixed header and
 * footer are named so they sit still through it rather than flickering.
 *
 * Next has experimental.viewTransition, but it needs React's experimental
 * channel — not something to ship on a church website. Driving
 * document.startViewTransition directly works on stable React, and every guard
 * below falls back to ordinary navigation rather than breaking it:
 *
 *   - no View Transitions support (Firefox today): plain navigation
 *   - prefers-reduced-motion: plain navigation
 *   - modified clicks, downloads, new tabs, external links, mailto, in-page
 *     anchors and the Sanity Studio: left entirely alone
 *
 * The timeout matters. startViewTransition holds the old frame on screen until
 * the callback settles, so a slow route would look like a hang. Pages here are
 * static and prefetched, so 400ms is generous; past that we release and let the
 * navigation finish normally.
 *
 * The listener has to be on the capture phase. Next's Link calls
 * preventDefault() in its own handler on the anchor, which runs before anything
 * bubbling to the document, so a bubble-phase listener sees every internal
 * navigation as already handled and skips the one case it exists for. Capturing
 * means we decide first, and stopping propagation there keeps Link from also
 * pushing the route behind us.
 */

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => Promise<void> | void) => unknown;
};

export function ViewTransitions() {
  const router = useRouter();
  const pathname = usePathname();

  // Resolves the in-flight transition once the new route has committed.
  const release = useRef<(() => void) | null>(null);

  useEffect(() => {
    release.current?.();
  }, [pathname]);

  // Keyed on the router alone, so a navigation never rebinds the listener.
  useEffect(() => {
    const doc = document as ViewTransitionDocument;
    if (typeof doc.startViewTransition !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a");
      // SVG anchors have an SVGAnimatedString href, not a string.
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      // mailto: and tel: give an opaque origin, so this rejects them too.
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page: an in-page anchor, which should just scroll.
      if (url.pathname === window.location.pathname) return;
      // Sanity Studio brings its own routing and its own chrome.
      if (url.pathname.startsWith("/studio")) return;

      event.preventDefault();
      // Link would otherwise navigate too, behind the transition.
      event.stopPropagation();

      doc.startViewTransition!(
        () =>
          new Promise<void>((resolve) => {
            let done = false;
            const finish = () => {
              if (done) return;
              done = true;
              release.current = null;
              resolve();
            };

            release.current = finish;
            router.push(url.pathname + url.search + url.hash);
            window.setTimeout(finish, 400);
          }),
      );
    };

    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, [router]);

  return null;
}
