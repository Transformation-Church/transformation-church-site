import type { NextConfig } from "next";

/**
 * Until the site is live on transformationchurch.co.uk, keep it out of search
 * results: the .vercel.app URL would otherwise be indexed as duplicate content
 * against the old WordPress site still serving that domain.
 *
 * Set SITE_INDEXABLE=true in Vercel's production environment at launch.
 * robots.txt alone is advisory, so this sends the header too, which is not.
 */
const indexable = process.env.SITE_INDEXABLE === "true";

const nextConfig: NextConfig = {
  async headers() {
    if (indexable) return [];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  // A stray lockfile in the user's home directory otherwise wins root inference.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
