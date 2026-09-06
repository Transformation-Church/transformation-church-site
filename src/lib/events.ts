import { site } from "@/lib/site";

/**
 * Events from ChurchSuite.
 *
 * Read from the public calendar JSON feed rather than dropping in their
 * iframe. The iframe would work, but its contents are invisible to search
 * engines, can't carry our structured data, sits in a fixed-height box that
 * fights the layout, and loads third-party cookies on a site that currently
 * sets none. Reading the JSON keeps all of that ours.
 *
 * Endpoint shape:
 *   https://{account}.churchsuite.com/-/calendar/{uuid}/json
 *
 * Note: at the time of writing the church's calendar is empty (num_results: 0),
 * so the per-event field mapping below is written defensively against several
 * plausible key names and has NOT been verified against real event data. Once
 * a real event exists in ChurchSuite, check a live entry renders correctly.
 */

const FEED_UUID =
  process.env.CHURCHSUITE_CALENDAR_UUID ??
  "b7a11412-27cf-4658-afd0-139a4c58fb00";

export const CHURCHSUITE_CALENDAR_URL = `${site.churchSuite.base}/-/calendar/${FEED_UUID}`;

export type ChurchEvent = {
  id: string;
  name: string;
  /** ISO-ish start, as provided by ChurchSuite (local time, no zone). */
  start: string;
  end: string | null;
  allDay: boolean;
  description: string;
  location: string | null;
  category: { name: string; color: string } | null;
  url: string;
  image: string | null;
};

type Raw = Record<string, unknown>;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function pick(o: Raw, ...keys: string[]) {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return "";
}

/** ChurchSuite returns "YYYY-MM-DD HH:MM:SS"; make it parseable everywhere. */
function toIso(value: string) {
  if (!value) return "";
  return value.includes("T") ? value : value.replace(" ", "T");
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function normalise(raw: Raw): ChurchEvent | null {
  const name = pick(raw, "name", "title");
  const start = toIso(pick(raw, "datetime_start", "date_start", "start"));
  if (!name || !start) return null;

  const loc = raw.location as Raw | undefined;
  const cat = raw.category as Raw | undefined;
  const images = raw.images as Raw | undefined;

  const image =
    (images?.md as Raw | undefined)?.url ??
    (images?.lg as Raw | undefined)?.url ??
    (images?.original as Raw | undefined)?.url ??
    null;

  return {
    id: pick(raw, "id", "identifier") || `${name}-${start}`,
    name,
    start,
    end: toIso(pick(raw, "datetime_end", "date_end", "end")) || null,
    allDay: raw.all_day === 1 || raw.all_day === true,
    description: stripHtml(pick(raw, "description", "summary")),
    location: loc ? pick(loc, "name", "address") || null : null,
    category: cat
      ? { name: pick(cat, "name"), color: pick(cat, "color") || "#18265e" }
      : null,
    url: pick(raw, "url", "link") || CHURCHSUITE_CALENDAR_URL,
    image: typeof image === "string" ? image : null,
  };
}

/**
 * Upcoming events, soonest first.
 *
 * Never throws: a calendar outage must not take the page down, and an empty
 * list renders as a designed state rather than a gap.
 */
export async function getEvents(limit = 12): Promise<ChurchEvent[]> {
  try {
    const res = await fetch(`${CHURCHSUITE_CALENDAR_URL}/json`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as unknown;
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as { events?: unknown[] })?.events)
        ? (data as { events: Raw[] }).events
        : [];

    const now = Date.now();
    return (list as Raw[])
      .map(normalise)
      .filter((e): e is ChurchEvent => e !== null)
      .filter((e) => {
        const t = Date.parse(e.end || e.start);
        return Number.isNaN(t) ? true : t >= now - 86_400_000;
      })
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, limit);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------- formatting */

const DAY_MONTH = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Europe/London",
});

const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Europe/London",
});

export function formatEventDate(event: ChurchEvent) {
  const d = new Date(event.start);
  if (Number.isNaN(d.getTime())) return event.start;
  return DAY_MONTH.format(d);
}

export function formatEventTime(event: ChurchEvent) {
  if (event.allDay) return "All day";
  const d = new Date(event.start);
  if (Number.isNaN(d.getTime())) return "";

  const startText = TIME.format(d).toLowerCase().replace(/\s/g, "");
  if (!event.end) return startText;

  const e = new Date(event.end);
  if (Number.isNaN(e.getTime())) return startText;
  return `${startText} to ${TIME.format(e).toLowerCase().replace(/\s/g, "")}`;
}

export function eventSchema(event: ChurchEvent, orgId: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.start,
    ...(event.end ? { endDate: event.end } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    ...(event.description ? { description: event.description } : {}),
    location: {
      "@type": "Place",
      name: event.location || site.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.line1,
        addressLocality: site.address.town,
        postalCode: site.address.postcode,
        addressCountry: "GB",
      },
    },
    organizer: { "@id": orgId },
    url: event.url,
    ...(event.image ? { image: event.image } : {}),
  };
}

export { str };
