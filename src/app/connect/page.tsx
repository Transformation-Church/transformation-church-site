import type { Metadata } from "next";

import { canonical } from "@/lib/seo";
import Link from "next/link";

import { Arrow, Grain } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Connect With Us",
  description:
    "Every way to find Transformation Church: social channels, sermons, giving and directions, all in one place.",
  ...canonical("/connect"),
};

/**
 * The link-in-bio destination.
 *
 * This replaces the old site's two overlapping pages (Connect With Us and
 * Social Media Links). The Instagram bio points at linktr.ee, so this page has
 * to do the same job at least as well: one screen, thumb-sized targets, no
 * scrolling required to reach the important links.
 */
const links = [
  { label: "Plan your visit", href: "/visit", note: "Sundays 10:00am & 12:00pm" },
  { label: "Watch sermons", href: "/sermons", note: "167 messages" },
  { label: "Instagram", href: site.social.instagram, note: "@transformationchurchuk", external: true },
  { label: "YouTube", href: site.social.youtube, note: "Full services", external: true },
  { label: "Facebook", href: site.social.facebook, note: "News & events", external: true },
  { label: "Give", href: `${site.churchSuite.base}/donate`, note: "Support the church", external: true },
  { label: "Restore Foodbank", href: "/restore-foodbank", note: "Wednesdays 10:30am" },
  { label: "Find us", href: site.address.maps, note: `${site.address.line1}, ${site.address.postcode}`, external: true },
];

export default function ConnectPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-deep text-paper">
      <Grain />

      <div className="container-page relative flex min-h-screen flex-col justify-center py-[calc(var(--header-height)+4rem)]">
        <div className="mx-auto w-full max-w-xl">
          <p className="label flex items-center gap-3 text-paper-muted">
            <span className="h-px w-8 bg-accent" />
            {site.tagline}
          </p>
          <h1 className="mt-7 font-display text-4xl text-paper">
            Connect with us
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-paper-muted">
            Everything in one place, however you&rsquo;d like to find us.
          </p>

          <ul className="mt-12 grid gap-3">
            {links.map((link) => {
              const inner = (
                <>
                  <span>
                    <span className="block font-display text-xl text-paper">
                      {link.label}
                    </span>
                    <span className="label mt-1 block text-paper-muted">
                      {link.note}
                    </span>
                  </span>
                  <Arrow className="h-4 w-4 text-paper-muted group-hover:text-ink" />
                </>
              );

              const cls =
                "group flex items-center justify-between gap-5 rounded-2xl border border-paper/15 px-6 py-5 transition-colors duration-400 ease-[var(--ease-out-expo)] hover:border-paper hover:bg-paper hover:text-ink";

              return (
                <li key={link.label}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noreferrer" className={cls}>
                      {inner}
                    </a>
                  ) : (
                    <Link href={link.href} className={cls}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="mt-10 text-center">
            <a
              href={`mailto:${site.contact.email}`}
              className="label link-underline text-paper-muted hover:text-paper"
            >
              {site.contact.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
