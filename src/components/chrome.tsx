"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Analytics } from "@/components/analytics";
import { ConsentProvider } from "@/components/consent";
import { ViewTransitions } from "@/components/view-transitions";

/**
 * Site chrome wrapper.
 *
 * The Sanity Studio takes over the whole viewport and brings its own UI, so it
 * renders without the header and footer. Doing the check here — rather than in
 * the root layout — keeps every page statically rendered; reading headers() in
 * the layout would opt the entire site into dynamic rendering.
 *
 * Header and Footer are passed in as already-rendered server components.
 *
 * ViewTransitions mounts here rather than in the layout so the Studio, which
 * does its own routing, never has its navigation intercepted.
 */
export function Chrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const bare = pathname.startsWith("/studio");

  if (bare) return <>{children}</>;

  return (
    <ConsentProvider>
      <Analytics />
      <ViewTransitions />
      {header}
      <main id="main">{children}</main>
      {footer}
    </ConsentProvider>
  );
}
