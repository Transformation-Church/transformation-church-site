import Link from "next/link";

import { Logo } from "@/components/logo";
import { NewsletterForm } from "@/components/newsletter-form";
import { openVacancies } from "@/content/vacancies";
import {
  footerLinks,
  gatherings,
  legalLinks,
  navigation,
  site,
} from "@/lib/site";

const socials = [
  { label: "Instagram", href: site.social.instagram },
  { label: "Facebook", href: site.social.facebook },
  { label: "YouTube", href: site.social.youtube },
];

export function Footer() {
  // Only advertise vacancies while a role is actually open.
  const more =
    openVacancies().length > 0
      ? [...footerLinks, { label: "Vacancies", href: "/vacancies" }]
      : footerLinks;

  return (
    <footer className="bg-ink-deep text-paper">
      <div className="container-page">
        {/* Newsletter */}
        <div className="grid gap-10 border-b border-paper/12 py-16 lg:grid-cols-12 lg:gap-16 lg:py-20">
          <div className="lg:col-span-5">
            <h2 className="font-display text-3xl text-paper">
              Stay close to what&rsquo;s happening
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="max-w-md text-paper/60">
              Occasional news from the church: services, events and ways to get
              involved. No more than once a month.
            </p>
            <NewsletterForm className="mt-7" />
          </div>
        </div>

        {/* Directory */}
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Logo tone="dark" className="h-7" />
            <address className="mt-7 not-italic text-paper/60">
              {site.address.line1}
              <br />
              {site.address.town}
              <br />
              {site.address.postcode}
            </address>
            <a
              href={site.address.maps}
              target="_blank"
              rel="noreferrer"
              className="label link-underline mt-5 inline-block text-paper/75"
            >
              Get directions
            </a>
          </div>

          <div className="lg:col-span-2">
            <h3 className="label text-paper/35">Explore</h3>
            <ul className="mt-5 space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-underline text-paper/70 hover:text-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="label text-paper/35">More</h3>
            <ul className="mt-5 space-y-3">
              {more.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-underline text-paper/70 hover:text-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 lg:col-start-10">
            <h3 className="label text-paper/35">Sundays</h3>
            <ul className="mt-5 space-y-3">
              {gatherings.map((g) => (
                <li key={`${g.language}-${g.start}`} className="flex justify-between gap-4">
                  <span className="text-paper/70">{g.language}</span>
                  <span className="font-display text-lg text-paper">{g.time}</span>
                </li>
              ))}
            </ul>

            <h3 className="label mt-10 text-paper/35">Follow</h3>
            <ul className="mt-5 space-y-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline text-paper/70 hover:text-paper"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="link-underline text-paper/70 hover:text-paper"
                >
                  {site.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-5 border-t border-paper/12 py-8 text-paper/45 md:flex-row md:items-center md:justify-between">
          <p className="label text-[0.6rem] leading-relaxed">
            &copy; {new Date().getFullYear()} {site.name}. Registered as a
            Charitable Incorporated Organisation in England and Wales, Charity
            No.&nbsp;{site.charityNumber}.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="label link-underline text-[0.6rem] hover:text-paper"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
