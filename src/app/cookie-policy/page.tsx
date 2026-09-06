import type { Metadata } from "next";

import { canonical } from "@/lib/seo";
import Link from "next/link";

import { PageHeader } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "What cookies this website uses, and when. Transformation Church sets no tracking or advertising cookies.",
  ...canonical("/cookie-policy"),
};

/**
 * Deliberately not migrated from WordPress.
 *
 * The old policy documented CookieYes, Elementor and the previous analytics
 * stack — none of which exist on this site. Describing cookies the site does
 * not set would be inaccurate, so this reflects what actually runs.
 *
 * If analytics or a consent tool are ever added, this page must be updated.
 */
export default function CookiePolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Cookie Policy"
        lede="This site sets no tracking or advertising cookies. A small number of third-party services set their own, and only in the situations described below."
      />

      <section className="bg-paper">
        <div className="container-page py-16 md:py-24">
          <div className="container-prose prose-tc">
            <p>
              Cookies are small text files placed on your device by websites you
              visit. They are widely used to make websites work, or work more
              efficiently, and to report information to site owners.
            </p>

            <h2>Cookies we set</h2>
            <p>
              None. This website does not set any cookies of its own. We do not
              run advertising or cross-site tracking, and we do not build
              profiles of visitors.
            </p>

            <h2>Third-party cookies</h2>
            <p>
              Two embedded services may set cookies. Both are optional in the
              sense that they only load when you interact with, or visit, the
              relevant part of the site.
            </p>

            <h3>YouTube: sermon videos</h3>
            <p>
              Sermon pages show a still image rather than a video player when
              they load. YouTube is only contacted once you press play, and we
              use their privacy-enhanced domain
              (<code>youtube-nocookie.com</code>), which does not store
              personalised advertising identifiers. If you never press play, no
              YouTube cookies are set.
            </p>

            <h3>Google Maps: directions</h3>
            <p>
              The map on our{" "}
              <Link href="/visit">Plan Your Visit</Link> page is embedded from
              Google Maps, which sets its own cookies when it loads. If you
              would rather avoid this, you can view the same location by opening{" "}
              <a href={site.address.maps} target="_blank" rel="noreferrer">
                Google Maps directly
              </a>{" "}
              or simply using our address: {site.address.line1},{" "}
              {site.address.town}, {site.address.postcode}.
            </p>

            <h2>Forms</h2>
            <p>
              Our contact and newsletter forms do not use cookies. Information
              you submit is sent to us by email at{" "}
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>{" "}
              and is handled as described in our{" "}
              <Link href="/privacy-policy">Privacy Policy</Link>.
            </p>

            <h2>Managing cookies</h2>
            <p>
              You can control and delete cookies through your browser settings.
              Blocking all cookies will not stop this site from working, though
              embedded videos and maps may not display correctly.
            </p>

            <h2>Changes to this policy</h2>
            <p>
              If we add analytics or any other service that sets cookies, we
              will update this page and introduce a consent banner where one is
              required.
            </p>

            <h2>Questions</h2>
            <p>
              If anything here is unclear, email us at{" "}
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>{" "}
              and we&rsquo;ll answer.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
