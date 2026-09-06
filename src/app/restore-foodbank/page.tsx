import type { Metadata } from "next";

import { canonical } from "@/lib/seo";
import { Accordion, Button, PageHeader, Section } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Restore Foodbank",
  description:
    "Restore Foodbank is a venture of Transformation Church, distributing food to individuals and families in crisis every Wednesday in Rowley Regis.",
  ...canonical("/restore-foodbank"),
};

// TODO(Joe): these are the 2023 figures carried over from the old site and are
// known to be out of date — replace before launch. The label text carries the
// year, so update both the number and the wording together.
const stats = [
  { value: "440+", label: "People used our service in 2023" },
  { value: "10", label: "Volunteers" },
  { value: "2,500+", label: "Kilos of food donated" },
  { value: "690+", label: "Kilos of non-food items donated" },
];

const referrers = [
  "Your social worker or support worker",
  "Your child's school or children's centre",
  "Your doctor, health centre or clinic",
  "Your church",
  "Your local community centre",
  "Your local Job Centre",
];

const faqs = [
  {
    question: "Where is the foodbank?",
    answer: `Restore Foodbank, Transformation Church, ${site.address.line1}, ${site.address.town}, ${site.address.postcode}.`,
  },
  {
    question: "When can I visit?",
    answer: "Every Wednesday, 10:30am until 1:00pm.",
  },
  {
    question: "Do I need a voucher?",
    answer:
      "Yes. Our foodbank works on a voucher referral system, in partnership with the Black Country Food Bank. There are many local places where you can obtain a voucher. See the list above.",
  },
  {
    question: "How can I donate?",
    answer:
      "We're happy to receive donations at our centre on Wednesdays between 10:30am and 1:00pm. Please contact us for further information.",
  },
];

export default function FoodbankPage() {
  return (
    <>
      <PageHeader
        eyebrow="Restore Foodbank"
        title="Helping local families and individuals in crisis"
        lede="A venture of Transformation Church, distributing food to individuals and families once a week."
        meta={
          <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-4xl text-paper tabular-nums">
                  {s.value}
                </dt>
                <dd className="label mt-3 leading-relaxed text-paper-muted">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        }
      />

      {/* -------------------------------------------------- vision and aim */}
      <Section index="01" eyebrow="Why we do it">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-2">
          <div data-reveal>
            <h2 className="font-display text-2xl">Our vision</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              The senior leadership of Transformation Church had a desire to
              support our local community. We believe that service to the
              community is service to God. The idea of a foodbank operating out
              of our premises on Station Road was formed, and with tremendous
              support from the church community and a team of dedicated
              volunteers, we opened a distribution centre for the Black Country
              Food Bank in June 2019.
            </p>
          </div>
          <div data-reveal style={{ ["--reveal-delay" as string]: "100ms" }}>
            <h2 className="font-display text-2xl">Our aim</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              We know anyone can find themselves in crisis for any number of
              reasons, and when that happens we are here to help. We work to
              meet the need of the hungry, providing three to ten days&rsquo;
              worth of nutritionally balanced meals to people in need.
            </p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------- get help */}
      <Section
        index="02"
        eyebrow="If you need help"
        title="How to get a voucher"
        lede="Our foodbank works on a voucher referral system, in partnership with the Black Country Food Bank. There are many local places where you can obtain one."
        tone="warm"
      >
        <ul className="grid gap-x-14 gap-y-px border-t border-rule sm:grid-cols-2" data-reveal>
          {referrers.map((r, i) => (
            <li
              key={r}
              className="flex items-baseline gap-5 border-b border-rule py-5"
            >
              <span className="label shrink-0 tabular-nums text-ink-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-lg">{r}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* -------------------------------------------------------- donate */}
      <section className="bg-ink text-paper">
        <div className="container-page grid gap-x-16 gap-y-10 py-20 md:py-24 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <p className="label mb-6 flex items-center gap-3 text-paper-muted">
              <span className="tabular-nums">03</span>
              <span className="h-px w-8 bg-accent" />
              If you&rsquo;d like to give
            </p>
            <h2 className="font-display text-3xl text-paper">
              Donations welcome every Wednesday
            </h2>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-paper-body">
              We receive donations at our centre on Wednesdays between 10:30am
              and 1:00pm. If you&rsquo;d like to give food, non-food items, or
              your time as a volunteer, please get in touch.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href="/contact" tone="paper">
                Contact the team
              </Button>
              <Button
                href={`${site.churchSuite.base}/donate`}
                tone="outlineLight"
                external
              >
                Give online
              </Button>
            </div>
          </div>

          <address className="not-italic lg:col-span-4 lg:col-start-9" data-reveal>
            <h3 className="label text-paper-muted">Find the foodbank</h3>
            <p className="mt-5 font-display text-2xl leading-snug text-paper">
              {site.address.line1}
              <br />
              {site.address.town}
              <br />
              {site.address.postcode}
            </p>
            <p className="mt-6 text-paper-muted">Wednesdays, 10:30am to 1:00pm</p>
          </address>
        </div>
      </section>

      <Section eyebrow="Questions" title="Good to know">
        <div className="lg:w-3/4">
          <Accordion items={faqs} />
        </div>
      </Section>
    </>
  );
}
