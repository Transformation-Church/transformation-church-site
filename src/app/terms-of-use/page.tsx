import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, Section } from "@/components/ui";
import { canonical } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms on which you may use the Transformation Church website: permitted and prohibited uses, intellectual property, liability and governing law.",
  ...canonical("/terms-of-use"),
};

/**
 * The same terms as the WordPress site, restructured rather than rewritten.
 *
 * Every clause is preserved: acceptance, availability, intellectual property,
 * limitation of liability, the Computer Misuse Act warning, prohibited uses,
 * suspension, and English law. Splitting a 1,500-word slab into sections
 * changes how findable it is, not what it says.
 *
 * Three facts were corrected because they were wrong, not because they read
 * badly:
 *
 *   - The charity number said 1132602. The registered number is 1208306, and
 *     the old number is still in the safeguarding policy PDF too.
 *   - The address said "Unit 1, Station Road". Everywhere else, including
 *     ChurchSuite and the Google listing, says 1 Station Road.
 *   - It committed the site to WCAG 2.0. It meets 2.2 Level AA, verified with
 *     axe across every route, so claiming the older standard understated it.
 *
 * The legal wording here is the church's, not ours. Anything beyond correcting
 * a fact should go past a trustee.
 */

const prohibited = [
  "In any way that breaches any applicable local, national or international law or regulation.",
  "In any way that is unlawful or fraudulent, or has any unlawful or fraudulent purpose or effect.",
  "For the purpose of harming or attempting to cause harm in any way, including to people, especially minors, animals or property.",
  "To send, knowingly receive, upload, download, use or re-use any material which does not comply with our content standards.",
  "To transmit, or procure the sending of, any unsolicited or unauthorised material or any other form of similar solicitation (spam).",
  "To knowingly transmit any data, or upload any material, containing viruses, Trojan horses, worms, time-bombs, keystroke loggers, spyware, adware or any other harmful code.",
];

const alsoAgree = [
  "Not to reproduce, duplicate, copy or re-sell any part of our site in contravention of these terms.",
  "Not to access without authority, interfere with, damage or disrupt any part of our site.",
  "Not to interfere with any equipment or network on which our site is stored, or any software used in providing it.",
  "Not to interfere with any equipment, network or software owned or used by any third party.",
];

export default function TermsOfUsePage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Use"
        lede="The terms on which you may use this website. Using the site means accepting them."
      >
        <div className="mt-12 border-t border-paper/12 pt-9">
          <p className="max-w-2xl text-lg leading-relaxed text-paper-body">
            Nothing here is unusual. Use the site lawfully, do not attack it, and
            understand that we cannot promise it will always be available or
            always be right.
          </p>
        </div>
      </PageHeader>

      {/* ------------------------------------------------------------- who */}
      <Section index="01" eyebrow="Who we are" title="Information about us">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12">
          <p className="text-lg leading-relaxed text-ink-body lg:col-span-7" data-reveal>
            {site.name} is part of {site.parentOrg}, a multicultural,
            Bible-believing church and a registered charity in England and
            Wales, number {site.charityNumber}. Our registered office is{" "}
            {site.address.line1}, {site.address.town}, {site.address.postcode}.
            This site exists to co-ordinate, promote, aid and further the work
            and mission of the church.
          </p>
          <p className="leading-relaxed text-ink-muted lg:col-span-4 lg:col-start-9" data-reveal>
            These terms apply to every visitor, and using the site means
            accepting them. If you do not agree to them, please do not use the
            site. We recommend keeping a copy.
          </p>
        </div>
      </Section>

      {/* ---------------------------------------------------------- related */}
      <Section index="02" eyebrow="Other terms" title="What else applies" tone="warm">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12" data-reveal>
          <p className="text-lg leading-relaxed text-ink-body lg:col-span-7">
            Our <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
            <Link href="/cookie-policy">Cookie Policy</Link> also apply. They set
            out what we do with any personal data you give us, and what the site
            loads from anywhere else.
          </p>
          <p className="leading-relaxed text-ink-muted lg:col-span-4 lg:col-start-9">
            If you send us someone else&rsquo;s details through a form, please
            make sure they are happy for you to, and that what you send is
            accurate.
          </p>
        </div>
      </Section>

      {/* ------------------------------------------------------ availability */}
      <Section index="03" eyebrow="Availability" title="Access, and changes">
        <dl className="border-t border-rule" data-reveal>
          {[
            [
              "The site may change",
              "We may update the site and change its content at any time. Content may be out of date at any given moment, and we are under no obligation to update it. We do not guarantee it is free from errors or omissions.",
            ],
            [
              "It may not always be there",
              "Every effort is made to keep the site running, but we do not guarantee it will always be available or uninterrupted. Access is permitted on a temporary basis, and we may suspend, withdraw or change any part of it without notice. We will not be liable if it is unavailable.",
            ],
            [
              "Your side of it",
              "You are responsible for arranging your own access, and for making sure anyone using the site through your internet connection knows about these terms and follows them.",
            ],
            [
              "These terms may change",
              "We may revise these terms by amending this page. Please check it from time to time, as any changes are binding.",
            ],
          ].map(([term, detail]) => (
            <div
              key={term}
              className="grid gap-x-16 gap-y-3 border-b border-rule py-7 lg:grid-cols-12"
            >
              <dt className="font-display text-xl lg:col-span-4">{term}</dt>
              <dd className="leading-relaxed text-ink-muted lg:col-span-8">
                {detail}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ---------------------------------------------------------------- IP */}
      <Section index="04" eyebrow="Copyright" title="Intellectual property" tone="warm">
        <div className="container-prose prose-tc" data-reveal>
          <p>
            Except where you have entered information yourself and created rights
            in it, in which case those rights remain yours, we are the owner or
            licensee of all intellectual property rights in this site and in the
            material published on it. Those works are protected by copyright laws
            and treaties around the world, and all such rights are reserved.
          </p>
          <p>
            Some content here may be the copyright of third parties, reproduced
            with permission, under licence, or within the acts permitted by the
            Copyright, Designs and Patents Act 1988. The street map on our{" "}
            <Link href="/visit">Plan Your Visit</Link> page is drawn from
            OpenStreetMap data, used under the Open Database Licence and credited
            beneath it.
          </p>
          <p>
            If you believe any part of this site infringes your rights, please
            contact us immediately and we will look into it.
          </p>
        </div>
      </Section>

      {/* ---------------------------------------------------------- liability */}
      <Section index="05" eyebrow="Liability" title="What we are and are not responsible for">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <h3 className="label text-ink-muted">What is never excluded</h3>
            <p className="mt-4 text-lg leading-relaxed text-ink-body">
              Nothing in these terms excludes or limits our liability for death
              or personal injury arising from our negligence, for fraud or
              fraudulent misrepresentation, or for anything else that cannot be
              excluded or limited under English law.
            </p>

            <h3 className="label mt-9 text-ink-muted">What is excluded</h3>
            <p className="mt-4 leading-relaxed text-ink-body">
              To the extent permitted by law, we exclude all conditions,
              warranties, representations and other terms that might otherwise
              apply to this site or its content, whether express or implied. We
              will not be liable for any loss or damage, whether in contract,
              tort including negligence, breach of statutory duty or otherwise,
              and even if foreseeable, arising from your use of, or inability to
              use, this site, or from reliance on anything shown on it.
            </p>
          </div>

          <div className="lg:col-span-4 lg:col-start-9" data-reveal>
            <h3 className="label text-ink-muted">Harmful material</h3>
            <p className="mt-4 leading-relaxed text-ink-muted">
              We will not be liable for loss or damage caused by a virus,
              denial-of-service attack or other technologically harmful material
              that infects your equipment because you used this site or
              downloaded something from it.
            </p>

            <h3 className="label mt-9 text-ink-muted">Links to other sites</h3>
            <p className="mt-4 leading-relaxed text-ink-muted">
              We take no responsibility for the content of sites we link to. A
              link is not an endorsement, and we will not be liable for any loss
              arising from your use of them.
            </p>
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------- security */}
      <Section index="06" eyebrow="Security" title="Viruses and misuse" tone="warm">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12">
          <p className="text-lg leading-relaxed text-ink-body lg:col-span-7" data-reveal>
            We do not guarantee this site will be secure or free from bugs. You
            are responsible for configuring your own equipment to access it, and
            for using your own virus protection.
          </p>
          <p className="leading-relaxed text-ink-muted lg:col-span-4 lg:col-start-9" data-reveal>
            You must not knowingly introduce viruses, trojans, worms, logic
            bombs or other malicious material, attempt to gain unauthorised
            access to the site or any server or database connected to it, or
            attack it by denial of service. Doing so is a criminal offence under
            the <strong>Computer Misuse Act 1990</strong>. We would report it to
            the police and co-operate with them, including by disclosing your
            identity, and your right to use the site would end immediately.
          </p>
        </div>
      </Section>

      {/* ------------------------------------------------------- prohibited */}
      <Section index="07" eyebrow="Acceptable use" title="What you may not do">
        <p className="mb-8 max-w-2xl text-lg leading-relaxed text-ink-body" data-reveal>
          You may use this site only for lawful purposes. You may not use it:
        </p>
        <ul className="grid gap-x-16 gap-y-5 lg:grid-cols-2" data-reveal>
          {prohibited.map((line) => (
            <li key={line} className="flex gap-4 border-b border-rule pb-5">
              <span aria-hidden className="mt-3 h-px w-5 shrink-0 bg-accent" />
              <span className="leading-relaxed text-ink-body">{line}</span>
            </li>
          ))}
        </ul>

        <p className="mb-8 mt-14 max-w-2xl text-lg leading-relaxed text-ink-body" data-reveal>
          You also agree:
        </p>
        <ul className="grid gap-x-16 gap-y-5 lg:grid-cols-2" data-reveal>
          {alsoAgree.map((line) => (
            <li key={line} className="flex gap-4 border-b border-rule pb-5">
              <span aria-hidden className="mt-3 h-px w-5 shrink-0 bg-accent" />
              <span className="leading-relaxed text-ink-body">{line}</span>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-2xl leading-relaxed text-ink-muted" data-reveal>
          If we consider your use of the site inappropriate we may take whatever
          action we think appropriate, including withdrawing your right to use it
          and, where warranted, legal proceedings. We exclude liability for
          action taken in response to misuse, and the responses described here
          are not the limit of what we may do.
        </p>
      </Section>

      {/* ---------------------------------------------------- accessibility */}
      <Section index="08" eyebrow="Accessibility" title="Our commitment" tone="ink">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12">
          <p className="text-lg leading-relaxed text-paper-body lg:col-span-7" data-reveal>
            We are committed to making this site usable by everyone. It is built
            to meet the Web Content Accessibility Guidelines,{" "}
            <strong>WCAG 2.2 Level AA</strong>, and to comply with our
            obligations under the Equality Act 2010. Every route is tested
            automatically for accessibility failures on each change.
          </p>
          <p className="leading-relaxed text-paper-muted lg:col-span-4 lg:col-start-9" data-reveal>
            Automated testing catches most problems but never all of them. If
            something here is difficult to use, please tell us and we will fix
            it.
          </p>
        </div>
      </Section>

      {/* --------------------------------------------------------- law */}
      <Section index="09" eyebrow="Law and contact" title="Governing law">
        <div className="container-prose prose-tc" data-reveal>
          <p>
            These terms, their subject matter and their formation are governed by
            English law. You and we both agree that the courts of England and
            Wales have exclusive jurisdiction.
          </p>
          <p>
            To contact us about these terms, email{" "}
            <a href="mailto:webteam@bpfministries.com">
              webteam@bpfministries.com
            </a>
            , or write to the Transformation Church Media Team,{" "}
            {site.address.line1}, {site.address.town}, {site.address.postcode}.
            For anything else, see <Link href="/contact">Contact</Link>.
          </p>
        </div>
      </Section>
    </>
  );
}
