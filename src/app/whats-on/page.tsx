import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { Button, PageHeader, Section, TextLink } from "@/components/ui";
import {
  CHURCHSUITE_CALENDAR_URL,
  eventSchema,
  formatEventDate,
  formatEventTime,
  getSchedule,
} from "@/lib/events";
import { ORG_ID, canonical } from "@/lib/seo";
import { gatherings, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "What's On",
  description:
    "Service times and upcoming events at Transformation Church, Rowley Regis. Sundays at 10:00am in English and 12:00pm in Malayalam.",
  ...canonical("/whats-on"),
};

/**
 * Restore Foodbank isn't in the ChurchSuite calendar, so it's listed here from
 * the confirmed details on its own page. Everything else comes from the feed.
 */
const FOODBANK = {
  weekday: "Wednesday",
  name: "Restore Foodbank",
  time: "10:30am to 1:00pm",
  detail: "Food distribution, and donations received, at the church.",
  href: "/restore-foodbank",
};

/** Used only if the ChurchSuite feed is unreachable at build time. */
const FALLBACK_WEEKLY = gatherings.map((g) => ({
  weekday: "Sunday",
  name: `${g.name} (${g.language})`,
  time: g.time,
  detail: `${g.language}-language worship, teaching and prayer.`,
  href: "/visit",
}));

export default async function WhatsOnPage() {
  const { recurring, oneOff } = await getSchedule();

  const weekly =
    recurring.length > 0
      ? recurring.map((e) => ({
          weekday: e.weekday,
          name: e.name,
          time: formatEventTime(e),
          detail: e.category?.name ?? "",
          href: e.url,
          external: true,
        }))
      : FALLBACK_WEEKLY;

  const schedule = [...weekly, FOODBANK];

  return (
    <>
      {oneOff.length > 0 && (
        <JsonLd data={oneOff.map((e) => eventSchema(e, ORG_ID))} />
      )}

      <PageHeader
        eyebrow="What's on"
        title="Every week, and what's coming up"
        lede="Our gatherings run to the same rhythm week in, week out. Anything extra appears below as it's scheduled."
      />

      {/* ------------------------------------------------------- weekly */}
      <Section index="01" eyebrow="Every week" title="The regular rhythm">
        <ul className="border-t border-rule" data-reveal>
          {schedule.map((item) => {
            const inner = (
              <>
                <span className="label col-span-12 text-ink-muted md:col-span-2">
                  {item.weekday}
                </span>
                <span className="col-span-12 md:col-span-6">
                  <span className="block font-display text-xl transition-transform duration-500 ease-[var(--ease-out-expo)] md:group-hover:translate-x-1">
                    {item.name}
                  </span>
                  {item.detail && (
                    <span className="mt-1.5 block text-ink-muted">{item.detail}</span>
                  )}
                </span>
                <span className="col-span-12 font-display text-xl text-ink md:col-span-4 md:text-right">
                  {item.time}
                </span>
              </>
            );

            const cls =
              "group grid grid-cols-12 items-baseline gap-x-6 gap-y-2 border-b border-rule py-7 transition-colors duration-500 hover:border-ink/35";

            return (
              <li key={`${item.weekday}-${item.name}-${item.time}`}>
                {"external" in item && item.external ? (
                  <a href={item.href} target="_blank" rel="noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <a href={item.href} className={cls}>
                    {inner}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ------------------------------------------------------- upcoming */}
      <Section
        index="02"
        eyebrow="Coming up"
        title={oneOff.length > 0 ? "Upcoming events" : "Nothing else in the diary"}
        lede={
          oneOff.length > 0
            ? "One-off gatherings, prayer meetings and events across the life of the church."
            : undefined
        }
        action={
          <TextLink href={CHURCHSUITE_CALENDAR_URL} external>
            See the full calendar
          </TextLink>
        }
        tone="warm"
      >
        {oneOff.length === 0 ? (
          <div className="border-t border-rule pt-10" data-reveal>
            <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
              There are no additional events scheduled at the moment. Our
              services run as usual, and anything new will appear here as soon
              as it&rsquo;s in the diary.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href="/visit">Plan your visit</Button>
              <Button href="/contact" tone="outline">
                Ask us about something
              </Button>
            </div>
          </div>
        ) : (
          <ul className="border-t border-rule">
            {oneOff.map((event, i) => (
              <li key={event.id}>
                <a
                  href={event.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-2 border-b border-rule py-7 transition-colors duration-500 hover:border-ink/35"
                  data-reveal
                  style={{ ["--reveal-delay" as string]: `${Math.min(i, 6) * 60}ms` }}
                >
                  <span className="label col-span-12 text-ink-muted md:col-span-3">
                    {formatEventDate(event)}
                  </span>

                  <span className="col-span-12 md:col-span-6">
                    {event.category && (
                      <span
                        className="label mb-2 block"
                        style={{ color: event.category.color }}
                      >
                        {event.category.name}
                      </span>
                    )}
                    <span className="block font-display text-xl transition-transform duration-500 ease-[var(--ease-out-expo)] md:group-hover:translate-x-1">
                      {event.name}
                    </span>
                    {event.location && (
                      <span className="mt-1.5 block text-sm text-ink-muted">
                        {event.location}
                      </span>
                    )}
                  </span>

                  <span className="col-span-12 text-ink-muted md:col-span-3 md:text-right">
                    {formatEventTime(event)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ---------------------------------------------------------- where */}
      <Section tone="ink" eyebrow="Where" title="Everything happens here">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12">
          <address className="not-italic lg:col-span-5">
            <p className="font-display text-2xl leading-snug text-paper">
              {site.address.line1}
              <br />
              {site.address.town}
              <br />
              {site.address.postcode}
            </p>
            <div className="mt-6">
              <TextLink href={site.address.maps} tone="paper" external>
                Get directions
              </TextLink>
            </div>
          </address>
          <p className="text-lg leading-relaxed text-paper-body lg:col-span-5 lg:col-start-8">
            Free parking on site, three minutes&rsquo; walk from Rowley Regis
            station, and five minutes from Junction 2 of the M5.
          </p>
        </div>
      </Section>
    </>
  );
}
