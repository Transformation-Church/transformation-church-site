# Transformation Church

Website for Transformation Church, Rowley Regis. A rebuild of the previous
WordPress and Elementor site.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Sanity for
the blog · ChurchSuite for events · deployed on Vercel.

- Live (temporary address): https://transformation-church-site.vercel.app
- Repository: https://github.com/Transformation-Church/transformation-church-site

---

## Getting started

```bash
npm install
npm run dev
```

The site runs with no environment variables at all. Every integration degrades
to a designed state rather than an error: the blog serves the posts migrated
out of WordPress, events fall back to the confirmed Sunday schedule, Instagram
shows a follow panel, and the contact forms tell people to email the office
directly.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (247 prerendered pages) |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |

---

## Where the content lives

There are four sources, chosen per content type rather than forced into one CMS.

### Sermons, preachers, series: static JSON

167 sermons, 25 preachers and 19 series live in `src/content/*.json`, generated
from the WordPress export. They are archival and change rarely, so they ship in
the bundle: no CMS round trip, no query cost, and every sermon page is
prerendered.

Refresh them from a new WordPress export with:

```bash
python scripts/migrate-wordpress.py path/to/export.xml --media
```

`--media` also downloads the uploads library into `public/media/`. The script
reports source-data problems rather than silently papering over them. After
adding new media:

```bash
node scripts/optimise-media.js
```

which caps images at 2000px and re-encodes them. The original export was 246MB;
this brings it to about 88MB.

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
- Event locations use `location.address` and **never** `location.name`.
  ChurchSuite is using that field for host rotas, so member names would
  otherwise be published.

### Everything else: typed modules

Service times, address, social links and the ChurchSuite account are in
`src/lib/site.ts`. The statement of faith is in `src/content/beliefs.ts`, open
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
| `INSTAGRAM_FEED_URL` | Instagram section shows a follow panel instead of a grid |
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
4. Replace the Restore Foodbank figures, which are from 2023 and flagged with a
   `TODO` in `src/app/restore-foodbank/page.tsx`.
5. Decide whether the Friday Hindi Service belongs in the headline schedule in
   `src/lib/site.ts`. It runs weekly in ChurchSuite and appears on What's On,
   but was not in the schedule confirmed at handover.

### Known defects in the source data

Both are in WordPress, not in the migration:

- *Cautions in Extended Life, Part 3* has a truncated YouTube ID
  (`EKZrQWWkuj`, 10 characters where 11 are required).
- *God's presence: The only source of Blessing* has no preacher assigned.

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
  it cannot drift. It carries the live weekly rhythm and upcoming events.
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

**Sermon artwork.** The church's own 16:9 title cards are preferred over
YouTube's `hqdefault`, which is 4:3 with letterboxing baked in, so cropping it
slices the title off the card.

**Cookies.** The site sets none of its own. `/cookie-policy` documents what
actually runs; it was rewritten rather than migrated, because the old policy
described CookieYes, Elementor and analytics that no longer exist. **If
analytics or a consent tool are added, that page must be updated.**

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
