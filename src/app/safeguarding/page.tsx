import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, Section } from "@/components/ui";
import { canonical } from "@/lib/seo";
import { safeguarding, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Safeguarding",
  description:
    "How to raise a safeguarding concern at Transformation Church, who to contact, and what happens next. Condensed from the BPF Safeguarding Policy, September 2025.",
  ...canonical("/safeguarding"),
};

/**
 * A condensed version of the 40-page BPF Safeguarding Policy (September 2025).
 *
 * Ordered by what a worried person needs, not by how the policy is structured.
 * The policy opens with governance and its partnership with ThirtyOne:Eight;
 * someone reaching this page at 11pm needs a phone number, then the three
 * rules, then everything else. The full policy remains the authoritative
 * document and this page says so.
 *
 * Personal mobile numbers for the coordinators are deliberately not here. The
 * church's own line and the independent 24-hour helpline reach the same people
 * without publishing three individuals' mobiles to a page Google will index.
 * If the church would rather publish them, they belong in site.ts alongside
 * the names.
 */

const rules = [
  {
    title: "Do not investigate it yourself",
    body: "Not to be sure, and not to check first. Investigating is the job of the statutory agencies, and doing it yourself can destroy evidence and make a child or adult less safe.",
  },
  {
    title: "Do not discuss it with anyone else",
    body: "Only the people named on this page. That includes not telling a parent or carer, which sounds wrong and is not: where abuse is suspected, telling them first can put the person at greater risk.",
  },
  {
    title: "Write down what you were told",
    body: "As soon as you can, in the words used, with the date and time. Keep it somewhere secure and give it to the Safeguarding Coordinator.",
  },
];

const responses = [
  {
    who: "A child",
    body: "For a physical injury, neglect or emotional abuse, the Coordinator seeks medical help if it is urgent and contacts Children's Social Services for advice. Parents or carers are not told first unless Social Services advise it. Where the concern is sexual abuse, the Coordinator contacts Children's Social Services or the Police Child Protection Team direct and speaks to nobody else.",
  },
  {
    who: "An adult with care and support needs",
    body: "The Coordinator discusses the concern with the person themselves, respecting their autonomy and their right to an independent life, and seeks advice from Adult Social Care if their choices appear to conflict with their welfare. Emergency services are called if there is immediate danger or a serious injury.",
  },
  {
    who: "Someone who works with children or adults",
    body: "Children's Social Services are consulted about suspending them, and the Local Authority Designated Officer is contacted within 24 hours. A referral to the Disclosure and Barring Service may follow. Where the allegation concerns the Senior Minister or another Status Minister, the Assemblies of God National Office is contacted regardless.",
  },
];

const commitments = [
  "Safeguarding training for everyone working with children or adults with care and support needs, refreshed at least every three years.",
  "Proper care in appointing workers, paid and voluntary, with training, support and supervision for all of them.",
  "A code of behaviour for everyone appointed to this work.",
  "Full cooperation with any statutory investigation.",
  "Premises that meet the Disability Discrimination Act 1995 and are welcoming and inclusive.",
  "Annual review of the policy.",
];

export default function SafeguardingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Safeguarding"
        title="If you are worried about someone"
        lede="You do not need to be certain, and you do not need proof. Tell one of the people below as soon as you can."
      >
        <div className="mt-12 border-t border-paper/12 pt-9">
          <p className="font-display text-3xl text-paper">
            If a child or adult is in immediate danger, or seriously injured,
            call{" "}
            <a href="tel:999" className="text-accent-soft underline underline-offset-8">
              999
            </a>
            .
          </p>
        </div>
      </PageHeader>

      {/* ------------------------------------------------------ who to tell */}
      <Section
        index="01"
        eyebrow="Who to tell"
        title="The people to speak to"
        lede="Any of them. If your concern involves the Coordinator and the Deputy, or you would rather speak to someone outside the church, go straight to ThirtyOne:Eight."
      >
        <dl className="grid gap-px border-t border-rule sm:grid-cols-3" data-reveal>
          {safeguarding.people.map((person) => (
            <div key={person.role} className="border-b border-rule py-7 pr-6">
              <dt className="label text-ink-muted">{person.role}</dt>
              <dd className="mt-3 font-display text-xl">{person.name}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 grid gap-x-16 gap-y-8 lg:grid-cols-12" data-reveal>
          <div className="lg:col-span-6">
            <h3 className="label text-ink-muted">Reach them through the church</h3>
            <p className="mt-4 text-lg leading-relaxed text-ink-body">
              Call{" "}
              <a href={`tel:${safeguarding.phone.replace(/\s/g, "")}`}>
                {safeguarding.phone}
              </a>{" "}
              or email{" "}
              <a href={`mailto:${safeguarding.email}`}>{safeguarding.email}</a>,
              saying that it is a safeguarding matter. It will reach the
              Safeguarding Coordinator.
            </p>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <h3 className="label text-ink-muted">Or someone independent</h3>
            <p className="mt-4 text-lg leading-relaxed text-ink-body">
              <strong>ThirtyOne:Eight</strong> is an independent Christian
              safeguarding charity, and the church is a member. Their 24-hour
              helpline is{" "}
              <a href="tel:03030031111">0303 003 1111</a>, option 2.
            </p>
          </div>
        </div>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-muted" data-reveal>
          You always have the right to contact the statutory agencies or the
          police yourself. Nothing here takes that away.
        </p>
      </Section>

      {/* ----------------------------------------------------------- rules */}
      <Section
        index="02"
        eyebrow="If someone tells you something"
        title="Three rules"
        tone="warm"
      >
        <ol className="grid gap-px border-t border-rule md:grid-cols-3" data-reveal>
          {rules.map((rule, i) => (
            <li key={rule.title} className="border-b border-rule py-8 pr-6">
              <span className="label tabular-nums text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-xl">{rule.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-muted">{rule.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-body" data-reveal>
          Concerns are passed to the statutory agencies by the Safeguarding
          Coordinator, not by the person who received them.
        </p>
      </Section>

      {/* -------------------------------------------------- what happens next */}
      <Section index="03" eyebrow="What happens next" title="How a concern is handled">
        <dl className="border-t border-rule" data-reveal>
          {responses.map((r) => (
            <div
              key={r.who}
              className="grid gap-x-16 gap-y-3 border-b border-rule py-8 lg:grid-cols-12"
            >
              <dt className="font-display text-xl lg:col-span-4">{r.who}</dt>
              <dd className="text-lg leading-relaxed text-ink-muted lg:col-span-8">
                {r.body}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 max-w-3xl text-lg leading-relaxed text-ink-body" data-reveal>
          During any investigation the church separates the roles. One person
          deals with the authorities, another supports the person affected and
          their family, and a third offers pastoral care to the person accused.
          No one person does two of these.
        </p>
      </Section>

      {/* --------------------------------------------------- useful numbers */}
      <Section
        index="04"
        eyebrow="Useful numbers"
        title="Statutory and emergency contacts"
        tone="warm"
      >
        <dl className="border-t border-rule" data-reveal>
          {safeguarding.contacts.map((c) => (
            <div
              key={c.label}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule py-5"
            >
              <dt className="label text-ink-muted">{c.label}</dt>
              <dd className="font-display text-xl">
                <a href={`tel:${c.tel}`}>{c.number}</a>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 max-w-2xl leading-relaxed text-ink-muted" data-reveal>
          The Local Authority Designated Officer must be contacted within 24
          hours whenever an allegation is made against someone in a position of
          trust, paid or voluntary.
        </p>
      </Section>

      {/* ----------------------------------------------------- commitments */}
      <Section index="05" eyebrow="Our commitments" title="What the church undertakes">
        <ul className="grid gap-x-16 gap-y-5 lg:grid-cols-2" data-reveal>
          {commitments.map((c) => (
            <li key={c} className="flex gap-4 border-b border-rule pb-5">
              <span aria-hidden className="mt-3 h-px w-5 shrink-0 bg-accent" />
              <span className="text-lg leading-relaxed text-ink-body">{c}</span>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-muted" data-reveal>
          The policy is built on the ten <em>Safe and Secure</em> standards
          published by ThirtyOne:Eight and was endorsed by the Assemblies of God
          National Leadership Team.
        </p>
      </Section>

      {/* --------------------------------------------------- pastoral care */}
      <Section
        index="06"
        eyebrow="Care for those affected"
        title="Whether it was recent or long ago"
        tone="ink"
      >
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <ul className="grid gap-5 lg:col-span-7" data-reveal>
            {[
              "Accepted as you are, never made to forgive, and never put in a position of feeling guilty or responsible for what happened to you.",
              "Assured that God loves you unconditionally.",
              "Confident that those in the church who know will stay with you, however long and difficult the journey.",
            ].map((line) => (
              <li key={line} className="flex gap-4">
                <span aria-hidden className="mt-3 h-px w-5 shrink-0 bg-accent" />
                <span className="text-lg leading-relaxed text-paper-body">
                  {line}
                </span>
              </li>
            ))}
          </ul>

          <div className="lg:col-span-4 lg:col-start-9" data-reveal>
            <p className="leading-relaxed text-paper-muted">
              The church recognises its own limits and will point people towards
              professional help rather than attempt support it is not equipped
              to give.
            </p>
            <p className="mt-5 leading-relaxed text-paper-muted">
              Where someone attending is known to have abused children, or to
              pose a risk to adults with care and support needs, the leadership
              supervises them and offers pastoral care, but sets boundaries they
              are expected to keep. Pastoral care for a person affected by abuse
              and for a known offender is always given by different people.
            </p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------ the policy */}
      <Section index="07" eyebrow="The policy" title="This page is a summary">
        <div className="container-prose prose-tc" data-reveal>
          <p>
            The authoritative document is the{" "}
            <strong>
              Birmingham Pentecostal Fellowship Safeguarding Policy, September
              2025
            </strong>
            , written by ThirtyOne:Eight and endorsed by the Assemblies of God
            National Leadership Team. It runs to forty pages and covers
            recruitment, training, working in partnership, detailed statutory
            definitions of abuse, harmful cultural practices, prayer ministry
            guidelines and the full reporting flowcharts.
          </p>
          <p>
            This page condenses the parts most people need. Where the two differ,
            the full policy governs. Ask at the church office for a copy, or
            email{" "}
            <a href={`mailto:${safeguarding.email}`}>{safeguarding.email}</a>.
          </p>
          <p>
            {site.name} is part of Birmingham Pentecostal Fellowship, an
            accredited member of Assemblies of God, Great Britain, and a
            registered charity in England and Wales, number {site.charityNumber}
            . Our safeguarding partner is ThirtyOne:Eight and our insurer is
            Ansvar.
          </p>
          <p>
            If you have a question about anything here, see{" "}
            <Link href="/contact">Contact</Link>.
          </p>
        </div>
      </Section>
    </>
  );
}
