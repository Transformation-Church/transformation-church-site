import { site } from "@/lib/site";

/**
 * Events from ChurchSuite.
 *
 * Read from the public calendar JSON feed rather than dropping in their
 * iframe. The iframe would work, but its contents are invisible to search
 * engines, can't carry our structured data, sits in a fixed-height box that
 * fights the layout, and loads third-party cookies on a site that currently
 * sets none.
 *
 *   https://{account}.churchsuite.com/-/calendar/{uuid}/json
 *
 * Field mapping is against the real payload: events carry `starts_at` and
 * `ends_at` as true UTC instants ("2026-09-06T09:00:00Z"), a numeric
 * `category_id` that indexes the top-level `categories` array, and a
 * `sequence_id` that is non-null for recurring series and null for one-offs.
 *
 * Times are always formatted in Europe/London. ChurchSuite stores real UTC, so
 * a 10:00am service is 09:00Z under BST and 10:00Z under GMT; formatting by
 * zone keeps it reading as 10:00am year round.
 */

const FEED_UUID =
  process.env.CHURCHSUITE_CALENDAR_UUID ??
  "b7a11412-27cf-4658-afd0-139a4c58fb00";

export const CHURCHSUITE_CALENDAR_URL = `${site.churchSuite.base}/-/calendar/${FEED_UUID}`;

export type ChurchEvent = {
  id: string;
  name: string;
  /** UTC instant. */
  start: string;
  end: string | null;
  allDay: boolean;
  description: string;
  location: string | null;
  category: { name: string; color: string } | null;
  /** Non-null when the event belongs to a recurring series. */
  sequenceId: number | null;
  url: string;
  image: string | null;
};

export type WeeklyEvent = ChurchEvent & { weekday: string };

type Raw = Record<string, unknown>;
type Category = { id: number; name: string; color: string };

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function normalise(raw: Raw, categories: Map<number, Category>): ChurchEvent | null {
  const name = text(raw.name);
  const start = text(raw.starts_at);
  if (!name || !start) return null;
  if (text(raw.status) && text(raw.status) !== "confirmed") return null;

  const loc = raw.location as Raw | undefined;
  const cat =
    typeof raw.category_id === "number"
      ? categories.get(raw.category_id)
      : undefined;

  // Location is usually blank; the address, when present, repeats the church's.
  const locationName = loc ? text(loc.name) : "";

  return {
    id: text(raw.identifier) || String(raw.id ?? `${name}-${start}`),
    name,
    start,
    end: text(raw.ends_at) || null,
    allDay: raw.all_day === true,
    description: stripHtml(text(raw.description)),
    location: locationName || null,
    category: cat ? { name: cat.name, color: cat.color } : null,
    sequenceId:
      typeof raw.sequence_id === "number" ? raw.sequence_id : null,
    url: text(raw.url) || CHURCHSUITE_CALENDAR_URL,
    image: text(raw.image) || null,
  };
}

async function fetchFeed(): Promise<ChurchEvent[]> {
  try {
    const res = await fetch(`${CHURCHSUITE_CALENDAR_URL}/json`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as Raw;
    const list = Array.isArray(data?.events) ? (data.events as Raw[]) : [];

    const categories = new Map<number, Category>();
    if (Array.isArray(data?.categories)) {
      for (const c of data.categories as Raw[]) {
        if (typeof c.id === "number") {
          categories.set(c.id, {
            id: c.id,
            name: text(c.name),
            color: text(c.color) || "#18265e",
          });
        }
      }
    }

    const now = Date.now();
    return list
      .map((e) => normalise(e, categories))
      .filter((e): e is ChurchEvent => e !== null)
      .filter((e) => {
        const t = Date.parse(e.end || e.start);
        return Number.isNaN(t) ? true : t >= now;
      })
      .sort((a, b) => a.start.localeCompare(b.start));
  } catch {
    // A calendar outage must never take the page down.
    return [];
  }
}

/**
 * Split the feed into the weekly rhythm and genuine one-offs.
 *
 * Without this the page is 50-odd repetitions of the same three services.
 * Recurring series collapse to their next occurrence; everything else lists
 * individually.
 */
export async function getSchedule(oneOffLimit = 12) {
  const all = await fetchFeed();

  const seenSequence = new Set<number>();
  const recurring: WeeklyEvent[] = [];
  const oneOff: ChurchEvent[] = [];

  for (const event of all) {
    if (event.sequenceId === null) {
      oneOff.push(event);
      continue;
    }
    if (seenSequence.has(event.sequenceId)) continue;
    seenSequence.add(event.sequenceId);
    recurring.push({ ...event, weekday: weekdayOf(event) });
  }

  // Read the week as a week: Sunday first, then by time of day. Ordering by
  // next occurrence instead would put Friday above Sunday for most of the week.
  const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  recurring.sort((a, b) => {
    const day = DAYS.indexOf(a.weekday) - DAYS.indexOf(b.weekday);
    if (day !== 0) return day;
    return minutesInDay(a) - minutesInDay(b);
  });

  return { recurring, oneOff: oneOff.slice(0, oneOffLimit), total: all.length };
}

/** Minutes past midnight in Europe/London, for ordering within a day. */
function minutesInDay(event: ChurchEvent) {
  const d = new Date(event.start);
  if (Number.isNaN(d.getTime())) return 0;
  const [h, m] = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  })
    .format(d)
    .split(":")
    .map(Number);
  return h * 60 + m;
}

/* ------------------------------------------------------------- formatting */

const zone = "Europe/London";

const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: zone });
const DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "long",
  timeZone: zone,
});
const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: zone,
});

const clock = (d: Date) => TIME.format(d).toLowerCase().replace(/\s/g, "");

export function weekdayOf(event: ChurchEvent) {
  const d = new Date(event.start);
  return Number.isNaN(d.getTime()) ? "" : WEEKDAY.format(d);
}

export function formatEventDate(event: ChurchEvent) {
  const d = new Date(event.start);
  return Number.isNaN(d.getTime()) ? event.start : DATE.format(d);
}

export function formatEventTime(event: ChurchEvent) {
  if (event.allDay) return "All day";
  const d = new Date(event.start);
  if (Number.isNaN(d.getTime())) return "";
  if (!event.end) return clock(d);

  const e = new Date(event.end);
  if (Number.isNaN(e.getTime())) return clock(d);

  // Overnight prayer runs past midnight; say so rather than implying same-day.
  const sameDay = DATE.format(d) === DATE.format(e);
  return sameDay
    ? `${clock(d)} to ${clock(e)}`
    : `${clock(d)} to ${clock(e)} next day`;
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
      name: site.name,
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
    isAccessibleForFree: true,
  };
}
