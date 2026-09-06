import { ArchiveImage } from "@/components/archive-image";
import { Button, Grain } from "@/components/ui";
import { gatherings, site } from "@/lib/site";

/**
 * Type-led rather than photo-led on purpose.
 *
 * The migrated archive is warm and genuine but technically soft — 2013-2019
 * phone and compact-camera shots. Blown up to a full-bleed hero, the first
 * thing a visitor sees would be the weakest asset on the site. The display type
 * carries the opening instead, and the photography arrives further down at a
 * size that flatters it.
 */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-ink-deep text-paper">
      <Grain />

      {/* Offset image panel: present, but never asked to fill the viewport. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] lg:block">
        <ArchiveImage
          src="/media/2020/11/TC-Church-transparent-W-M_9-7-17_min-min-scaled-1.jpg"
          alt=""
          treatment="mono"
          priority
          sizes="50vw"
          className="h-full w-full opacity-30"
        />
        {/* Long falloff so there is no visible seam where the panel begins. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-deep via-ink-deep/80 to-ink-deep/30" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink-deep to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-deep to-transparent" />
      </div>

      <div className="container-page relative pb-16 pt-[calc(var(--header-height)+6rem)] md:pb-20 md:pt-[calc(var(--header-height)+9rem)]">
        <p className="label flex items-center gap-3 text-paper/45">
          <span className="h-px w-8 bg-accent" />
          {site.tagline}
        </p>

        <h1 className="mt-9 max-w-[15ch] font-display text-6xl text-paper">
          Transformed,
          <br />
          to transform.
        </h1>

        <p className="mt-10 max-w-xl text-lg leading-relaxed text-paper/65">
          A multicultural Pentecostal church in Rowley Regis, gathering in
          English and Malayalam. Whoever you are, wherever you&rsquo;ve come
          from, there&rsquo;s a place for you on Sunday.
        </p>

        <div className="mt-11 flex flex-wrap items-center gap-4">
          <Button href="/visit" tone="paper">
            Plan your visit
          </Button>
          <Button href="/sermons" tone="outlineLight">
            Listen to a sermon
          </Button>
        </div>
      </div>

      {/* Standing information: the detail most first-time visitors came for. */}
      <div className="container-page relative">
        <dl className="grid grid-cols-1 gap-px border-t border-paper/12 sm:grid-cols-3">
          {gatherings.map((g) => (
            <div key={`${g.language}-${g.start}`} className="py-8 sm:pr-8">
              <dt className="label text-paper/40">Sunday · {g.language}</dt>
              <dd className="mt-3 font-display text-3xl text-paper">{g.time}</dd>
            </div>
          ))}

          <div className="border-t border-paper/12 py-8 sm:border-l sm:border-t-0 sm:pl-8">
            <dt className="label text-paper/40">Where</dt>
            <dd className="mt-3 leading-snug text-paper/80">
              {site.address.line1}
              <br />
              {site.address.town} {site.address.postcode}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
