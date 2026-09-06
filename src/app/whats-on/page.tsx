import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { Button, PageHeader, Section, TextLink } from "@/components/ui";
import {
  CHURCHSUITE_CALENDAR_URL,
  eventSchema,
  formatEventDate,
  formatEventTime,
  getEvents,
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
 * Only rhythms we have confirmed appear here. The old site advertised a
 * Saturday Bible study and a "Young Eagles" gathering with times that were
 * never verified, so they are deliberately left out rather than published and
 * wrong. Add them here once confirmed, or let them come through ChurchSuite.
 */
const weekly = [
  ...gatherings.map((g) => ({
    day: "Sunday",
    name: `${g.name} (${g.language})`,
    time: g.time,
    detail: `${g.language}-language worship, teaching and prayer.`,
    href: "/visit",
  })),
  {
    day: "Wednesday",
    name: "Restore Foodbank",
    time: "10:30am to 1:00pm",
    detail: "Food distribution, and donations received, at the church.",
    href: "/restore-foodbank",
  },
];

export default async function WhatsOnPage() {
  const events = await getEvents();

  return (
    <>
      {events.length > 0 && (
        <JsonLd data={events.map((e) => eventSchema(e, ORG_ID))} />
      )}

      <PageHeader
        eyebrow="What's on"
        title="Every week, and what's coming up"
        lede="Our Sunday gatherings run to the same rhythm week in, week out. Anything extra appears below as it's scheduled."
      />

      {/* ------------------------------------------------------- weekly */}
      <Section index="01" eyebrow="Every week" title="The regular rhythm">
        <ul className="border-t border-rule" data-reveal>
          {weekly.map((item) => (
            <li key={`${item.day}-${item.name}`}>
              <a
                href={item.href}
                className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-2 border-b border-rule py-7 transition-colors duration-500 hover:border-ink/35"
              >
                <span className="label col-span-12 text-ink/40 md:col-span-2">
                  {item.day}
                </span>
                <span className="col-span-12 md:col-span-6">
                  <span className="block font-display text-xl transition-transform duration-500 ease-[var(--ease-out-expo)] md:group-hover:translate-x-1">
                    {item.name}
                  </span>
                  <span className="mt-1.5 block text-ink/60">{item.detail}</span>
                </span>
                <span className="col-span-12 font-display text-xl text-ink md:col-span-4 md:text-right">
                  {item.time}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {/* ------------------------------------------------------- upcoming */}
      <Section
        index="02"
        eyebrow="Coming up"
        title={events.length > 0 ? "Upcoming events" : "Nothing else in the diary"}
        lede={
          events.length > 0
            ? "One-off events, conferences and gatherings across the life of the church."
            : undefined
        }
        action={
          <TextLink href={CHURCHSUITE_CALENDAR_URL} external>
            See the full calendar
          </TextLink>
        }
        tone="warm"
      >
        {events.length === 0 ? (
          <div className="border-t border-rule pt-10" data-reveal>
            <p className="max-w-xl text-lg leading-relaxed text-ink/70">
              There are no additional events scheduled at the moment. Our Sunday
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
            {events.map((event, i) => (
              <li key={event.id}>
                <a
                  href={event.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-2 border-b border-rule py-7 transition-colors duration-500 hover:border-ink/35"
                  data-reveal
                  style={{ ["--reveal-delay" as string]: `${Math.min(i, 6) * 60}ms` }}
                >
                  <span className="label col-span-12 text-ink/45 md:col-span-3">
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
                      <span className="mt-1.5 block text-sm text-ink/55">
                        {event.location}
                      </span>
                    )}
                  </span>

                  <span className="col-span-12 text-ink/70 md:col-span-3 md:text-right">
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
          <p className="text-lg leading-relaxed text-paper/65 lg:col-span-5 lg:col-start-8">
            Free parking on site, three minutes&rsquo; walk from Rowley Regis
            station, and five minutes from Junction 2 of the M5.
          </p>
        </div>
      </Section>
    </>
  );
}
