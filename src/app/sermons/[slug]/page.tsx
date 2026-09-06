import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { SermonCard, thumbnail } from "@/components/sermon";
import { Grain, TextLink } from "@/components/ui";
import { YouTubeEmbed } from "@/components/video-embed";
import {
  formatDate,
  getSermon,
  relatedSermons,
  sermonNeighbours,
  sermons,
} from "@/lib/content";
import { breadcrumbSchema, canonical, sermonSchema } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return sermons.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sermon = getSermon(slug);
  if (!sermon) return {};

  const by = sermon.preacher ? ` by ${sermon.preacher.name}` : "";
  return {
    title: sermon.title,
    ...canonical(`/sermons/${sermon.slug}`),
    description:
      sermon.description.slice(0, 155) ||
      `${sermon.title}${by}, preached at Transformation Church on ${formatDate(sermon.date)}.`,
    openGraph: {
      type: "article",
      title: sermon.title,
      description: sermon.description.slice(0, 155),
      images: thumbnail(sermon) ? [thumbnail(sermon) as string] : undefined,
    },
  };
}

export default async function SermonPage({ params }: Props) {
  const { slug } = await params;
  const sermon = getSermon(slug);
  if (!sermon) notFound();

  const { newer, older } = sermonNeighbours(slug);
  const related = relatedSermons(sermon);

  const facts = [
    { k: "Preached", v: formatDate(sermon.date) },
    sermon.preacher && {
      k: "Preacher",
      v: sermon.preacher.name,
      href: `/sermons/preacher/${sermon.preacher.slug}`,
    },
    sermon.series && {
      k: "Series",
      v: sermon.series.name,
      href: `/sermons/series/${sermon.series.slug}`,
    },
    sermon.serviceType && { k: "Service", v: sermon.serviceType.name },
    sermon.passage && { k: "Passage", v: sermon.passage },
  ].filter(Boolean) as { k: string; v: string; href?: string }[];

  return (
    <>
      <JsonLd
        data={[
          sermonSchema(sermon, thumbnail(sermon)),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Sermons", path: "/sermons" },
            { name: sermon.title, path: `/sermons/${sermon.slug}` },
          ]),
        ]}
      />

      <article>
        {/* header */}
        <header className="relative overflow-hidden bg-ink-deep text-paper">
          <Grain />
          <div className="container-page relative pb-16 pt-[calc(var(--header-height)+4rem)] md:pb-20 md:pt-[calc(var(--header-height)+6rem)]">
            <TextLink href="/sermons" tone="paper">
              All sermons
            </TextLink>

            {sermon.series && (
              <p className="label mt-10 text-accent-soft">{sermon.series.name}</p>
            )}
            <h1 className="mt-4 max-w-4xl font-display text-4xl text-paper">
              {sermon.title}
            </h1>

            <dl className="mt-12 grid gap-x-10 gap-y-6 border-t border-paper/12 pt-8 sm:grid-cols-2 lg:grid-cols-5">
              {facts.map((f) => (
                <div key={f.k}>
                  <dt className="label text-paper-muted">{f.k}</dt>
                  <dd className="mt-2 text-paper-body">
                    {f.href ? (
                      <Link href={f.href} className="link-underline">
                        {f.v}
                      </Link>
                    ) : (
                      f.v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {/* body */}
        <div className="container-page py-16 md:py-20">
          <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {sermon.youtubeId ? (
                <YouTubeEmbed
                  id={sermon.youtubeId}
                  title={sermon.title}
                  poster={sermon.image}
                />
              ) : (
                <div className="border border-rule bg-wash p-10 text-center">
                  <p className="text-ink-muted">
                    There&rsquo;s no recording available for this sermon.
                  </p>
                  <div className="mt-5 flex justify-center">
                    <TextLink href={site.social.youtube} external>
                      Browse our YouTube channel
                    </TextLink>
                  </div>
                </div>
              )}

              {sermon.description && (
                <div className="prose-tc mt-12">
                  {sermon.description.split("\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </div>

            <aside className="lg:col-span-3 lg:col-start-10">
              <h2 className="label text-ink-muted">Keep listening</h2>
              <div className="mt-6 space-y-px">
                {newer && (
                  <Link
                    href={`/sermons/${newer.slug}`}
                    className="group block border-t border-rule py-5"
                  >
                    <span className="label text-ink-muted">Next</span>
                    <span className="mt-2 block font-display text-lg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                      {newer.title}
                    </span>
                  </Link>
                )}
                {older && (
                  <Link
                    href={`/sermons/${older.slug}`}
                    className="group block border-t border-rule py-5"
                  >
                    <span className="label text-ink-muted">Previous</span>
                    <span className="mt-2 block font-display text-lg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                      {older.title}
                    </span>
                  </Link>
                )}
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* related */}
      {related.length > 0 && (
        <section className="bg-paper-warm">
          <div className="container-page py-20 md:py-24">
            <h2 className="font-display text-3xl">
              {sermon.series ? `More from ${sermon.series.name}` : "More sermons"}
            </h2>
            <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s, i) => (
                <SermonCard key={s.slug} sermon={s} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
