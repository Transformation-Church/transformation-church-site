import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { Accordion, Button, PageHeader, Section, TextLink } from "@/components/ui";
import { getGatherings } from "@/lib/events";
import { canonical, faqSchema } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Malayalam Church in Birmingham",
  description:
    "A Malayalam-speaking Pentecostal church in Rowley Regis, Birmingham, gathering every Sunday. Part of Birmingham Pentecostal Fellowship, the first Indian Pentecostal community church in the city.",
  ...canonical("/malayalam-service"),
  openGraph: {
    type: "website",
    title: "Malayalam Church in Birmingham | Transformation Church",
    description:
      "Malayalam worship every Sunday in Rowley Regis. Part of Birmingham Pentecostal Fellowship, an accredited member of Assemblies of God, Great Britain.",
  },
};

/**
 * Written for Malayalam-speaking families looking for a church in Birmingham
 * and the Black Country. Everything here is true of the church: the Malayalam
 * service is weekly, and the congregation began as a Malayalam prayer
 * fellowship in 2002.
 *
 * The page is in English because I cannot verify Malayalam copy. A Malayalam
 * translation from someone in the congregation would serve this audience
 * better and would help for Malayalam-language searches.
 */
const faqs = [
  {
    question: "Is there a Malayalam church in Birmingham?",
    answer:
      "Yes. Transformation Church holds a Malayalam service every Sunday at 1 Station Road, Rowley Regis, B65 0LJ. We are part of Birmingham Pentecostal Fellowship, which began in 2002 and was the first Indian Pentecostal community church in Birmingham with Malayalam as its medium of worship.",
  },
  {
    question: "Do I need to speak Malayalam to come?",
    answer:
      "Not at all. We hold an English service earlier the same morning, and a Hindi service on Friday evenings. Families often split across the services, or come to both. You are welcome at any of them.",
  },
  {
    question: "Which denomination are you?",
    answer:
      "We are Pentecostal, and an accredited member of Assemblies of God, Great Britain. Birmingham Pentecostal Fellowship is a registered charity in England and Wales, number 1208306.",
  },
  {
    question: "Are children welcome?",
    answer:
      "Yes. Sunday school runs during the service for children aged 5 to 17, and our young people have their own gatherings during the week.",
  },
  {
    question: "How far is it from central Birmingham?",
    answer:
      "Rowley Regis is about half an hour from Birmingham city centre. We are a three-minute walk from Rowley Regis railway station, five minutes from Junction 2 of the M5, and there is free parking on site.",
  },
  {
    question: "Are there Malayalam-speaking groups during the week?",
    answer:
      "Yes. Cell groups meet during the week across the West Midlands, including Rowley Regis, Coventry, Northfield, Redditch, Sutton Coldfield, Walsall, Wolverhampton, Small Heath, Selly Oak and Worcester.",
  },
];

export default async function MalayalamServicePage() {
  const gatherings = await getGatherings();
  const malayalam = gatherings.find((g) => g.language === "Malayalam");
  const english = gatherings.find((g) => g.language === "English");
  const hindi = gatherings.find((g) => g.language === "Hindi");

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />

      <PageHeader
        eyebrow="Malayalam worship"
        title="A Malayalam church in Birmingham"
        lede="We began in 2002 as eleven people praying together in Malayalam. Nearly twenty five years on, that service still runs every Sunday."
        meta={
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {malayalam && (
              <div>
                <dt className="label text-paper-muted">Malayalam service</dt>
                <dd className="mt-2 font-display text-3xl text-paper">
                  {malayalam.weekday}, {malayalam.time}
                </dd>
              </div>
            )}
            {english && (
              <div>
                <dt className="label text-paper-muted">English service</dt>
                <dd className="mt-2 font-display text-3xl text-paper">
                  {english.weekday}, {english.time}
                </dd>
              </div>
            )}
            {hindi && (
              <div>
                <dt className="label text-paper-muted">Hindi service</dt>
                <dd className="mt-2 font-display text-3xl text-paper">
                  {hindi.weekday}, {hindi.time}
                </dd>
              </div>
            )}
            <div>
              <dt className="label text-paper-muted">Where</dt>
              <dd className="mt-2 leading-snug text-paper-body">
                {site.address.line1}
                <br />
                {site.address.town} {site.address.postcode}
              </dd>
            </div>
          </dl>
        }
      >
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/visit" tone="paper">
            Plan your visit
          </Button>
          <Button href={site.address.maps} tone="outlineLight" external>
            Get directions
          </Button>
        </div>
      </PageHeader>

      {/* ------------------------------------------------------------ roots */}
      <Section index="01" eyebrow="Our roots" title="From Kerala to the Black Country">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <p className="text-lg leading-relaxed text-ink-muted">
              Through the closing years of the twentieth century, families from
              Kerala came to Britain for work, many of them nurses. Some were
              Pentecostal believers, and they began meeting in one another&rsquo;s
              homes to pray. On 16 July 2002, about eleven people gathered in a
              house in Sutton Coldfield to worship in Malayalam. That was the
              beginning.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-ink-muted">
              Birmingham Pentecostal Fellowship was the first Indian Pentecostal
              community church in Birmingham with Malayalam as its medium of
              worship. Today the congregation gathers in three languages, and
              people travel in from across Birmingham, Sandwell and the wider
              West Midlands.
            </p>
            <div className="mt-9">
              <TextLink href="/our-history">Read the full history</TextLink>
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9" data-reveal>
            <h2 className="label text-ink-muted">Cell groups meet in</h2>
            <ul className="mt-6 border-t border-rule">
              {[
                "Rowley Regis",
                "Coventry",
                "Northfield and Redditch",
                "Sutton Coldfield",
                "Walsall and Wolverhampton",
                "Small Heath and Selly Oak",
                "Worcester",
              ].map((place) => (
                <li key={place} className="border-b border-rule py-3.5 text-ink-muted">
                  {place}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- service */}
      <Section
        index="02"
        eyebrow="On a Sunday"
        title="What the Malayalam service is like"
        tone="warm"
      >
        <div className="grid gap-x-14 gap-y-10 md:grid-cols-3">
          {[
            {
              title: "Worship in Malayalam",
              body: "Songs led by our band, in the language most of the congregation grew up singing in.",
            },
            {
              title: "Teaching from the Bible",
              body: "A talk rooted in Scripture, usually around thirty minutes, given in Malayalam.",
            },
            {
              title: "Time to pray",
              body: "There is time to receive personal prayer during or after the service, only ever if you would like it.",
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className="border-t border-rule pt-7"
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
            >
              <h3 className="font-display text-xl">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-muted">{item.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-2xl text-lg leading-relaxed text-ink-muted" data-reveal>
          Many families come to both the English service at{" "}
          {english?.time ?? "10:00am"} and the Malayalam service at{" "}
          {malayalam?.time ?? "12:00pm"}, with children in Sunday school in
          between. Come to whichever suits you, or both. There is no dress code
          and nothing you need to bring.
        </p>
      </Section>

      <Section index="03" eyebrow="Questions" title="Before you come">
        <div className="lg:w-3/4">
          <Accordion items={faqs} />
        </div>
      </Section>

      <Section tone="ink" title="We would love to meet you">
        <p className="mb-9 max-w-xl text-lg leading-relaxed text-paper-body">
          If you are looking for a Malayalam-speaking church in Birmingham, come
          and find us on a Sunday, or send a message first if you would rather
          know what to expect.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button href="/visit" tone="paper">
            Plan your visit
          </Button>
          <Button href="/contact" tone="outlineLight">
            Send a message
          </Button>
        </div>
      </Section>
    </>
  );
}
