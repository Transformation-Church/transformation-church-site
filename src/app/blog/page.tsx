import type { Metadata } from "next";

import { canonical } from "@/lib/seo";
import Link from "next/link";

import { PageHeader, Section } from "@/components/ui";
import { getPostCategories, getPosts } from "@/lib/blog";
import { formatDate } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Reflections, articles and poetry from the people of Transformation Church.",
  ...canonical("/blog"),
};

export default async function BlogPage() {
  const posts = await getPosts();
  const categories = await getPostCategories();

  return (
    <>
      <PageHeader
        eyebrow="Read & listen"
        title="Words for your week"
        lede="We share insights and reflections for your spiritual nourishment. Join us to start learning, experiencing and growing in the Lord Jesus Christ."
        meta={
          categories.length > 0 ? (
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {categories.map((c) => (
                <li key={c.slug} className="label text-paper/55">
                  {c.name}{" "}
                  <span className="tabular-nums text-paper/55">{c.count}</span>
                </li>
              ))}
            </ul>
          ) : undefined
        }
      />

      <Section>
        {posts.length === 0 ? (
          <p className="py-20 text-center text-lg text-ink/70">
            There&rsquo;s nothing published yet. Check back soon.
          </p>
        ) : (
          <div className="border-t border-rule">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group grid grid-cols-12 items-baseline gap-x-8 gap-y-3 border-b border-rule py-8 transition-colors duration-500 hover:border-ink/35"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${Math.min(i, 6) * 60}ms` }}
              >
                <span className="label col-span-12 text-ink/70 md:col-span-2">
                  {formatDate(post.date)}
                </span>

                <span className="col-span-12 md:col-span-7">
                  <span className="block font-display text-2xl transition-transform duration-500 ease-[var(--ease-out-expo)] md:group-hover:translate-x-1">
                    {post.title}
                  </span>
                  {post.author && (
                    <span className="mt-1.5 block text-sm text-ink/70">
                      by {post.author}
                    </span>
                  )}
                  {post.excerpt && (
                    <span className="mt-3 block max-w-xl text-ink/70">
                      {post.excerpt.slice(0, 150)}
                      {post.excerpt.length > 150 ? "…" : ""}
                    </span>
                  )}
                </span>

                <span className="label col-span-12 flex flex-wrap gap-x-3 text-accent md:col-span-3 md:justify-end">
                  {post.categories.map((c) => (
                    <span key={c.slug}>{c.name}</span>
                  ))}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
