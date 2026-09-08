import type { Metadata } from "next";
import Link from "next/link";

import { CookieSettingsButton } from "@/components/consent";
import { PageHeader, Section } from "@/components/ui";
import { canonical } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "What this website stores, what it loads from elsewhere, and the choice you are given before any of it happens.",
  ...canonical("/cookie-policy"),
};

/**
 * Deliberately not migrated from WordPress.
 *
 * The old policy documented CookieYes, Elementor and an analytics stack that
 * does not exist here. Describing cookies a site does not set is not a
 * cautious hedge, it is an inaccurate statement about your own service.
 *
 * The categories below read the same environment variables the tags read, so
 * this page starts naming Google Analytics and the Meta pixel the moment an id
 * is configured. That is on purpose: the most likely way this page goes stale
 * is someone adding a tag in Vercel and never coming back here.
 */

const GA_CONFIGURED = !!process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_CONFIGURED = !!process.env.NEXT_PUBLIC_META_PIXEL_ID;

const categories = [
  {
    name: "Photographs from our Instagram",
    live: true,
    detail:
      "Our latest posts are served by Behold, which republishes the account as plain data and hosts the images itself. Instagram is not contacted. No cookie is set, but Behold learns your IP address and which page you are on.",
  },
  {
    name: "Measuring how the site is used",
    live: GA_CONFIGURED,
    detail: GA_CONFIGURED
      ? "Google Analytics, operated by Google, records which pages you read and how you arrived. It sets cookies in your browser and sends that information to Google."
      : "Nothing is running here. If we add analytics, it will record which pages people read and how they arrived, and it will set cookies. This page will name it before it goes live.",
  },
  {
    name: "Advertising and social media tracking",
    live: PIXEL_CONFIGURED,
    detail: PIXEL_CONFIGURED
      ? "The Meta pixel, operated by Meta, lets Facebook and Instagram recognise you across other websites in order to target advertising. It sets cookies in your browser."
      : "Nothing is running here. If we add an advertising pixel, it will let that company recognise you across other websites, and it will set cookies. This page will name it before it goes live.",
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Cookie Policy"
        lede="This site sets no cookies of its own. A few things are loaded from other companies, and you are asked before any of them run."
      >
        <div className="mt-12 border-t border-paper/12 pt-9">
          <p className="max-w-2xl text-lg leading-relaxed text-paper-body">
            Nothing in the categories below runs until you allow it. Not loaded
            and held back, not queued: the code is not put on the page at all.
          </p>
        </div>
      </PageHeader>

      {/* --------------------------------------------------------- our own */}
      <Section index="01" eyebrow="Our own cookies" title="There are none">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12">
          <p className="text-lg leading-relaxed text-ink-body lg:col-span-7" data-reveal>
            This website sets no cookies of its own. We do not run advertising or
            cross-site tracking on our own account, and we do not build profiles
            of visitors. Browsing the site, reading a sermon or looking up
            service times stores nothing on your device.
          </p>
          <p className="leading-relaxed text-ink-muted lg:col-span-4 lg:col-start-9" data-reveal>
            Cookies are small files a website asks your browser to keep. They are
            how sites remember you between pages, and how advertising networks
            follow you between sites.
          </p>
        </div>
      </Section>

      {/* ------------------------------------------------------- categories */}
      <Section
        index="02"
        eyebrow="What you are asked about"
        title="Three categories"
        tone="warm"
      >
        <dl className="border-t border-rule" data-reveal>
          {categories.map((c) => (
            <div
              key={c.name}
              className="grid gap-x-16 gap-y-3 border-b border-rule py-8 lg:grid-cols-12"
            >
              <dt className="lg:col-span-4">
                <span className="block font-display text-xl">{c.name}</span>
                <span
                  className={`label mt-3 inline-block rounded-full px-3 py-1.5 ${
                    c.live
                      ? "bg-ink text-paper"
                      : "border border-rule text-ink-muted"
                  }`}
                >
                  {c.live ? "In use" : "Not in use"}
                </span>
              </dt>
              <dd className="text-lg leading-relaxed text-ink-body lg:col-span-8">
                {c.detail}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-muted" data-reveal>
          Each starts off. Turning one on is a positive choice, and no box is
          ever ticked for you.
        </p>
      </Section>

      {/* ---------------------------------------------------------- choice */}
      <Section index="03" eyebrow="Your choice" title="How it is remembered">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <p className="text-lg leading-relaxed text-ink-body">
              Your answer is kept in your browser&rsquo;s local storage, not in a
              cookie. It is never sent to us or to anyone else, and it stays on
              the device you answered on.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-ink-body">
              Refusing everything is one click, in the same place and at the same
              size as accepting everything. You can change your mind whenever you
              like:
            </p>
            <p className="mt-7">
              <CookieSettingsButton className="label rounded-full bg-ink px-6 py-3.5 text-paper transition-colors duration-300 hover:bg-accent" />
            </p>
          </div>

          <div className="lg:col-span-4 lg:col-start-9" data-reveal>
            <h3 className="label text-ink-muted">Managing cookies yourself</h3>
            <p className="mt-4 leading-relaxed text-ink-muted">
              You can control and delete cookies through your browser settings.
              Blocking everything will not stop this site working, though
              embedded videos may not display.
            </p>
            <p className="mt-5 leading-relaxed text-ink-muted">
              Clearing this site&rsquo;s data also clears your answer, so you
              will be asked again.
            </p>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- embeds */}
      <Section index="04" eyebrow="Embedded things" title="Video, maps and forms" tone="warm">
        <dl className="border-t border-rule" data-reveal>
          {[
            [
              "Sermon video",
              "Sermon pages show a still image rather than a player. YouTube is only contacted once you press play, and we use their privacy-enhanced domain, youtube-nocookie.com, which does not store personalised advertising identifiers. If you never press play, nothing goes to YouTube.",
            ],
            [
              "Sermon artwork",
              "Sermon images used to be fetched from YouTube as the page rendered. They are now downloaded and served from this site, so browsing the archive contacts nobody at all.",
            ],
            [
              "The map",
              "The map on Plan Your Visit used to be a Google embed, which set its own cookies as soon as the page loaded. We now draw it ourselves from OpenStreetMap data, so that page contacts nobody. Following the link to open the location in Google Maps takes you to Google, where their terms apply.",
            ],
            [
              "Forms",
              "The contact and newsletter forms use no cookies. What you send is emailed to the church office and handled as described in our Privacy Policy.",
            ],
          ].map(([name, detail]) => (
            <div
              key={name}
              className="grid gap-x-16 gap-y-3 border-b border-rule py-7 lg:grid-cols-12"
            >
              <dt className="font-display text-xl lg:col-span-4">{name}</dt>
              <dd className="leading-relaxed text-ink-muted lg:col-span-8">
                {detail}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* --------------------------------------------------------- changes */}
      <Section index="05" eyebrow="Changes" title="If this changes">
        <div className="container-prose prose-tc" data-reveal>
          <p>
            If we add anything that sets cookies or loads from another company,
            it goes into one of the categories above and is off until you turn it
            on. This page names what is running and who operates it, and is
            updated in the same change rather than afterwards.
          </p>
          <p>
            Questions about any of this: email{" "}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>. See
            also our <Link href="/privacy-policy">Privacy Policy</Link>, which
            covers what happens to anything you send us, and our{" "}
            <Link href="/terms-of-use">Terms of Use</Link>.
          </p>
        </div>
      </Section>
    </>
  );
}
