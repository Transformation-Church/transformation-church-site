import type { Metadata } from "next";
import { Suspense } from "react";

import { canonical } from "@/lib/seo";
import Link from "next/link";

import { SermonArchive } from "@/components/sermon-archive";
import { PageHeader, TextLink } from "@/components/ui";
import { preachers, sermons, series, serviceTypes } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sermons",
  description: `Catch up on ${sermons.length} sermons from Transformation Church. Filter by preacher, series or service.`,
  ...canonical("/sermons"),
};

export default function SermonsPage() {
  // Open-ended on purpose: the archive is still being added to, so a closing
  // year would go stale the moment it did. The opening year is the earliest we
  // can date, which is not the oldest sermon here — the undated ones go back
  // further, they just carry nothing to date them by.
  const dated = sermons.filter((s) => s.date).map((s) => Number(s.date!.slice(0, 4)));
  const span = `${Math.min(...dated)} to now`;

  return (
    <>
      <PageHeader
        eyebrow="Sermons"
        title="Catch up, or go back to the beginning"
        lede="Every message we've recorded, with the preacher, series and passage behind it."
        meta={
          <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { k: "Sermons", v: sermons.length },
              { k: "Preachers", v: preachers.length },
              { k: "Series", v: series.length },
              { k: "Years", v: span },
            ].map((s) => (
              <div key={s.k}>
                <dt className="label text-paper-muted">{s.k}</dt>
                <dd className="mt-2 font-display text-2xl text-paper tabular-nums">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        }
      >
        <div className="mt-10">
          <TextLink href={site.social.youtube} tone="paper" external>
            Subscribe on YouTube
          </TextLink>
        </div>
      </PageHeader>

      <section className="bg-paper">
        <div className="container-page py-16 md:py-20">
          {/* SermonArchive reads the URL for its filter state, so it needs a
              Suspense boundary to keep this page statically rendered. */}
          <Suspense
            fallback={
              <div className="border-b border-rule pb-10">
                <p className="label text-ink-muted">Loading the archive</p>
              </div>
            }
          >
            <SermonArchive
              sermons={sermons}
              preachers={preachers}
              series={series}
              serviceTypes={serviceTypes}
            />
          </Suspense>
        </div>
      </section>

      {/* Series index: a second way into the archive. */}
      <section className="bg-paper-warm">
        <div className="container-page py-20 md:py-24">
          <h2 className="font-display text-3xl">Browse by series</h2>
          <ul className="mt-10 grid gap-x-10 gap-y-px sm:grid-cols-2 lg:grid-cols-3">
            {series.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/sermons/series/${s.slug}`}
                  className="group flex items-baseline justify-between gap-4 border-b border-rule py-4 transition-colors duration-400 hover:border-ink/40"
                >
                  <span className="font-display text-lg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                    {s.name}
                  </span>
                  <span className="label shrink-0 tabular-nums text-ink-muted">
                    {s.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-20 font-display text-3xl">Browse by preacher</h2>
          <ul className="mt-10 grid gap-x-10 gap-y-px sm:grid-cols-2 lg:grid-cols-3">
            {preachers.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/sermons/preacher/${p.slug}`}
                  className="group flex items-baseline justify-between gap-4 border-b border-rule py-4 transition-colors duration-400 hover:border-ink/40"
                >
                  <span className="font-display text-lg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                    {p.name}
                  </span>
                  <span className="label shrink-0 tabular-nums text-ink-muted">
                    {p.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
