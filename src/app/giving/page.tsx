import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { Accordion, Button, PageHeader, Section, TextLink } from "@/components/ui";
import { ORG_ID, canonical } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Giving",
  description:
    "Ways to give to Transformation Church, Rowley Regis, and how Gift Aid adds 25% to your donation at no extra cost to you.",
  ...canonical("/giving"),
};

const DONATE = `${site.churchSuite.base}/donate`;

const ways = [
  {
    title: "Online",
    body: "The simplest way to give, either as a one-off gift or a regular monthly amount. You can add a Gift Aid declaration at the same time, and change or cancel a regular gift whenever you need to.",
    action: { label: "Give online", href: DONATE, external: true },
  },
  {
    title: "Standing order",
    body: "If you'd rather give directly from your bank, we can send you our account details and a Gift Aid form. Regular giving helps enormously with planning, because we know what we can commit to.",
    action: { label: "Request the details", href: "/contact", external: false },
  },
  {
    title: "In person",
    body: "There is an offering during both Sunday services. If you'd like to Gift Aid a cash gift, use one of the envelopes and write your name on it so we can claim it.",
    action: null,
  },
  {
    title: "Food and goods",
    body: "Restore Foodbank receives donations of food and non-food items at the church every Wednesday between 10:30am and 1:00pm. This is giving too, and it goes straight to families in our community.",
    action: { label: "About the foodbank", href: "/restore-foodbank", external: false },
  },
];

const faqs = [
  {
    question: "What is Gift Aid, and am I eligible?",
    answer:
      "Gift Aid lets us reclaim the basic-rate tax you have already paid on your donation, which adds 25p to every £1 you give at no extra cost to you. You are eligible if you are a UK taxpayer and pay at least as much Income Tax or Capital Gains Tax in the year as all the charities you give to will reclaim on your gifts.",
  },
  {
    question: "How do I make a Gift Aid declaration?",
    answer:
      "You can tick the Gift Aid box when you give online, and it will apply to that gift and to future ones. If you give by standing order or in cash, contact us and we will send you a short form to complete once.",
  },
  {
    question: "What happens if my circumstances change?",
    answer:
      "Please let us know if you stop paying enough tax, change your name or home address, or want to cancel your declaration. We can only claim Gift Aid while your declaration is valid.",
  },
  {
    question: "Where does my giving go?",
    answer:
      "Giving supports the day-to-day work of the church: our Sunday services and midweek gatherings, the ministry team, the building, our children's and youth work, Restore Foodbank, and the mission work we support at home and overseas.",
  },
  {
    question: "Can I give to something specific?",
    answer:
      "Yes. Tell us when you give, or get in touch, and we will make sure your gift is designated as you intend.",
  },
  {
    question: "Is my donation secure?",
    answer:
      "Online giving is handled by ChurchSuite and its payment provider. Your card details are never stored by us and never pass through this website.",
  },
];

export default function GivingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DonateAction",
          name: `Give to ${site.name}`,
          recipient: { "@id": ORG_ID },
          target: DONATE,
        }}
      />

      <PageHeader
        eyebrow="Giving"
        title="Thank you for even considering it"
        lede="Everything we do is funded by the generosity of people who call this church home, and by friends who want to see this work continue."
        meta={
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <div>
              <dt className="label text-paper/40">Registered charity</dt>
              <dd className="mt-2 font-display text-2xl tabular-nums text-paper">
                {site.charityNumber}
              </dd>
            </div>
            <div>
              <dt className="label text-paper/40">Gift Aid adds</dt>
              <dd className="mt-2 font-display text-2xl text-paper">
                25% at no cost to you
              </dd>
            </div>
          </div>
        }
      >
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href={DONATE} tone="paper" external>
            Give online
          </Button>
        </div>
      </PageHeader>

      {/* ----------------------------------------------------- ways to give */}
      <Section index="01" eyebrow="Ways to give" title="However suits you best">
        <ol className="grid gap-x-14 gap-y-12 md:grid-cols-2">
          {ways.map((way, i) => (
            <li
              key={way.title}
              className="border-t border-rule pt-7"
              data-reveal
              style={{ ["--reveal-delay" as string]: `${(i % 2) * 90}ms` }}
            >
              <span className="label tabular-nums text-ink/35">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-3 font-display text-2xl">{way.title}</h2>
              <p className="mt-4 leading-relaxed text-ink/70">{way.body}</p>
              {way.action && (
                <div className="mt-6">
                  <TextLink href={way.action.href} external={way.action.external}>
                    {way.action.label}
                  </TextLink>
                </div>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* --------------------------------------------------------- gift aid */}
      <section className="bg-ink text-paper">
        <div className="container-page grid gap-x-16 gap-y-10 py-20 md:py-24 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <p className="label mb-6 flex items-center gap-3 text-paper/45">
              <span className="tabular-nums">02</span>
              <span className="h-px w-8 bg-accent" />
              Gift Aid
            </p>
            <h2 className="font-display text-3xl text-paper">
              Every £1 you give becomes £1.25
            </h2>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-paper/65">
              If you are a UK taxpayer, Gift Aid lets us reclaim the basic-rate
              tax you have already paid on your donation. It costs you nothing
              extra, it takes one tick when you give online, and across a year
              it makes a real difference to what we can do.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href={DONATE} tone="paper" external>
                Give and add Gift Aid
              </Button>
              <Button href="/contact" tone="outlineLight">
                Ask a question
              </Button>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px self-center lg:col-span-5 lg:col-start-8" data-reveal>
            {[
              { n: "£10", l: "becomes £12.50" },
              { n: "£25", l: "becomes £31.25" },
              { n: "£50", l: "becomes £62.50" },
              { n: "£100", l: "becomes £125" },
            ].map((s) => (
              <div key={s.n} className="border-t border-paper/12 py-7 pr-6">
                <dt className="font-display text-3xl text-paper">{s.n}</dt>
                <dd className="label mt-2.5 text-paper/45">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Section index="03" eyebrow="Questions" title="Good to know" tone="warm">
        <div className="lg:w-3/4">
          <Accordion items={faqs} />
        </div>
      </Section>

      <Section>
        <div className="border-t border-rule pt-10" data-reveal>
          <p className="max-w-2xl text-lg leading-relaxed text-ink/70">
            {site.name} is registered as a Charitable Incorporated Organisation
            in England and Wales, charity number {site.charityNumber}. If you
            would like to see how we use what is given, or have any question at
            all about giving, please{" "}
            <a href={`mailto:${site.contact.email}`} className="link-underline">
              get in touch
            </a>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
