import Image from "next/image";
import Link from "next/link";

import { Arrow } from "@/components/ui";
import { formatDateShort, formatDate, type Sermon } from "@/lib/content";

/**
 * Prefer the artwork migrated from WordPress.
 *
 * Every sermon has one, they are the church's own designed 16:9 title cards at
 * full resolution, and they serve from our own domain. YouTube's `hqdefault`
 * is 4:3 with letterboxing baked in, so cropping it to 16:9 slices the top off
 * the title — which is exactly what these cards are for.
 */
export function thumbnail(sermon: Sermon) {
  if (sermon.image) return sermon.image;
  return sermon.youtubeId
    ? `https://i.ytimg.com/vi/${sermon.youtubeId}/hqdefault.jpg`
    : null;
}

/* --------------------------------------------------------------- index row */

/**
 * One line of the archive. Reads as an index entry rather than a card, which
 * is what lets 167 sermons sit on a page without turning into wallpaper.
 */
export function SermonRow({ sermon }: { sermon: Sermon }) {
  const image = thumbnail(sermon);

  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className="group relative grid grid-cols-12 items-center gap-x-6 gap-y-2 border-b border-rule py-6 transition-colors duration-500 hover:border-ink/35"
    >
      <div className="col-span-2 hidden md:block">
        <span className="label tabular-nums text-ink/40">
          {formatDateShort(sermon.date)}
        </span>
      </div>

      <div className="col-span-12 md:col-span-6">
        {sermon.series && (
          <span className="label mb-2 block text-accent">{sermon.series.name}</span>
        )}
        <h3 className="font-display text-xl transition-transform duration-500 ease-[var(--ease-out-expo)] md:group-hover:translate-x-1">
          {sermon.title}
        </h3>
        <span className="label mt-2 block text-ink/40 md:hidden">
          {formatDateShort(sermon.date)}
        </span>
      </div>

      <div className="col-span-8 md:col-span-3">
        {sermon.preacher && (
          <span className="text-sm text-ink/55">{sermon.preacher.name}</span>
        )}
      </div>

      <div className="col-span-4 flex justify-end md:col-span-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-rule text-ink/45 transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
          <Arrow />
        </span>
      </div>

      {image && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-16 top-1/2 z-10 hidden h-24 w-40 -translate-y-1/2 scale-95 overflow-hidden opacity-0 shadow-2xl transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100 xl:block"
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="160px"
            className="object-cover"
            unoptimized={image.startsWith("http")}
          />
        </span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------- card */

/** The featured treatment, used for the newest few on the homepage. */
export function SermonCard({
  sermon,
  index,
}: {
  sermon: Sermon;
  index?: number;
}) {
  const image = thumbnail(sermon);

  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className="group flex flex-col"
      data-reveal
      style={index !== undefined ? { ["--reveal-delay" as string]: `${index * 90}ms` } : undefined}
    >
      <span className="relative block aspect-video overflow-hidden bg-ink/10">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
            unoptimized={image.startsWith("http")}
          />
        )}
        <span className="absolute inset-0 bg-ink/15 transition-opacity duration-700 group-hover:opacity-0" />
        {/* Badge sits top-right: the church's title cards carry the series name
            and preacher along the bottom-left, which a badge there would cover. */}
        {sermon.youtubeId && (
          <span className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-paper/90 text-ink backdrop-blur transition-colors duration-500 group-hover:bg-accent group-hover:text-paper">
            <svg viewBox="0 0 12 14" className="ml-0.5 h-3.5 w-3.5" fill="currentColor" aria-hidden>
              <path d="M0 0l12 7-12 7z" />
            </svg>
          </span>
        )}
      </span>

      <span className="label mt-6 flex items-center gap-3 text-ink/40">
        <span className="tabular-nums">{formatDate(sermon.date)}</span>
        {sermon.series && (
          <>
            <span className="h-px w-4 bg-rule-strong" />
            <span className="text-accent">{sermon.series.name}</span>
          </>
        )}
      </span>

      <h3 className="mt-3 font-display text-xl">{sermon.title}</h3>

      {sermon.preacher && (
        <span className="mt-2 text-sm text-ink/55">{sermon.preacher.name}</span>
      )}
    </Link>
  );
}
