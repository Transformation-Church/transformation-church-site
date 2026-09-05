import type { PortableTextBlock } from "@portabletext/react";

import { posts as migrated, type Post as MigratedPost } from "@/lib/content";
import { client } from "@/sanity/client";

/**
 * Blog data access.
 *
 * Reads from Sanity when a project is configured, and otherwise serves the nine
 * posts migrated out of WordPress. That fallback is what lets the site ship and
 * deploy before the CMS exists, and it keeps the blog alive if Sanity is ever
 * unreachable at build time.
 */

export type BlogPost = {
  slug: string;
  title: string;
  author: string | null;
  date: string;
  categories: { slug: string; name: string }[];
  excerpt: string;
  /** Sanity posts carry portable text; migrated posts carry plain paragraphs. */
  body: PortableTextBlock[] | null;
  paragraphs: string[] | null;
  image: string | null;
};

function fromMigrated(p: MigratedPost): BlogPost {
  return {
    slug: p.slug,
    title: p.title,
    author: p.author,
    date: p.date,
    categories: p.categories,
    excerpt: p.excerpt || p.body[0] || "",
    body: null,
    paragraphs: p.body,
    image: p.image,
  };
}

const POST_FIELDS = /* groq */ `
  "slug": slug.current,
  title,
  "author": author->name,
  "date": publishedAt,
  "categories": categories[]->{ "slug": slug.current, "name": title },
  excerpt,
  body,
  "image": coverImage.asset->url
`;

type SanityPost = Omit<BlogPost, "paragraphs" | "categories"> & {
  categories: { slug: string; name: string }[] | null;
};

function fromSanity(p: SanityPost): BlogPost {
  return {
    ...p,
    date: (p.date || "").slice(0, 10),
    categories: p.categories ?? [],
    paragraphs: null,
  };
}

export async function getPosts(): Promise<BlogPost[]> {
  if (!client) return migrated.map(fromMigrated);

  try {
    const rows = await client.fetch<SanityPost[]>(
      /* groq */ `*[_type == "post" && defined(slug.current)]
        | order(publishedAt desc) { ${POST_FIELDS} }`,
      {},
      { next: { revalidate: 60 } },
    );
    return rows.length > 0 ? rows.map(fromSanity) : migrated.map(fromMigrated);
  } catch {
    return migrated.map(fromMigrated);
  }
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const all = await getPosts();
  return all.find((p) => p.slug === slug);
}

export async function getRelatedPosts(post: BlogPost, limit = 3) {
  const all = await getPosts();
  const slugs = new Set(post.categories.map((c) => c.slug));

  return all
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: p.categories.filter((c) => slugs.has(c.slug)).length }))
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, limit)
    .map((s) => s.p);
}

export async function getPostCategories() {
  const all = await getPosts();
  const counts = new Map<string, { slug: string; name: string; count: number }>();

  for (const p of all) {
    for (const c of p.categories) {
      const entry = counts.get(c.slug);
      if (entry) entry.count += 1;
      else counts.set(c.slug, { ...c, count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}
