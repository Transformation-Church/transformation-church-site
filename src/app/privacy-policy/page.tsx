import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, Section } from "@/components/ui";
import { canonical } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Transformation Church does with your information: what the website collects, what it does not, who sees it and how long we keep it.",
  ...canonical("/privacy-policy"),
};

/**
 * Rewritten rather than migrated, because the WordPress one was untrue.
 *
 * That policy was generator boilerplate last touched in September 2019. It said
 * the church uses cookies to store visitor preferences, referred people to "the
 * Privacy Policy for each of the advertising partners of Transformation
 * Church", and described log-file analytics recording clicks and exit pages.
 * None of that exists. It also took consent by continued use of the site,
 * which is not consent under UK GDPR.
 *
 * A privacy notice that overstates what a site does is not a cautious one. It
 * is inaccurate, it contradicted our own cookie policy and consent banner, and
 * it would have been the first thing to fall apart under a subject access
 * request.
 *
 * Everything below is what the code actually does. If a form, an embed or an
 * analytics tag is added, this page changes in the same commit.
 */

const collected = [
  {
    what: "What you type into the contact form",
    detail:
      "Your name, email address, an optional phone number, the subject you pick and your message. It is emailed to the church office and nowhere else. It is not stored in a database, and there is no account to create.",
    why: "So we can reply to you.",
    basis: "Legitimate interests: you asked us to get in touch.",
  },
  {
    what: "The email address you give the newsletter form",
    detail:
      "Only the address. It is emailed to the church office so you can be added to the list.",
    why: "So we can send you what you asked for.",
    basis: "Consent, which you can withdraw by replying to any email.",
  },
  {
    what: "Your answer about third-party media",
    detail:
      "Whether you allowed our Instagram posts to load. It is kept in your own browser's local storage, is never sent to us, and no cookie is involved.",
    why: "So we do not ask again on every page.",
    basis: "Consent, changeable any time from Cookie settings in the footer.",
  },
  {
    what: "Ordinary server logs",
    detail:
      "Our host, Vercel, records requests to the site in the way every web server does. We do not read these to build a picture of individuals and there is no analytics account attached to them.",
    why: "So the site can be kept running and secure.",
    basis: "Legitimate interests: operating and protecting the service.",
  },
];

const notCollected = [
  "Cookies. The site sets none of its own.",
  "Analytics. No Google Analytics, no pixels, no tag manager.",
  "Advertising. We have no advertising partners and sell nothing to anyone.",
  "Profiles. We do not track you across pages or across other websites.",
  "Automated decisions. Nothing here decides anything about you.",
];

const rights = [
  ["Access", "Ask for a copy of what we hold about you."],
  ["Correction", "Ask us to fix anything that is wrong."],
  ["Erasure", "Ask us to delete it."],
  ["Restriction", "Ask us to stop using it while something is sorted out."],
  ["Objection", "Object to us relying on legitimate interests."],
  ["Portability", "Ask for it in a form you can take elsewhere."],
  ["Withdraw consent", "Where consent is what we relied on, at any time."],
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        lede="What this website collects, what it deliberately does not, and what you can ask us to do about it."
      >
        <div className="mt-12 border-t border-paper/12 pt-9">
          <p className="max-w-2xl text-lg leading-relaxed text-paper-body">
            The short version: unless you fill in a form, this site collects
            nothing about you. It sets no cookies, runs no analytics and has no
            advertising.
          </p>
        </div>
      </PageHeader>

      {/* ------------------------------------------------------- controller */}
      <Section index="01" eyebrow="Who is responsible" title="The data controller">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12">
          <p className="text-lg leading-relaxed text-ink-body lg:col-span-7" data-reveal>
            {site.name} is part of {site.parentOrg}, a registered charity in
            England and Wales, number {site.charityNumber}. We are the data
            controller for the information described here. Write to us at{" "}
            {site.address.line1}, {site.address.town}, {site.address.postcode},
            or email{" "}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
          </p>
          <p className="leading-relaxed text-ink-muted lg:col-span-4 lg:col-start-9" data-reveal>
            This policy covers this website. It does not cover ChurchSuite,
            YouTube, Instagram or Facebook, who each have their own and are
            responsible for what they do with your information.
          </p>
        </div>
      </Section>

      {/* ---------------------------------------------------------- collect */}
      <Section
        index="02"
        eyebrow="What we collect"
        title="Four things, and only if you do something"
        tone="warm"
      >
        <dl className="border-t border-rule" data-reveal>
          {collected.map((item) => (
            <div
              key={item.what}
              className="grid gap-x-16 gap-y-4 border-b border-rule py-8 lg:grid-cols-12"
            >
              <dt className="font-display text-xl lg:col-span-4">{item.what}</dt>
              <dd className="lg:col-span-8">
                <p className="leading-relaxed text-ink-body">{item.detail}</p>
                <p className="label mt-4 text-ink-muted">Why: {item.why}</p>
                <p className="label mt-2 text-ink-muted">
                  Lawful basis: {item.basis}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ------------------------------------------------------ not collect */}
      <Section index="03" eyebrow="What we do not collect" title="Said plainly">
        <ul className="grid gap-x-16 gap-y-5 lg:grid-cols-2" data-reveal>
          {notCollected.map((line) => (
            <li key={line} className="flex gap-4 border-b border-rule pb-5">
              <span aria-hidden className="mt-3 h-px w-5 shrink-0 bg-accent" />
              <span className="text-lg leading-relaxed text-ink-body">{line}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-muted" data-reveal>
          If any of that changes, this page changes with it. See the{" "}
          <Link href="/cookie-policy">Cookie Policy</Link> for what the site
          loads from anywhere else, and what it asks you first.
        </p>
      </Section>

      {/* ---------------------------------------------------------- sharing */}
      <Section index="04" eyebrow="Who else sees it" title="Sharing and keeping" tone="warm">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <h3 className="label text-ink-muted">Who we share it with</h3>
            <p className="mt-4 text-lg leading-relaxed text-ink-body">
              Nobody, other than the suppliers who make the site work: Vercel
              hosts it, and Resend delivers the emails our forms generate. Both
              act on our instructions. We do not sell information, and we do not
              pass it to anyone for marketing.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-ink-body">
              We would disclose information if the law required it, or to
              protect someone from harm, which is set out in our{" "}
              <Link href="/safeguarding">safeguarding policy</Link>.
            </p>
          </div>

          <div className="lg:col-span-4 lg:col-start-9" data-reveal>
            <h3 className="label text-ink-muted">How long we keep it</h3>
            <p className="mt-4 leading-relaxed text-ink-body">
              Messages sent through the forms stay in the church office mailbox
              for as long as they are useful, and are deleted when they are not.
              We do not build a database of enquiries. Your consent choice stays
              in your browser until you clear it or change it.
            </p>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- rights */}
      <Section index="05" eyebrow="Your rights" title="What you can ask us for">
        <dl className="grid gap-px border-t border-rule sm:grid-cols-2" data-reveal>
          {rights.map(([name, detail]) => (
            <div key={name} className="border-b border-rule py-6 pr-6">
              <dt className="font-display text-xl">{name}</dt>
              <dd className="mt-2 leading-relaxed text-ink-muted">{detail}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 grid gap-x-16 gap-y-8 lg:grid-cols-12" data-reveal>
          <p className="text-lg leading-relaxed text-ink-body lg:col-span-7">
            Email{" "}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>{" "}
            and we will answer within one month. There is no charge.
          </p>
          <p className="leading-relaxed text-ink-muted lg:col-span-4 lg:col-start-9">
            If you are unhappy with how we have handled your information you can
            complain to the Information Commissioner&rsquo;s Office at{" "}
            <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">
              ico.org.uk
            </a>
            , or on 0303 123 1113. We would rather you told us first so we can
            put it right.
          </p>
        </div>
      </Section>

      {/* --------------------------------------------------------- children */}
      <Section index="06" eyebrow="Children" title="Under 13s" tone="ink">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12">
          <p className="text-lg leading-relaxed text-paper-body lg:col-span-7" data-reveal>
            This website is written for adults, and nothing on it asks a child
            for personal information. If you believe a child has sent us
            information through a form, email us and we will delete it.
          </p>
          <p className="leading-relaxed text-paper-muted lg:col-span-4 lg:col-start-9" data-reveal>
            How the church looks after children in person is a separate and much
            longer matter, covered by our{" "}
            <Link href="/safeguarding" className="link-underline text-paper">
              safeguarding policy
            </Link>
            .
          </p>
        </div>
      </Section>

      {/* --------------------------------------------------------- changes */}
      <Section index="07" eyebrow="Changes" title="Keeping this honest">
        <div className="container-prose prose-tc" data-reveal>
          <p>
            This policy was rewritten in September 2026. The version it replaced
            was written in 2019 and described cookies, log-file analytics and
            advertising partners that this site does not have.
          </p>
          <p>
            If we add anything that collects information, this page will say so
            before it goes live rather than afterwards. If anything here is
            unclear or looks wrong, email{" "}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>{" "}
            and we will fix it.
          </p>
        </div>
      </Section>
    </>
  );
}
