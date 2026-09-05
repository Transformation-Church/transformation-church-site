# Transformation Church

Website for Transformation Church, Rowley Regis — a rebuild of the previous
WordPress/Elementor site.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Sanity
(blog only) · deployed on Vercel.

---

## Getting started

```bash
npm install
npm run dev
```

The site runs with no environment variables at all. Everything degrades
sensibly: the blog serves the posts migrated out of WordPress, the Instagram
section shows a follow panel, and the contact form tells people to email
directly. Add the variables in `.env.example` to switch each feature on.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (242 static pages) |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |

---

## Content

### Sermons, preachers, series — static data

167 sermons, 25 preachers and 19 series live as JSON in `src/content/`,
generated from the WordPress export. They are archival and change rarely, so
they ship in the bundle: no CMS round-trip, no query cost, and every sermon
page is prerendered at build time.

To refresh them from a new WordPress export:

```bash
python scripts/migrate-wordpress.py path/to/export.xml --media
```

`--media` also downloads the uploads library into `public/media/`. The script
reports any source-data problems it finds rather than silently papering over
them. After adding new media, run:

```bash
node scripts/optimise-media.js
```

which caps images at 2000px and re-encodes them. The original export was 246MB;
this brings it to about 88MB.

### Blog — Sanity

The blog reads from Sanity when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set, and
otherwise falls back to the nine posts migrated from WordPress. The Studio is
embedded at [`/studio`](http://localhost:3000/studio) — no separate deploy.

Schema lives in `src/sanity/schema.ts`: `post`, `author`, `category`.

### Editing site details

Service times, address, social links and the ChurchSuite account are all in
`src/lib/site.ts`. The "Are you new here?" answers live there too — the old site
had them duplicated across six pages and they had drifted apart.

---

## Environment variables

See `.env.example`. All optional.

| Variable | Effect if unset |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Blog uses migrated posts; `/studio` shows a setup notice |
| `RESEND_API_KEY` + `CONTACT_FROM` | Forms tell people to email `info@bpfministries.com` directly |
| `INSTAGRAM_FEED_URL` | Instagram section shows a follow panel instead of a grid |

---

## Notes on decisions

**Photography.** The migrated archive is warm and genuine but technically soft —
2013–2019 phone and compact-camera shots. The homepage is deliberately type-led
rather than opening on a full-bleed photograph, and `ArchiveImage` applies a
shared navy wash so a wall of mixed-quality images reads as one set.

**Video.** Sermon and Kids Space videos use a click-to-play facade: the poster
frame loads, and YouTube's player is only mounted on interaction, via
`youtube-nocookie.com`. That keeps roughly a megabyte of player off every page
load and means no third-party cookies are set unless someone presses play.

**Cookies.** The site sets none of its own. `/cookie-policy` documents what
actually runs — it was rewritten rather than migrated, because the old policy
described CookieYes, Elementor and analytics that no longer exist. **If
analytics or a consent tool are added later, that page must be updated.**

---

## Visual QA

```bash
npm start                    # in one terminal
node scripts/shots.js        # in another
```

Writes full-page screenshots of every key route to `.shots/` (git-ignored).
Reveal animations are forced complete so captures are deterministic.
