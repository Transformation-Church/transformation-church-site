import type { Metadata, Viewport } from "next";
import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";
import { sanityEnabled } from "@/sanity/env";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function StudioPage() {
  if (!sanityEnabled) {
    return (
      <div className="container-page py-40">
        <h1 className="font-display text-3xl">Studio not configured</h1>
        <p className="mt-5 max-w-lg text-lg text-ink-muted">
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> in your environment to
          enable the Sanity Studio here. Until then the blog reads from the
          posts migrated out of WordPress.
        </p>
      </div>
    );
  }

  return <NextStudio config={config} />;
}
