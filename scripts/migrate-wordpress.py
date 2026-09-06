#!/usr/bin/env python3
"""
Migrate the Transformation Church WordPress export (WXR) into the structured
JSON datasets this site builds from.

Usage:
    python scripts/migrate-wordpress.py <export.xml> [--media]

Writes to src/content/*.json. With --media, also downloads the uploads library
into public/media/, mirroring the wp-content/uploads path structure.
"""
from __future__ import annotations

import argparse
import collections
import datetime
import html
import json
import os
import re
import urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "src", "content")
MEDIA = os.path.join(ROOT, "public", "media")
UPLOADS = "/wp-content/uploads/"

NS = {
    "wp": "http://wordpress.org/export/1.2/",
    "content": "http://purl.org/rss/1.0/modules/content/",
    "excerpt": "http://wordpress.org/export/1.2/excerpt/",
    "dc": "http://purl.org/dc/elements/1.1/",
}

YT = re.compile(
    r"(?:youtu\.be/|youtube\.com/(?:watch\?v=|embed/|live/|v/|shorts/))"
    r"([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])"
)
TAGS = re.compile(r"<[^>]+>")

warnings: collections.Counter = collections.Counter()
notes: list[str] = []

# Sermons excluded at Joe's request because the WordPress records are faulty
# and cannot be repaired from the export. Fix them at source and remove the
# slug here to bring the sermon back.
EXCLUDED_SERMONS = {
    # YouTube ID is truncated to 10 characters; the real link is unrecoverable.
    "cautions-in-extended-life-part-3",
    # No preacher assigned in WordPress.
    "gods-presence-the-only-source-of-blessing",
}

# Typos carried over from the WordPress originals. Corrected on migration so the
# rebuilt site reads cleanly; fix them at source if the old site stays up.
TITLE_FIXES = {
    "Kids SPace": "Kids Space",
    "The 10 Commandements": "The Ten Commandments",
    "THE TABERNACLE": "The Tabernacle",
    "FACE OFF": "Face Off",
    "Go Tell It On The Mountain": "Go Tell It On The Mountain",
    "Miracles Of Nature": "Miracles of Nature",
}


# ---------------------------------------------------------------- helpers
def text(el, path, default=""):
    n = el.find(path, NS)
    return (n.text or default) if n is not None else default


def local_media(url):
    """Map a wp uploads URL to the site-local /media path."""
    if not url or UPLOADS not in url:
        return None
    return "/media/" + url.split(UPLOADS, 1)[1]


def youtube_id(url):
    m = YT.search(url or "")
    return m.group(1) if m else None


def clean_text(raw):
    """Strip WordPress/Elementor cruft down to readable paragraphs."""
    if not raw:
        return ""
    s = raw
    # A grammar-checker browser extension injected these containers into many
    # sermon descriptions when they were authored.
    s = re.sub(r'<div id="i4c-draggable-container".*?</div>\s*</div>', "", s, flags=re.S)
    s = re.sub(r'<div[^>]*class="resolved"[^>]*>\s*</div>', "", s, flags=re.S)
    s = re.sub(r"<(script|style)\b.*?</\1>", "", s, flags=re.S | re.I)
    s = re.sub(r"\[/?[a-z_]+[^\]]*\]", "", s)  # shortcodes
    s = re.sub(r"<br\s*/?>|</p>|</div>|</h[1-6]>", "\n", s, flags=re.I)
    s = TAGS.sub("", s)
    s = html.unescape(s)
    s = s.replace("\xa0", " ").replace("​", "").replace("﻿", "")
    s = re.sub(r"[ \t]+", " ", s)
    s = normalise_dashes(s)
    s = re.sub(r"\n\s*\n\s*\n+", "\n\n", s)
    return s.strip()


def normalise_dashes(s):
    """
    House style: no em or en dashes in site copy.

    Applied to migrated WordPress text as well as our own, so re-running the
    migration doesn't reintroduce them. Note this does rewrite the original
    authors' punctuation, including two line-ending dashes in Liz Joys' poems.
    """
    s = re.sub(r"(?<=\d)–(?=\d)", "-", s)                # numeric ranges
    s = re.sub(r"[ \t]*[–—][ \t]*$", "", s, flags=re.M)  # line-ending
    s = re.sub(r"[ \t]+[–—][ \t]+", ", ", s)        # parenthetical
    return s.replace("—", "-").replace("–", "-")    # any remainder


def paragraphs(raw):
    return [p.strip() for p in clean_text(raw).split("\n") if p.strip()]


def walk_widgets(nodes, out):
    """Flatten an Elementor element tree into (widgetType, settings) pairs."""
    for n in nodes or []:
        if isinstance(n, dict):
            if n.get("elType") == "widget":
                out.append((n.get("widgetType"), n.get("settings", {}) or {}))
            walk_widgets(n.get("elements"), out)
    return out


def elementor(page):
    raw = page["meta"].get("_elementor_data")
    if not raw:
        return []
    try:
        return walk_widgets(json.loads(raw), [])
    except (json.JSONDecodeError, TypeError):
        warnings["elementor_parse_failed"] += 1
        return []


def heading_text(settings):
    h = clean_text(str(settings.get("title", "")))
    return TITLE_FIXES.get(h, h)


# ---------------------------------------------------------------- parse WXR
def parse(src):
    channel = ET.parse(src).getroot().find("channel")
    terms = [
        {
            "tax": text(t, "wp:term_taxonomy"),
            "slug": text(t, "wp:term_slug"),
            "name": html.unescape(text(t, "wp:term_name")),
            "description": clean_text(text(t, "wp:term_description")),
        }
        for t in channel.findall("wp:term", NS)
    ]

    items = []
    for it in channel.findall("item"):
        items.append(
            {
                "title": html.unescape(text(it, "title")).strip(),
                "link": text(it, "link"),
                "creator": text(it, "dc:creator"),
                "excerpt": text(it, "excerpt:encoded"),
                "content": text(it, "content:encoded"),
                "post_id": text(it, "wp:post_id"),
                "post_date": text(it, "wp:post_date"),
                "slug": text(it, "wp:post_name"),
                "status": text(it, "wp:status"),
                "type": text(it, "wp:post_type"),
                "attachment_url": text(it, "wp:attachment_url"),
                "categories": [
                    {
                        "domain": c.get("domain"),
                        "slug": c.get("nicename"),
                        "name": html.unescape(c.text or ""),
                    }
                    for c in it.findall("category")
                ],
                "meta": {
                    text(m, "wp:meta_key"): text(m, "wp:meta_value")
                    for m in it.findall("wp:postmeta", NS)
                },
            }
        )

    by_type = collections.defaultdict(list)
    for d in items:
        by_type[d["type"]].append(d)
    return terms, by_type


# ---------------------------------------------------------------- builders
def build_sermons(by_type, attachments_by_id):
    rows = []
    for s in by_type["wpfc_sermon"]:
        if s["status"] != "publish":
            warnings["sermon_draft_skipped"] += 1
            continue
        if s["slug"] in EXCLUDED_SERMONS:
            warnings["sermon_excluded"] += 1
            notes.append("Sermon excluded (faulty source record): '%s'" % s["title"])
            continue

        cats = {c["domain"]: c for c in s["categories"]}

        ts = s["meta"].get("sermon_date")
        try:
            date = datetime.datetime.fromtimestamp(
                int(ts), datetime.timezone.utc
            ).strftime("%Y-%m-%d")
        except (TypeError, ValueError):
            date = (s["post_date"] or "")[:10]
            warnings["sermon_date_fallback"] += 1

        raw_video = s["meta"].get("sermon_video_link") or ""
        vid = youtube_id(raw_video)
        if raw_video and not vid:
            warnings["sermon_video_unparseable"] += 1
            notes.append(
                "Sermon '%s' has a malformed video URL: %s" % (s["title"], raw_video)
            )

        image = None
        tid = s["meta"].get("_thumbnail_id")
        if tid and tid in attachments_by_id:
            image = local_media(attachments_by_id[tid]["attachment_url"])
        if not image:
            warnings["sermon_no_image"] += 1

        def term(domain):
            c = cats.get(domain)
            return {"slug": c["slug"], "name": c["name"]} if c else None

        preacher = term("wpfc_preacher")
        if not preacher:
            warnings["sermon_no_preacher"] += 1
            notes.append("Sermon '%s' has no preacher assigned." % s["title"])

        rows.append(
            {
                "slug": s["slug"],
                "title": s["title"],
                "date": date,
                "preacher": preacher,
                "series": term("wpfc_sermon_series"),
                "serviceType": term("wpfc_service_type"),
                "youtubeId": vid,
                "passage": (s["meta"].get("bible_passage") or "").strip() or None,
                "description": clean_text(s["meta"].get("sermon_description"))
                or clean_text(s["content"]),
                "image": image,
            }
        )

    rows.sort(key=lambda r: (r["date"], r["title"]), reverse=True)
    return rows


def build_facets(sermons, terms):
    """Preachers / series / service types, counted and limited to those in use."""
    named = collections.defaultdict(dict)
    for t in terms:
        named[t["tax"]][t["slug"]] = t

    def facet(key, tax):
        counts = collections.Counter()
        latest = {}
        for s in sermons:
            v = s.get(key)
            if not v:
                continue
            counts[v["slug"]] += 1
            latest.setdefault(v["slug"], s["date"])
        out = []
        for slug, count in counts.items():
            t = named[tax].get(slug, {})
            out.append(
                {
                    "slug": slug,
                    "name": t.get("name") or slug.replace("-", " ").title(),
                    "description": t.get("description") or "",
                    "count": count,
                    "latest": latest[slug],
                }
            )
        out.sort(key=lambda x: (-x["count"], x["name"]))
        return out

    return (
        facet("preacher", "wpfc_preacher"),
        facet("series", "wpfc_sermon_series"),
        facet("serviceType", "wpfc_service_type"),
    )


def build_gallery(pages):
    """Elementor gallery widgets -> ordered categories of images."""
    page = pages.get("gallery")
    if not page:
        return []

    categories = []
    heading = None
    for wtype, st in elementor(page):
        if wtype == "heading":
            h = heading_text(st)
            if h and h.lower() not in ("gallery", "join us", "faq"):
                heading = h
            continue
        if wtype != "gallery":
            continue

        multi = [g for g in (st.get("galleries") or []) if g.get("multiple_gallery")]
        if multi:
            for g in multi:
                imgs = [i for i in (local_media(i.get("url")) for i in g["multiple_gallery"]) if i]
                if imgs:
                    categories.append(
                        {
                            "title": g.get("gallery_title") or "Gallery",
                            "group": heading,
                            "images": imgs,
                        }
                    )
        else:
            imgs = [i for i in (local_media(i.get("url")) for i in (st.get("gallery") or [])) if i]
            if imgs:
                categories.append({"title": heading or "Gallery", "group": None, "images": imgs})

    # De-duplicate images repeated across sets, keeping first use.
    seen = set()
    cleaned = []
    for c in categories:
        imgs = [i for i in c["images"] if not (i in seen or seen.add(i))]
        if imgs:
            cleaned.append({**c, "images": imgs})
    return cleaned


def build_video_page(pages, slug):
    """Kids Space / Spark: headings followed by YouTube and Facebook video widgets."""
    page = pages.get(slug)
    if not page:
        return {"title": slug, "intro": "", "collections": []}

    groups = []
    current = None
    intro = ""
    skip = {"are you", "new here", "faq"}

    for wtype, st in elementor(page):
        if wtype == "heading":
            h = heading_text(st)
            if not h or h.lower() in skip:
                current = None
                continue
            current = {"title": h, "videos": []}
            groups.append(current)
        elif wtype == "text-editor" and not intro:
            intro = clean_text(st.get("editor"))
        elif wtype == "video" and current:
            vid = youtube_id(st.get("youtube_url"))
            if vid:
                current["videos"].append({"provider": "youtube", "id": vid})
            else:
                warnings["video_widget_unparsed"] += 1
        elif wtype == "facebook-embed" and current:
            url = st.get("video_url") or st.get("post_url") or st.get("embed_url")
            if url:
                current["videos"].append({"provider": "facebook", "url": url})
            else:
                warnings["facebook_embed_no_url"] += 1

    # The first heading is the page title, not a collection.
    title = groups[0]["title"] if groups and not groups[0]["videos"] else page["title"]
    return {"title": title, "intro": intro, "collections": [g for g in groups if g["videos"]]}


def build_posts(by_type, attachments_by_id):
    skip_cats = {"uncategorized"}
    rows = []
    for p in by_type["post"]:
        if p["status"] != "publish":
            warnings["post_draft_skipped"] += 1
            notes.append("Blog draft not migrated: '%s'" % p["title"])
            continue

        cats = [
            c for c in p["categories"]
            if c["domain"] == "category" and c["slug"] not in skip_cats
        ]
        tags = [c["name"] for c in p["categories"] if c["domain"] == "post_tag"]

        image = None
        tid = p["meta"].get("_thumbnail_id")
        if tid and tid in attachments_by_id:
            image = local_media(attachments_by_id[tid]["attachment_url"])

        # "Title - by Author" is the house convention for the poems.
        title, author = p["title"], None
        m = re.match(r"^(.*?)\s*[-–—]\s*by\s+(.+)$", title, re.I)
        if m:
            title, author = m.group(1).strip(), m.group(2).strip()

        rows.append(
            {
                "slug": p["slug"],
                "title": title,
                "author": author,
                "date": (p["post_date"] or "")[:10],
                "categories": [{"slug": c["slug"], "name": c["name"]} for c in cats],
                "tags": tags,
                "excerpt": clean_text(p["excerpt"]),
                "body": paragraphs(p["content"]),
                "image": image,
            }
        )
    rows.sort(key=lambda r: r["date"], reverse=True)
    return rows


def build_legal(pages):
    """
    Port the Privacy Policy and Terms of Use across as structured blocks.

    These are generated boilerplate rather than brand copy, so they carry over
    close to verbatim. The cookie policy is deliberately not migrated: it
    documented CookieYes, Elementor and the old analytics stack, none of which
    exist on the rebuilt site, so it is rewritten to match what actually runs.
    """
    out = {}
    for slug in ("privacy-policy", "terms-of-use"):
        page = pages.get(slug)
        if not page:
            warnings["legal_page_missing"] += 1
            continue

        blocks = []
        for raw in re.split(r"(?i)(?=<h[23])", page["content"]):
            heading = re.match(r"(?is)<h([23])[^>]*>(.*?)</h\1>", raw)
            title = clean_text(heading.group(2)) if heading else None
            body = paragraphs(raw[heading.end():] if heading else raw)
            if title or body:
                blocks.append({"heading": title, "paragraphs": body})

        out[slug] = {"title": page["title"], "blocks": blocks}

    return out


def build_media_manifest(by_type):
    out = []
    for a in by_type["attachment"]:
        path = local_media(a["attachment_url"])
        if path:
            out.append({"path": path, "title": a["title"], "source": a["attachment_url"]})
    return out


# ---------------------------------------------------------------- media
def download_media(manifest):
    done = failed = skipped = 0
    for m in manifest:
        dest = os.path.join(MEDIA, m["path"][len("/media/"):].replace("/", os.sep))
        if os.path.exists(dest) and os.path.getsize(dest) > 0:
            skipped += 1
            continue
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        req = urllib.request.Request(m["source"], headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r, open(dest, "wb") as f:
                f.write(r.read())
            done += 1
        except Exception as e:  # noqa: BLE001 - report and keep going
            failed += 1
            notes.append("Media download failed: %s (%s)" % (m["source"], e))
    print("  media: %d downloaded, %d already present, %d failed" % (done, skipped, failed))


# ---------------------------------------------------------------- main
def write(name, data):
    os.makedirs(CONTENT, exist_ok=True)
    with open(os.path.join(CONTENT, name), "w", encoding="utf8", newline="\n") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("  %-24s %d" % (name, len(data) if isinstance(data, list) else 1))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("export", help="WordPress WXR export file")
    ap.add_argument("--media", action="store_true", help="also download the uploads library")
    args = ap.parse_args()

    terms, by_type = parse(args.export)
    attachments_by_id = {a["post_id"]: a for a in by_type["attachment"]}
    pages = {p["slug"]: p for p in by_type["page"]}

    sermons = build_sermons(by_type, attachments_by_id)
    preachers, series, service_types = build_facets(sermons, terms)
    manifest = build_media_manifest(by_type)

    print("Writing content:")
    write("sermons.json", sermons)
    write("preachers.json", preachers)
    write("series.json", series)
    write("service-types.json", service_types)
    write("gallery.json", build_gallery(pages))
    write("kids-space.json", build_video_page(pages, "kids-space"))
    write("spark.json", build_video_page(pages, "spark"))
    write("posts.json", build_posts(by_type, attachments_by_id))
    write("legal.json", build_legal(pages))
    write("media-manifest.json", manifest)

    if args.media:
        print("Downloading media...")
        download_media(manifest)

    if warnings:
        print("\nWarnings:")
        for k, v in sorted(warnings.items()):
            print("  %s: %d" % (k, v))
    if notes:
        print("\nNotes (source-data issues worth fixing upstream):")
        for n in dict.fromkeys(notes):
            print("  - %s" % n)


if __name__ == "__main__":
    main()
