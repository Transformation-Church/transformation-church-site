import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Search engines are kept out until the site is actually live on its own
 * domain. Set SITE_INDEXABLE=true in the production environment at launch.
 *
 * Without this the .vercel.app URL gets indexed as duplicate content against
 * transformationchurch.co.uk, which still serves the old WordPress site.
 */
const indexable = process.env.SITE_INDEXABLE === "true";

export default function robots(): MetadataRoute.Robots {
  if (!indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/studio" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
