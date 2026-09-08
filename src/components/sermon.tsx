import Link from "next/link";

import { RemoteImage } from "@/components/remote-image";

import { Arrow } from "@/components/ui";
import {
  formatDate,
  formatDateShort,
  formatDayMonth,
  isExactDate,
  year,
  type Sermon,
} from "@/lib/content";

/**
 * Every sermon has local artwork: the church's own title cards from WordPress,
 * or its YouTube thumbnail downloaded once by scripts/fetch-sermon-thumbnails.py
 * and served from our domain like everything else.
 *
 * The remote fallback is a safety net for a sermon added by hand before that
 * script has run. It is 4:3 with letterboxing baked in, so cropped to a 16:9
 * card it slices the top off the title, which is exactly what these cards are
 * for. Run the script rather than let it stand.
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
      {/* Day and month only: SermonList's rail carries the year. */}
      <div className="col-span-2 hidden md:block">
        {isExactDate(sermon.date) && (
          <span className="label tabular-nums text-ink-muted">
            {formatDayMonth(sermon.date)}
          </span>
        )}
      </div>

      <div className="col-span-12 md:col-span-6">
        {sermon.series && (
          <span className="label mb-2 block text-accent">{sermon.series.name}</span>
        )}
        <h3 className="font-display text-xl transition-transform duration-500 ease-[var(--ease-out-expo)] md:group-hover:translate-x-1">
          {sermon.title}
        </h3>
        {/* No rail on narrow screens, so the row keeps the full date. */}
        {sermon.date && (
          <span className="label mt-2 block text-ink-muted md:hidden">
            {isExactDate(sermon.date) ? formatDateShort(sermon.date) : sermon.date}
          </span>
        )}
      </div>

      <div className="col-span-8 md:col-span-3">
        {sermon.preacher && (
          <span className="text-sm text-ink-muted">{sermon.preacher.name}</span>
        )}
      </div>

      <div className="col-span-4 flex justify-end md:col-span-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-rule text-ink-muted transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
          <Arrow />
        </span>
      </div>

      {image && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-16 top-1/2 z-10 hidden h-24 w-40 -translate-y-1/2 scale-95 overflow-hidden opacity-0 shadow-2xl transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100 xl:block"
        >
          <RemoteImage
            src={image}
            alt=""
            sizes="160px"
            className="object-cover"
          />
        </span>
      )}
    </Link>
  );
}

/* -------------------------------------------------------------- year rail */

/**
 * The archive as a run of years.
 *
 * A hundred and sixty five rows of the same shape scroll past with nothing to
 * hold onto — you lose your place the moment you look away. Grouping by year
 * and pinning the year alongside its own rows gives the list a spine, and lets
 * each row drop the year it was repeating.
 *
 * Pure CSS: `position: sticky` inside each year's own section, so the marker
 * travels with its group and is released by the next one. No scroll listener.
 */
export function SermonList({ sermons }: { sermons: Sermon[] }) {
  // Undated sermons sit where the channel put them rather than in one block,
  // so "Undated" can appear more than once: above the newest dated sermon for
  // recent uploads, and below the oldest for the back catalogue. The key has
  // to carry the first slug, since the label alone repeats.
  const groups: { year: string; sermons: Sermon[] }[] = [];
  for (const sermon of sermons) {
    const y = year(sermon.date) ?? "Undated";
    if (groups.at(-1)?.year !== y) groups.push({ year: y, sermons: [] });
    groups.at(-1)!.sermons.push(sermon);
  }

  return (
    <div className="border-t border-rule">
      {groups.map((group) => (
        // A div, not a labelled section. Interleaving means a label repeats
        // — "Undated" three times, 2021 twice — and landmarks have to be
        // uniquely named. The headings below already carry the outline.
        <div
          key={`${group.year}-${group.sermons[0].slug}`}
          className="md:grid md:grid-cols-12 md:gap-x-6"
        >
          <div className="md:col-span-1">
            {/*
              The year outranks the row titles below it, so it has to stay in
              the heading outline at every width. The rail is only drawn from md
              up, where there is a gutter to hold it, so narrow screens get the
              same heading announced but not painted. Two elements rather than
              one because sr-only and sticky both set `position`.
            */}
            <h2 className="sr-only md:hidden">{group.year}</h2>
            <h2
              className={`sticky top-[calc(var(--header-height)+1.5rem)] hidden py-6 font-display tabular-nums text-ink-muted md:block ${
                group.year === "Undated" ? "text-lg" : "text-2xl"
              }`}
            >
              {group.year}
            </h2>
          </div>

          <div className="md:col-span-11">
            {group.sermons.map((sermon) => (
              <SermonRow key={sermon.slug} sermon={sermon} />
            ))}
          </div>
        </div>
      ))}
    </div>
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
          <RemoteImage
            src={image}
            alt=""
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
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

      <span className="label mt-6 flex items-center gap-3 text-ink-muted">
        {sermon.date && (
          <span className="tabular-nums">
            {isExactDate(sermon.date) ? formatDate(sermon.date) : sermon.date}
          </span>
        )}
        {sermon.series && (
          <>
            <span className="h-px w-4 bg-rule-strong" />
            <span className="text-accent">{sermon.series.name}</span>
          </>
        )}
      </span>

      <h3 className="mt-3 font-display text-xl">{sermon.title}</h3>

      {sermon.preacher && (
        <span className="mt-2 text-sm text-ink-muted">{sermon.preacher.name}</span>
      )}
    </Link>
  );
}
