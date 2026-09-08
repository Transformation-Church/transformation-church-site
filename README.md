<div align="center">

<img src="public/brand/emblem.png" alt="Transformation Church" width="112">

# Transformation Church

**Rowley Regis, Birmingham** · Registered charity 1208306

A rebuild of transformationchurch.co.uk, replacing WordPress and Elementor.

<br>

[![Next.js](https://img.shields.io/badge/Next.js-15.5.25-000000?style=plastic&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.1.1-087EA4?style=plastic&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=plastic&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=plastic&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[![Sanity](https://img.shields.io/badge/Sanity-blog_CMS-F03E2F?style=plastic&logo=sanity&logoColor=white)](https://www.sanity.io)
[![ChurchSuite](https://img.shields.io/badge/ChurchSuite-events_feed-18265E?style=plastic)](https://churchsuite.com)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?style=plastic&logo=vercel&logoColor=white)](https://vercel.com)

[![Accessibility](https://img.shields.io/badge/WCAG_2.2_AA-0_violations-1D6A4F?style=plastic)](#accessibility)
[![Pages](https://img.shields.io/badge/prerendered-407_pages-18265E?style=plastic)](#where-the-content-lives)
[![Sermons](https://img.shields.io/badge/sermon_archive-309-18265E?style=plastic)](#sermons-preachers-series-static-json)
[![Cookies](https://img.shields.io/badge/cookies_set-none-1D6A4F?style=plastic)](#notes-on-decisions)
[![Third parties](https://img.shields.io/badge/third_parties-consented_only-1D6A4F?style=plastic)](#consent)

**[Live site](https://transformation-church-site.vercel.app)**  ·  **[Council paper](docs/council-paper-website-rebuild.html)**  ·  **[Studio](https://transformation-church-site.vercel.app/studio)**

</div>

---

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Sanity for
the blog · ChurchSuite for events · deployed on Vercel.

> **Note**
> The live address above is temporary. The site deliberately sends `noindex`
> until `SITE_INDEXABLE=true` is set, so it is not indexed as duplicate content
> against the old site. See the [launch checklist](#launch-checklist).

---

## Where the content lives

There are four sources, chosen per content type rather than forced into one CMS.

### Sermons, preachers, series: static JSON

309 sermons, 41 preachers and 19 series live in `src/content/*.json`. They are
archival and change rarely, so they ship in the bundle: no CMS round trip, no
query cost, and every sermon page is prerendered.

The YouTube channel is the source. Three scripts, run in order:

```bash
python scripts/fetch-youtube-videos.py      # the channel's video list
python scripts/build-sermons.py --report    # parse and merge, without writing
python scripts/build-sermons.py             # write src/content/*.json
python scripts/fetch-sermon-thumbnails.py   # artwork, served from our domain
```

`fetch-youtube-videos.py` calls the same InnerTube endpoint youtube.com itself
calls, so there is no API key to obtain or rotate. The one subtlety is which
continuation token to follow: a channel page carries several, including one for
the About panel, and following that one returns HTTP 200 with no items, which
reads exactly like reaching the end of the channel.

`build-sermons.py` parses titles and merges with what is already in the
archive, so the WordPress records keep what YouTube has no idea about: series,
Bible passages, descriptions, the church's own artwork, and their slugs, so
existing links do not break. Three title conventions are handled, because the
channel has used all three:

```
Title | Speaker | Date      the current house style
Speaker | Title | Date      some 2021-22 uploads
Title - Speaker             the older uploads, no date at all
```

**Dates come from the title, never from the upload.** Most titles carry no
year, but they do carry a weekday, and "Sunday 18th February" falls on a Sunday
in only some years, which pins it exactly. Checked against the 140 sermons the
WordPress archive already had dates for: 136 agree. 72 sermons carry no date at
all and are shown as undated rather than borrowing an upload date, which for
the bulk-uploaded back catalogue would be years out.

**Duplicates are checked three ways**: by video id, by slug, and by person.
Preachers fold on a key that ignores honorifics and middle initials, or the
archive lists Dr Joy Samuel and Dr Joy T Samuel as two men with 57 and 16
sermons rather than one with 74.

The original WordPress export is still reproducible if it is ever needed:

```bash
python scripts/migrate-wordpress.py path/to/export.xml --media
node scripts/optimise-media.js
```

`--media` downloads the uploads library into `public/media/`, and
`optimise-media.js` caps images at 2000px and re-encodes them. The export was
246MB; `public/media` is about 163MB today, including the sermon artwork.

### Blog: Sanity

Reads from Sanity when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set, and otherwise
falls back to the nine posts migrated from WordPress. The Studio is embedded at
[`/studio`](http://localhost:3000/studio), so there is one deploy, not two.

Schema is in `src/sanity/schema.ts`: `post`, `author`, `category`. The import is
repeatable via `scripts/import-blog-to-sanity.js`, which needs a Sanity token
for the account that owns the project.

### Events: ChurchSuite

`/whats-on` reads the public calendar feed at
`https://{account}.churchsuite.com/-/calendar/{uuid}/json`, revalidating every
15 minutes. No iframe: its contents would be invisible to search engines, could
not carry structured data, and would load third-party cookies onto a site that
sets none.

Two things worth knowing if you touch `src/lib/events.ts`:

- Events use `starts_at` and `ends_at` as true UTC instants. A 10:00am service
  is `09:00Z` under BST and `10:00Z` under GMT, so always format in
  `Europe/London` rather than doing arithmetic.
- `sequence_id` is non-null for recurring series. Without splitting on it the
  page becomes 50-odd repetitions of the same three services.
- Event locations use `location.address` and **never** `location.name` for a
  physical location. ChurchSuite is using that field for host rotas, so member
  names would otherwise be published. `location.name` is read only when
  `location.type` is `online`, where it names a platform: that is how the site
  knows the Hindi service meets on Zoom.

### The map on /visit: OpenStreetMap, drawn by us

`/visit` used to embed a live Google map. That put a third party and its
cookies on the page a first-time visitor is most likely to open, and dropped
Google's own styling into the middle of a navy and paper layout.

```bash
python scripts/build-locator-map.py
```

fetches the real road and rail geometry from OpenStreetMap once and commits it
as projected SVG paths, which `LocatorMap` draws in the site's own palette. Two
framings: 2.2km wide for the desktop column, and a square 1.1km one for phones,
because shrinking the wide frame put every street name at about eight pixels.
The data is ODbL, so the attribution under the map is required and must stay.

The map links out to the Google listing by **CID**. That link has rotted twice
already: the old `maps.app.goo.gl` short link died with the service behind it,
and the long-form `/maps/place/Name/@lat,lng/data=...` URL that replaced it now
redirects to `/maps/place//@...`, which shows coordinates with no pin. A CID
names the Business Profile itself, so there is nothing to normalise away.

### Everything else: typed modules

Address, social links and the ChurchSuite account are in `src/lib/site.ts`.
Service times are **not** hardcoded: `getGatherings()` reads them from
ChurchSuite, and the list in `site.ts` is only a fallback for when that feed is
unreachable. The statement of faith is in `src/content/beliefs.ts`, open
roles in `src/content/vacancies.ts`. The "Are you new here?" answers live in one
place because the old site had them duplicated across six pages and they had
drifted apart.

---

## Environment variables

See `.env.example`. All are optional; the table says what happens without each.

| Variable | Effect if unset |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Blog uses migrated posts; `/studio` shows a setup notice |
| `NEXT_PUBLIC_SANITY_DATASET` | Defaults to `production` |
| `RESEND_API_KEY` + `CONTACT_FROM` | Forms tell people to email `info@bpfministries.com` directly |
| `INSTAGRAM_FEED_URL` | Falls back to the church's Behold feed in `site.ts`. That URL is public and read-only, so it lives in the repo rather than an environment variable nobody can see |
| `CHURCHSUITE_CALENDAR_UUID` | Falls back to the church's current calendar UUID |
| `SITE_INDEXABLE` | **Site sends `noindex` and disallows all crawlers** |

---

## Launch checklist

1. **Set `SITE_INDEXABLE=true`** in Vercel's production environment. Until then
   the site sends `X-Robots-Tag: noindex` and a blanket `robots.txt` disallow,
   deliberately, so the temporary address is not indexed as duplicate content
   against the old site. Forgetting this means launching invisible to Google.
2. Point `transformationchurch.co.uk` at Vercel.
3. Add `RESEND_API_KEY` and `CONTACT_FROM` so the forms deliver.
4. Correct the charity number in the safeguarding policy PDF. It reads 1132602;
   the registered number is 1208306, which is what the site uses.

### Excluded sermons

`EXCLUDED_SERMONS` in the migration script still lists two WordPress records
that were unrepairable from the export: *Cautions in Extended Life, Part 3*,
whose YouTube id was truncated to ten characters, and *God's presence: The only
source of Blessing*, which had no preacher.

**Both are now on the site**, recovered from the channel, because the archive is
built from YouTube rather than the export. The exclusion list only affects a
re-import and can be left alone.

---

## Accessibility

The site passes **axe-core with zero violations** against WCAG 2.0, 2.1 and 2.2
Level A and AA plus best-practice, across 24 routes at both 1280px and 390px.

To re-run it, note the trap that produced a page of false failures the first
time:

> Run with **reduced motion**, and force `[data-reveal]` elements to their
> visible resting state before invoking axe. The scroll-reveal animation is a
> 0.9s opacity fade, and axe run mid-fade samples text at roughly 45% opacity
> and reports contrast failures that pixel sampling disproves.

Text colours are **solid tokens**, not opacity modifiers, for the same reason:
`text-ink/70` compiles to an `oklab()` colour and removes any dependency on
what is composited behind it. Each was measured against every ground it
appears on:

| Token | Value | Contrast |
| --- | --- | --- |
| `ink-muted` | `#5b6489` | 5.27:1 on paper, 4.79:1 on warm |
| `ink-body` | `#454f7b` | 7.20:1 on paper, 6.54:1 on warm |
| `paper-muted` | `#9999a3` | 6.52:1 on ink-deep, 5.03:1 on ink |
| `paper-body` | `#b0b0b6` | 8.53:1 on ink-deep, 6.59:1 on ink |

The accent is `#b93e28`, darkened from `#c5462f`, which measured 4.46:1 on
paper and 4.05:1 on the warm ground, both just under AA for the small uppercase
labels it is used on.

ChurchSuite category colours are rendered as swatches, never as text: Prayer
Tower (`#fa5252`) measures 2.72:1 on the warm ground.

Automated testing catches most problems but not all. It is not a substitute for
testing with people who use assistive technology.

---

## SEO and machine readability

- **Structured data** (`src/lib/seo.ts`): `Church` sitewide with address, geo,
  service times, socials and charity number; `VideoObject` on sermons;
  `BlogPosting` on posts; `FAQPage` on the visit page; `JobPosting` on
  vacancies; `Event` on What's On; `BreadcrumbList` on detail pages. Nothing is
  invented: the coordinates come from the church's ChurchSuite site record.
- **`/llms.txt`** is generated from the same datasets the pages render from, so
  it cannot drift. It carries the live weekly gatherings, including which meet
  online, and upcoming events.
- **`sitemap.ts`** generates sermon, series, preacher, post and vacancy URLs
  from data, but its list of static pages is typed by hand and has fallen
  behind once already. `python scripts/check-sitemap.py` fails if a page exists
  that the sitemap does not list, or the reverse.
- Canonical URLs on every route, an Open Graph card at 1200x630
  (`node scripts/build-og-image.js`), and Twitter summary cards.

---

## House style

**No em or en dashes anywhere in site copy.** `normalise_dashes()` in the
migration script keeps regenerated content consistent, so a re-import will not
reintroduce them.

---

## Notes on decisions

**Photography.** The migrated archive is warm and genuine but technically soft,
being 2013 to 2019 phone and compact-camera shots. The homepage is deliberately
type-led rather than opening on a full-bleed photograph, and `ArchiveImage`
applies a shared navy wash so a wall of mixed-quality images reads as one set.

**Video.** Sermon and Kids Space videos use a click-to-play facade: the poster
frame loads, and YouTube's player is only mounted on interaction, via
`youtube-nocookie.com`. That keeps roughly a megabyte of player off every page
load and means no third-party cookies unless someone presses play.

**Sermon artwork.** Every sermon has artwork served from our own domain: the
church's own 16:9 title cards where WordPress had them, and the YouTube
thumbnail downloaded once by `scripts/fetch-sermon-thumbnails.py` for the 145
that had none. Fetching them live from `i.ytimg.com` would have handed Google
every visitor's IP address and the page they were reading, for images of the
church's own videos. The script takes the largest size YouTube holds and leaves
`hqdefault` until last: that one is 4:3 with the picture letterboxed inside, so
cropping it to a 16:9 card slices the title off.

<a id="consent"></a>

**Cookies and consent.** The site sets no cookies of its own and writes nothing
to storage until asked. Measured, not assumed: a fresh visit to any page
contacts nobody.

Under PECR that means nothing here legally needs consent today, and an
accept-or-reject banner over nothing would be theatre. So the banner gates
something real: the Instagram feed, whose images are served by Behold and
therefore tell them a visitor's IP address. Everything else, sermon artwork
included, is served by us.

`src/components/consent.tsx` carries three categories, each off until switched
on, and the instructions for adding Google Analytics or a Meta pixel when the
time comes. The short version:

```tsx
<ConsentedScript category="analytics">
  <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXX" />
</ConsentedScript>
```

`analytics` is measurement, `marketing` is anything that follows people across
sites. `ConsentedScript` does not render its children until the category is
allowed, so the script is never put on the page at all. **Adding one means
updating `/cookie-policy` and the category list in the same change**, or the
site will be describing something that is no longer true.

Three rules the implementation encodes, being the ones usually broken: refusing
everything is one click at the same size and in the same place as accepting;
consent is withdrawable from a Cookie settings link in the footer of every
page; and no box is ever pre-ticked, because a pre-ticked box is not consent
and anything relying on one would be running unlawfully.

**Safeguarding.** `/safeguarding` condenses the 40-page BPF policy to what a
worried person needs, ordered for them rather than for the policy: the 999
line, who to tell, the three rules, then what happens next. The full policy
remains authoritative and the page says so. The coordinators' personal mobile
numbers are in that policy and deliberately not on the page; the church line
and the ThirtyOne:Eight 24-hour helpline reach the same people without putting
three individuals' mobiles somewhere Google will index. Contacts live in
`safeguarding` in `src/lib/site.ts`.

**No sermon audio.** Worth recording so nobody looks for it: the WordPress
export contains no audio at all. All 61 `sermon_audio_id` values are `"0"`,
meaning none, and there are zero audio files of any format in the media
library. A podcast feed needs audio to enclose, so it cannot be built until
recordings are exported and hosted.

---

## Visual QA

```bash
npm start                    # in one terminal
node scripts/shots.js        # in another
```

Writes full-page screenshots of every key route to `.shots/` (git-ignored).
Reveal animations are forced complete so captures are deterministic. Pass a
base URL to shoot the deployed site instead:

```bash
node scripts/shots.js https://transformation-church-site.vercel.app
```
