import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { canonical, faqSchema } from "@/lib/seo";
import { Accordion, Button, PageHeader, Section, TextLink } from "@/components/ui";
import { gatherings, site, visitFaqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Plan Your Visit",
  description:
    "Everything you need for your first Sunday at Transformation Church: service times, directions, parking, and what to expect.",
  ...canonical("/visit"),
};

const expectations = [
  {
    title: "You'll be welcomed, not singled out",
    body: "Someone will say hello and point you to the coffee. Beyond that, you're free to sit at the back and take it all in. There's no moment where visitors are asked to stand up.",
  },
  {
    title: "Worship led by our band",
    body: "Most services open with contemporary songs of thanks to God, led by a band. Join in or simply listen. Both are completely fine.",
  },
  {
    title: "A talk rooted in the Bible",
    body: "Every service includes teaching about God or an aspect of Christian living, grounded in Scripture. Usually around thirty minutes.",
  },
  {
    title: "Prayer, if you'd like it",
    body: "There's time to receive personal prayer most Sundays, sometimes during the service, and always afterwards. Only ever if you want it.",
  },
];

const practical = [
  { label: "Dress code", value: "There isn't one. Come as you are." },
  { label: "Parking", value: "Plenty of free parking on site." },
  { label: "By train", value: "Three-minute walk from Rowley Regis station." },
  { label: "By car", value: "Five minutes from Junction 2 of the M5." },
  { label: "By bus", value: "Routes 4, 4H and 4M stop nearby." },
  { label: "Children", value: "Sunday school for ages 5 to 17 during the service." },
];

export default function VisitPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    `${site.name}, ${site.address.line1}, ${site.address.town} ${site.address.postcode}`,
  )}&output=embed`;

  return (
    <>
      <JsonLd data={faqSchema()} />

      <PageHeader
        eyebrow="Plan your visit"
        title="Your first Sunday, without the guesswork"
        lede="Here's exactly what happens, where to park, and who to look for. No surprises."
        meta={
          <dl className="grid gap-8 sm:grid-cols-3">
            {gatherings.map((g) => (
              <div key={`${g.language}-${g.start}`}>
                <dt className="label text-paper/40">Sunday · {g.language}</dt>
                <dd className="mt-2 font-display text-3xl text-paper">{g.time}</dd>
              </div>
            ))}
            <div>
              <dt className="label text-paper/40">Where</dt>
              <dd className="mt-2 leading-snug text-paper/80">
                {site.address.line1}
                <br />
                {site.address.town} {site.address.postcode}
              </dd>
            </div>
          </dl>
        }
      />

      {/* ------------------------------------------------------ what to expect */}
      <Section index="01" eyebrow="What to expect" title="How a Sunday runs">
        <ol className="grid gap-x-14 gap-y-10 md:grid-cols-2">
          {expectations.map((e, i) => (
            <li
              key={e.title}
              className="border-t border-rule pt-7"
              data-reveal
              style={{ ["--reveal-delay" as string]: `${(i % 2) * 90}ms` }}
            >
              <span className="label tabular-nums text-ink/35">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-xl">{e.title}</h3>
              <p className="mt-3 leading-relaxed text-ink/70">{e.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* --------------------------------------------------------- practical */}
      <Section index="02" eyebrow="Practical" title="Getting here" tone="warm">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <dl className="border-t border-rule lg:col-span-5" data-reveal>
            {practical.map((p) => (
              <div
                key={p.label}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule py-5"
              >
                <dt className="label text-ink/40">{p.label}</dt>
                <dd className="text-right text-ink/80">{p.value}</dd>
              </div>
            ))}
          </dl>

          <div className="lg:col-span-6 lg:col-start-7" data-reveal>
            <div className="relative aspect-[4/3] overflow-hidden border border-rule bg-wash">
              <iframe
                src={mapSrc}
                title={`Map showing ${site.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <div className="mt-5">
              <TextLink href={site.address.maps} external>
                Open in Google Maps
              </TextLink>
            </div>
          </div>
        </div>
      </Section>

      <Section index="03" eyebrow="Questions" title="Are you new here?">
        <div className="lg:w-3/4">
          <Accordion items={visitFaqs} />
        </div>
      </Section>

      <Section tone="ink" title="Still not sure? Just ask.">
        <p className="mb-9 max-w-xl text-lg leading-relaxed text-paper/65">
          If there&rsquo;s anything you&rsquo;d like to know before coming,
          accessibility, childcare, anything at all, send us a message and
          we&rsquo;ll answer honestly.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button href="/contact" tone="paper">
            Get in touch
          </Button>
          <Button href="/sermons" tone="outlineLight">
            Listen first
          </Button>
        </div>
      </Section>
    </>
  );
}
