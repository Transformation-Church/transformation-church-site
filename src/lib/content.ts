/**
 * Typed access to the datasets produced by scripts/migrate-wordpress.py.
 *
 * Sermons, preachers and series are archival and change rarely, so they ship as
 * JSON in the bundle rather than through a CMS — no network hop, no query cost.
 * Re-run the migration script to refresh them.
 */

import sermonsData from "@/content/sermons.json";
import preachersData from "@/content/preachers.json";
import seriesData from "@/content/series.json";
import serviceTypesData from "@/content/service-types.json";
import galleryData from "@/content/gallery.json";
import kidsSpaceData from "@/content/kids-space.json";
import sparkData from "@/content/spark.json";
import postsData from "@/content/posts.json";

export type Term = { slug: string; name: string };

export type Sermon = {
  slug: string;
  title: string;
  date: string;
  preacher: Term | null;
  series: Term | null;
  serviceType: Term | null;
  youtubeId: string | null;
  passage: string | null;
  description: string;
  image: string | null;
};

export type Facet = {
  slug: string;
  name: string;
  description: string;
  count: number;
  latest: string;
};

export type GalleryCategory = {
  title: string;
  group: string | null;
  images: string[];
};

export type Video =
  | { provider: "youtube"; id: string }
  | { provider: "facebook"; url: string };

export type VideoCollection = { title: string; videos: Video[] };

export type VideoPage = {
  title: string;
  intro: string;
  collections: VideoCollection[];
};

export type Post = {
  slug: string;
  title: string;
  author: string | null;
  date: string;
  categories: Term[];
  tags: string[];
  excerpt: string;
  body: string[];
  image: string | null;
};

export const sermons = sermonsData as Sermon[];
export const preachers = preachersData as Facet[];
export const series = seriesData as Facet[];
export const serviceTypes = serviceTypesData as Facet[];
export const gallery = galleryData as GalleryCategory[];
export const kidsSpace = kidsSpaceData as VideoPage;
export const spark = sparkData as VideoPage;
export const posts = postsData as Post[];

// ---------------------------------------------------------------- sermons

export function getSermon(slug: string) {
  return sermons.find((s) => s.slug === slug);
}

export function sermonsBy(key: "preacher" | "series" | "serviceType", slug: string) {
  return sermons.filter((s) => s[key]?.slug === slug);
}

/** Previous / next in the archive's reverse-chronological order. */
export function sermonNeighbours(slug: string) {
  const i = sermons.findIndex((s) => s.slug === slug);
  if (i === -1) return { newer: undefined, older: undefined };
  return { newer: sermons[i - 1], older: sermons[i + 1] };
}

/** Other sermons worth surfacing alongside this one. */
export function relatedSermons(sermon: Sermon, limit = 3) {
  const pool = sermon.series
    ? sermonsBy("series", sermon.series.slug)
    : sermon.preacher
      ? sermonsBy("preacher", sermon.preacher.slug)
      : [];

  const related = pool.filter((s) => s.slug !== sermon.slug).slice(0, limit);
  if (related.length >= limit) return related;

  const seen = new Set([sermon.slug, ...related.map((s) => s.slug)]);
  return [...related, ...sermons.filter((s) => !seen.has(s.slug))].slice(0, limit);
}

export function getFacet(list: Facet[], slug: string) {
  return list.find((f) => f.slug === slug);
}

// ---------------------------------------------------------------- posts

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

/** Distinct post categories, most-used first. */
export function postCategories() {
  const counts = new Map<string, { term: Term; count: number }>();
  for (const p of posts) {
    for (const c of p.categories) {
      const entry = counts.get(c.slug);
      if (entry) entry.count += 1;
      else counts.set(c.slug, { term: c, count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

export function relatedPosts(post: Post, limit = 3) {
  const slugs = new Set(post.categories.map((c) => c.slug));
  const scored = posts
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: p.categories.filter((c) => slugs.has(c.slug)).length }))
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1));
  return scored.slice(0, limit).map((s) => s.p);
}

// ---------------------------------------------------------------- gallery

/** Gallery categories arranged into their display groups, in source order. */
export function galleryGroups() {
  const groups: { name: string | null; categories: GalleryCategory[] }[] = [];
  for (const c of gallery) {
    const last = groups[groups.length - 1];
    if (last && last.name === c.group) last.categories.push(c);
    else groups.push({ name: c.group, categories: [c] });
  }
  return groups;
}

export const galleryImageCount = gallery.reduce((n, c) => n + c.images.length, 0);

// ---------------------------------------------------------------- formatting

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string) {
  return LONG_DATE.format(new Date(`${iso}T00:00:00Z`));
}

export function formatDateShort(iso: string) {
  return SHORT_DATE.format(new Date(`${iso}T00:00:00Z`));
}

export function year(iso: string) {
  return iso.slice(0, 4);
}
