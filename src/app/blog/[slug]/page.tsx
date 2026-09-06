import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

import { JsonLd } from "@/components/json-ld";
import { Grain, TextLink } from "@/components/ui";
import { getPost, getPosts, getRelatedPosts } from "@/lib/blog";
import { formatDate } from "@/lib/content";
import { blogPostSchema, breadcrumbSchema, canonical } from "@/lib/seo";
import { urlForImage } from "@/sanity/client";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt.slice(0, 155),
    ...canonical(`/blog/${post.slug}`),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt.slice(0, 155),
      publishedTime: post.date,
      images: post.image ? [post.image] : undefined,
    },
  };
}

const portableComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const url = urlForImage(value)?.width(1400).fit("max").url();
      if (!url) return null;
      return (
        <figure className="my-10">
          {/* Sanity's CDN is already serving an optimised, correctly sized
              asset here, so next/image would add a hop for no gain. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={value?.alt || ""} className="w-full" loading="lazy" />
          {value?.alt && (
            <figcaption className="label mt-3 text-ink-muted">{value.alt}</figcaption>
          )}
        </figure>
      );
    },
  },
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post);

  return (
    <>
      <JsonLd
        data={[
          blogPostSchema(post),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <article>
        <header className="relative overflow-hidden bg-ink-deep text-paper">
          <Grain />
          <div className="container-page relative pb-16 pt-[calc(var(--header-height)+4rem)] md:pb-20 md:pt-[calc(var(--header-height)+6rem)]">
            <TextLink href="/blog" tone="paper">
              All writing
            </TextLink>

            <div className="mt-10 max-w-3xl">
              {post.categories.length > 0 && (
                <p className="label mb-5 flex flex-wrap gap-x-4 text-accent-soft">
                  {post.categories.map((c) => (
                    <span key={c.slug}>{c.name}</span>
                  ))}
                </p>
              )}
              <h1 className="font-display text-4xl text-paper">{post.title}</h1>

              <p className="label mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-paper-muted">
                <span>{formatDate(post.date)}</span>
                {post.author && (
                  <>
                    <span className="h-px w-6 bg-paper/25" />
                    <span>{post.author}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </header>

        <div className="container-page py-16 md:py-24">
          <div className="container-prose prose-tc">
            {post.body ? (
              <PortableText value={post.body} components={portableComponents} />
            ) : (
              post.paragraphs?.map((p, i) => <p key={i}>{p}</p>)
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-paper-warm">
          <div className="container-page py-20 md:py-24">
            <h2 className="font-display text-3xl">Keep reading</h2>
            <div className="mt-10 border-t border-rule">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group grid grid-cols-12 items-baseline gap-x-8 gap-y-2 border-b border-rule py-6 transition-colors duration-500 hover:border-ink/35"
                >
                  <span className="label col-span-12 text-ink-muted md:col-span-3">
                    {formatDate(p.date)}
                  </span>
                  <span className="col-span-12 font-display text-xl transition-transform duration-500 ease-[var(--ease-out-expo)] md:col-span-9 md:group-hover:translate-x-1">
                    {p.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
