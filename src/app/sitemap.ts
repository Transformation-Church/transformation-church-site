import type { MetadataRoute } from "next";

import { getPosts } from "@/lib/blog";
import { preachers, sermons, series } from "@/lib/content";
import { openVacancies } from "@/content/vacancies";
import { site } from "@/lib/site";

const STATIC_ROUTES = [
  { path: "/", priority: 1 },
  { path: "/visit", priority: 0.9 },
  { path: "/whats-on", priority: 0.85 },
  { path: "/about", priority: 0.8 },
  { path: "/sermons", priority: 0.8 },
  { path: "/gallery", priority: 0.7 },
  { path: "/blog", priority: 0.7 },
  { path: "/restore-foodbank", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/our-history", priority: 0.6 },
  { path: "/kids-space", priority: 0.5 },
  { path: "/spark", priority: 0.5 },
  { path: "/connect", priority: 0.5 },
  { path: "/privacy-policy", priority: 0.2 },
  { path: "/terms-of-use", priority: 0.2 },
  { path: "/cookie-policy", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const url = (path: string) => `${site.url}${path}`;

  const routes = [
    ...STATIC_ROUTES,
    ...(openVacancies().length > 0
      ? [
          { path: "/vacancies", priority: 0.6 },
          ...openVacancies().map((v) => ({
            path: `/vacancies/${v.slug}`,
            priority: 0.6,
          })),
        ]
      : []),
  ];

  return [
    ...routes.map((r) => ({
      url: url(r.path),
      priority: r.priority,
      changeFrequency: "monthly" as const,
    })),
    ...sermons.map((s) => ({
      url: url(`/sermons/${s.slug}`),
      lastModified: new Date(s.date),
      priority: 0.6,
    })),
    ...series.map((s) => ({ url: url(`/sermons/series/${s.slug}`), priority: 0.5 })),
    ...preachers.map((p) => ({ url: url(`/sermons/preacher/${p.slug}`), priority: 0.4 })),
    ...posts.map((p) => ({
      url: url(`/blog/${p.slug}`),
      lastModified: new Date(p.date),
      priority: 0.6,
    })),
  ];
}
