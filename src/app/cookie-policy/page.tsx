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

            <h2>Your choice about media from elsewhere</h2>
            <p>
              The first time you visit, we ask whether you are happy for us to
              show our latest Instagram posts. Those images are served by
              Behold rather than by us, which tells them your IP address and
              which page you are reading, so we ask first. No cookie is set
              either way.
            </p>
            <p>
              Until you answer, nothing is fetched from either. If you say no,
              the rest of the site works exactly as it did, with a plain panel
              where those images would be. Saying no is one click, in the same
              place and at the same size as saying yes.
            </p>
            <p>
              Your answer is remembered in your browser&rsquo;s local storage,
              not in a cookie, and is never sent to us or to anyone else. To
              change it, use the <strong>Cookie settings</strong> link at the
              foot of any page.
            </p>

            <h2>Categories</h2>
            <p>
              The choice is split into three, and each is off until you turn it
              on:
            </p>
            <ul>
              <li>
                <strong>Photographs from our Instagram.</strong> The only one
                currently in use. No cookies, but Behold learns your IP address
                and which page you are on.
              </li>
              <li>
                <strong>Measuring how the site is used.</strong> Not in use yet.
                If we add it, it will tell us which pages people read and how
                they arrived, and it will set cookies.
              </li>
              <li>
                <strong>Advertising and social media tracking.</strong> Not in
                use yet. This would let services such as Facebook recognise you
                across other websites in order to target advertising, and would
                set cookies.
              </li>
            </ul>
            <p>
              Nothing in a category runs before you allow it. Not loaded and
              held back, not queued: the code is not put on the page at all.
              When we start using one of the categories above, this page will
              say what is running and who operates it before it goes live.
            </p>

            <h2>Cookies we set</h2>
            <p>
              None. This website does not set any cookies of its own. We do not
              run advertising or cross-site tracking, and we do not build
              profiles of visitors.
            </p>

            <h2>Third-party cookies</h2>
            <p>
              Two embedded services may set cookies. Neither loads until you
              choose to interact with it.
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

            <h3>Instagram: the gallery</h3>
            <p>
              The Instagram posts on our <Link href="/gallery">Gallery</Link>{" "}
              and <Link href="/about">About</Link> pages are served through
              Behold, which republishes the account as plain data and hosts the
              images itself. Instagram is not contacted and no Instagram
              cookies are set. These only load if you allow them.
            </p>

            <h3>Sermon artwork</h3>
            <p>
              Sermon images used to be fetched from YouTube. They are now
              downloaded and served from this site, so browsing the sermon
              archive contacts nobody.
            </p>

            <h2>The map</h2>
            <p>
              The map on our <Link href="/visit">Plan Your Visit</Link> page
              used to be embedded from Google Maps, which set its own cookies
              as soon as the page loaded. We now draw it ourselves from
              OpenStreetMap data, so that page contacts nobody and sets nothing.
              Following the link to{" "}
              <a href={site.address.maps} target="_blank" rel="noreferrer">
                open the location in Google Maps
              </a>{" "}
              takes you to Google, where their terms apply. Our address is{" "}
              {site.address.line1}, {site.address.town},{" "}
              {site.address.postcode}.
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
              will update this page and the choice described above will be
              extended to cover it.
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
