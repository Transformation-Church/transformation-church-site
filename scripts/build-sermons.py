"""
Turn the YouTube video list into the sermon archive.

Reads scripts/data/youtube-videos.json (see fetch-youtube-videos.py) and merges
it with the existing sermons, which came from the WordPress export and carry
things YouTube does not have: series, Bible passages, descriptions and the
church's own artwork. Where a video is already in the archive, that richer
record wins and only the title, speaker and date are reconciled.

    python scripts/build-sermons.py            # writes the content files
    python scripts/build-sermons.py --report   # prints what it would do

Title conventions on the channel, in the order they are tried:

    Title | Speaker | Date          the current house style
    Speaker | Title | Date          some 2021-22 uploads lead with the speaker
    Title - Speaker                 the older uploads, no date at all

Dates: a date in the title always wins. Most carry no year, but they do carry
a weekday, and "Sunday 18th February" only falls on a Sunday in some years, so
the weekday pins the year exactly. The video's rough age breaks any remaining
tie. Videos with no date in the title stay undated rather than borrowing their
upload date, which for the bulk-uploaded back catalogue would be years out.
"""

import json
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

# Titles carry Malayalam, and the Windows console is cp1252 by default.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "scripts" / "data" / "youtube-videos.json"
CONTENT = ROOT / "src" / "content"

# The 14 newest uploads are the segments of a single graduation service
# (processional, scripture reading, vote of thanks) plus a skit. The church
# asked for them to be left out.
SKIP_NEWEST = 14

HONORIFICS = r"Dr|Pr|Br|Sr|Rev|Evg|Pastor|Bro|Sis"

# People who preach without an honorific in the title. Anyone here is treated
# as a speaker wherever their name appears in the speaker slot.
PLAIN_SPEAKERS = {
    "Abdu Murray",
    "Blesson Mathew",
    "Jomio Nelloor",
}

# Sermons whose title names nobody, attributed by the church. Keyed by video
# id, because the titles are not distinctive enough to key on safely.
MANUAL_SPEAKERS = {
    "Jqg2uPykM-0": "Dr Wessly Lukose",  # Holiness Part-1
    "nJXsyq_STCM": "Dr Wessly Lukose",  # Holiness Part-2
    "jpG26MlLLjw": "Dr Wessly Lukose",  # Holiness Part-3
}

# Sermons whose title field on YouTube is empty, titled by the church. Keyed
# by video id for the same reason as MANUAL_SPEAKERS.
MANUAL_TITLES = {
    "VYt-26zh5xg": "Unusual message in a terrible time",
}

# Segments that are channel furniture rather than part of the sermon title.
BOILERPLATE = re.compile(
    r"^(Transformation Church|BPF( Ministries)?|Sunday Service|Saturday Service"
    r"|Sunday Combined Service|Online Service|Live|Sunday Service Live"
    r"|Morning Session|Evening Session|Full Service)$",
    re.I,
)

# A video matching any of these is not preaching: worship sets, children's and
# youth items, and channel trailers.
NOT_PREACHING = re.compile(
    r"Transformation Church (Worship|Children|Teens)"
    r"|Church Children|Church Teens|Church Worship"
    r"|BPF Ministries|Intro(ductory)? Video|Puppet Show|Skit"
    r"|Instrumental Cover|Original Song|Craft Work",
    re.I,
)

MONTHS = {
    m: i + 1
    for i, m in enumerate(
        "jan feb mar apr may jun jul aug sep oct nov dec".split()
    )
}
WEEKDAYS = {
    "mon": 0, "tue": 1, "tues": 1, "wed": 2, "wednes": 2,
    "thu": 3, "thur": 3, "thurs": 3, "fri": 4, "sat": 5, "satur": 5, "sun": 6,
}

DATE_RE = re.compile(
    r"(?:(?P<weekday>Mon|Tues?|Wednes|Wed|Thurs?|Thu|Fri|Satur|Sat|Sun)(?:day)?\s+)?"
    r"(?P<day>\d{1,2})(?:st|nd|rd|th)?\s+"
    r"(?P<month>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*"
    r"(?:\s+(?P<year>20\d{2}))?",
    re.I,
)

SPEAKER_RE = re.compile(rf"^\s*(?:{HONORIFICS})(?:\.\s*|\s+)\S", re.I)

# A speaker pinned on with no separator at all: "Abide in the Spirit - Part 3
# Dr Wessly Lukose", "Holiness & Engagement  Dr Wessly Lukose". Matched only as
# a fallback, once the ordinary segment rules have found nobody.
EMBEDDED_SPEAKER_RE = re.compile(
    rf"(?:{HONORIFICS})(?:\.\s*|\s+)"
    r"[A-Z][A-Za-z.]*(?:\s+[A-Z][A-Za-z.]*){0,3}",
)

# What is left when the whole title was the speaker's name.
SERVICE_RE = re.compile(r"\(([^)]*(?:Sunday|Saturday|Friday|Online)[^)]*)\)", re.I)

# A part or session number that ended up attached to the speaker's name, as in
# "Dr K Muralidharan part 2". It belongs to the title: without it, part 1 and
# part 2 collapse into the same title.
TRAILING_PART_RE = re.compile(
    r"\s+((?:part|day|session|morning|evening)\b.*)$", re.I
)

# Today, for reading "3 years ago" back into a year.
TODAY = date(2026, 9, 8)


def slugify(value):
    value = unicodedata.normalize("NFKD", value)
    value = "".join(c for c in value if not unicodedata.combining(c))
    value = re.sub(r"[^\w\s-]", "", value.lower())
    return re.sub(r"[\s_-]+", "-", value).strip("-")


def looks_like_speaker(segment, known):
    if not segment or NOT_PREACHING.search(segment):
        return False
    if segment in PLAIN_SPEAKERS or normalise_name(segment) in known:
        return True
    if not SPEAKER_RE.match(segment):
        return False
    # "Dr Wessly Lukose" is a speaker; a sentence merely starting with a word
    # like "Prayer" is not, so keep it short and title-shaped.
    words = segment.split()
    return 2 <= len(words) <= 6 and not segment.endswith(("?", "!", ":"))


def normalise_name(name):
    """Match 'Dr. Joy Samuel' to 'Dr Joy T Samuel' loosely enough to reuse an
    existing preacher rather than minting a near-duplicate."""
    n = re.sub(rf"\b({HONORIFICS})\b\.?", "", name, flags=re.I)
    n = re.sub(r"[^a-z\s]", "", n.lower())
    return " ".join(n.split())


def upload_year(video):
    text = video.get("uploadedText") or ""
    m = re.match(r"(\d+)\s+(year|month|week|day)", text)
    if not m:
        return None
    n, unit = int(m.group(1)), m.group(2)
    if unit == "year":
        return TODAY.year - n
    return TODAY.year if TODAY.month > 1 or unit != "month" else TODAY.year


def resolve_date(segment, video, whole_title=""):
    """A date from the title, with the year worked out if it is missing."""
    m = DATE_RE.search(segment)
    if not m:
        return None, None

    day, month = int(m.group("day")), MONTHS[m.group("month")[:3].lower()]

    # A year stated anywhere in the title beats anything inferred. "Year End
    # Fasting Prayer 2020 | 30th December" is December 2020, not 2021.
    stated = m.group("year")
    if not stated:
        anywhere = re.search(r"\b(20[0-2]\d)\b", whole_title)
        stated = anywhere.group(1) if anywhere else None
    if stated:
        try:
            return date(int(stated), month, day).isoformat(), "title"
        except ValueError:
            return None, None

    guess = upload_year(video) or TODAY.year
    weekday = m.group("weekday")

    def on(year):
        try:
            return date(year, month, day)
        except ValueError:
            return None

    # A sermon is uploaded when it is preached or shortly after, so the year is
    # the upload year or the one before it.
    window = [d for d in (on(guess), on(guess - 1)) if d]
    if weekday:
        wanted = WEEKDAYS[weekday.lower().rstrip("day") or "sun"]
        matching = [d for d in window if d.weekday() == wanted]
        if matching:
            return max(matching).isoformat(), "weekday"
        # The weekday and the date contradict each other, which happens when a
        # title is typed from memory. The day and month are the harder fact.
        if window:
            return max(window).isoformat(), "weekday conflict"

    if window:
        return max(window).isoformat(), "upload year"
    return None, None


def parse(video, known_speakers):
    """-> (record, reason_skipped)"""
    raw = " ".join(video["title"].split())
    if NOT_PREACHING.search(raw):
        return None, "not preaching"

    segments = [s.strip(" -–—") for s in raw.split("|")]
    segments = [s for s in segments if s]

    if len(segments) == 1:
        # Older uploads: "Title - Speaker", speaker last.
        pieces = [p.strip() for p in re.split(r"\s+-\s+|\s-\s", raw) if p.strip()]
        if len(pieces) >= 2 and looks_like_speaker(pieces[-1], known_speakers):
            segments = [" - ".join(pieces[:-1]), pieces[-1]]
        # Otherwise fall through: the speaker may be pinned on the end with no
        # separator, which the fallback below picks up.

    speaker = date_iso = date_source = None
    leftovers = []
    for segment in segments:
        if speaker is None and looks_like_speaker(segment, known_speakers):
            speaker = segment
            continue
        if date_iso is None:
            iso, source = resolve_date(segment, video, raw)
            if iso and not looks_like_speaker(segment, known_speakers):
                date_iso, date_source = iso, source
                continue
        if not BOILERPLATE.match(segment):
            leftovers.append(segment)

    if speaker is None and video["id"] in MANUAL_SPEAKERS:
        speaker = MANUAL_SPEAKERS[video["id"]]

    if speaker is None:
        # Last resort: a name pinned on with no separator.
        joined = " | ".join(leftovers) or raw
        m = EMBEDDED_SPEAKER_RE.search(joined)
        if not m:
            return None, "no speaker in title"
        speaker = m.group(0)
        leftovers = [joined[: m.start()] + " " + joined[m.end() :]]

    # A part number belongs to the sermon, not to the person preaching it.
    trailing = TRAILING_PART_RE.search(speaker)
    if trailing:
        speaker = speaker[: trailing.start()]
        leftovers.append(trailing.group(1))
    ordinal = re.search(r"\s+(\d+(?:st|nd|rd|th))\s*$", speaker, re.I)
    if ordinal:
        speaker = speaker[: ordinal.start()]
        leftovers.append(ordinal.group(1))

    title = " - ".join(leftovers).strip(" -–—:|")
    title = re.sub(
        r"\s*[-–—]?\s*\(?\s*Transformation Church[^)]*\)?\s*$", "", title, flags=re.I
    ).strip(" -–—:| ")
    title = " ".join(title.split())
    if not title and video["id"] in MANUAL_TITLES:
        title = MANUAL_TITLES[video["id"]]

    if not title:
        # The title was nothing but the speaker's name. Fall back to the
        # service the video itself names, rather than inventing one.
        service = SERVICE_RE.search(raw)
        if not service:
            return None, "no title left"
        title = " ".join(service.group(1).replace("Live", "").split())

    return {
        "title": title,
        "speaker": tidy_speaker(speaker),
        "order": video.get("order"),
        "date": date_iso,
        "dateSource": date_source,
        "youtubeId": video["id"],
        "duration": video.get("duration"),
    }, None


def tidy_speaker(name):
    """'Dr.Joy Samuel' and 'Dr. Joy Samuel' are the same person."""
    name = re.sub(rf"\b({HONORIFICS})\.?\s*", lambda m: m.group(1) + " ", name, flags=re.I)
    return " ".join(name.split())


def main():
    videos = json.loads(VIDEOS.read_text(encoding="utf-8"))[SKIP_NEWEST:]
    # Position on the channel, newest upload first. Undated sermons are shown
    # in this order, since it is the only ordering the church has for them.
    for position, video in enumerate(videos):
        video["order"] = position
    existing = json.loads((CONTENT / "sermons.json").read_text(encoding="utf-8"))
    preachers = json.loads((CONTENT / "preachers.json").read_text(encoding="utf-8"))

    known = {normalise_name(p["name"]) for p in preachers}
    known |= {normalise_name(n) for n in PLAIN_SPEAKERS}

    parsed, skipped = [], []
    for video in videos:
        record, reason = parse(video, known)
        (skipped if reason else parsed).append(
            {"title": video["title"], "id": video["id"], "reason": reason}
            if reason
            else record
        )

    by_id = {s["youtubeId"]: s for s in existing if s.get("youtubeId")}

    print(f"videos considered      : {len(videos)}")
    print(f"parsed as sermons      : {len(parsed)}")
    print(f"skipped                : {len(skipped)}")
    print()
    dated = [p for p in parsed if p["date"]]
    print(f"  dated                : {len(dated)}")
    for source in ("title", "weekday", "weekday conflict", "upload year"):
        n = sum(1 for p in parsed if p["dateSource"] == source)
        print(f"     from {source:8}    : {n}")
    print(f"  undated              : {len(parsed) - len(dated)}")
    print()
    print(f"already in the archive : {sum(1 for p in parsed if p['youtubeId'] in by_id)}")
    print(f"new to the archive     : {sum(1 for p in parsed if p['youtubeId'] not in by_id)}")

    reasons = {}
    for s in skipped:
        reasons[s["reason"]] = reasons.get(s["reason"], 0) + 1
    print("\nskipped because:")
    for reason, n in sorted(reasons.items(), key=lambda kv: -kv[1]):
        print(f"  {reason:22} {n}")

    if "--report" in sys.argv:
        print("\nsample of parsed records:")
        for p in parsed[:12]:
            print(f"  {p['date'] or 'undated  '}  {p['speaker']:24} {p['title'][:58]}")
        print("\nsample of skipped:")
        for s in skipped[:12]:
            print(f"  [{s['reason']}] {s['title'][:70]}")
        speakers = {}
        for p in parsed:
            speakers[p["speaker"]] = speakers.get(p["speaker"], 0) + 1
        print(f"\nspeakers found ({len(speakers)}):")
        for name, n in sorted(speakers.items(), key=lambda kv: -kv[1]):
            print(f"  {n:4}  {name}")

    (ROOT / "scripts" / "data" / "parsed-sermons.json").write_text(
        json.dumps({"parsed": parsed, "skipped": skipped}, indent=1, ensure_ascii=False),
        encoding="utf-8",
        newline="\n",
    )

    records = merge(parsed, existing)
    dated = sum(1 for r in records if r["date"])
    ids = [r["youtubeId"] for r in records if r["youtubeId"]]
    print(f"\nmerged archive         : {len(records)} sermons")
    print(f"  dated                : {dated}")
    print(f"  undated              : {len(records) - dated}")
    print(f"  duplicate video ids  : {len(ids) - len(set(ids))}")
    print(f"  duplicate slugs      : {len(records) - len({r['slug'] for r in records})}")

    if "--report" not in sys.argv:
        write_content(records)
        print("\nwritten to src/content/")


# ------------------------------------------------------------------ merging


def service_type(record):
    """What kind of gathering this was, from what the title and date say."""
    title = record["title"].lower()
    if "fasting" in title:
        return {"slug": "fasting-prayer", "name": "Fasting Prayer"}
    if not record["date"]:
        return None
    weekday = date.fromisoformat(record["date"]).weekday()
    if weekday == 6:
        return {"slug": "sunday-service", "name": "Sunday Service"}
    if weekday == 5:
        return {"slug": "saturday-service", "name": "Saturday Service"}
    if weekday == 4:
        return {"slug": "friday-service", "name": "Friday Service"}
    return None


# Spelling variants of one person that the initial-dropping key below cannot
# see are the same. Keyed by the folded form, valued by the folded form to use.
NAME_ALIASES = {
    "jifin cherian": "jiffin cherian",
    "blessen mathew": "blesson mathew",
    "blessen matthew": "blesson mathew",
    "reji mooledom": "reji mooledam",
    # Same man, name written both ways round, with a nickname on one of them.
    "mathewkutty babu": "mathewkutty",
}


# The spelling the church wants for a person, whatever the archive or the
# channel says. Keyed by the folded form from person_key.
CANONICAL_NAMES = {
    "sanjay balu": "Evg. Sanjay Balu",
}


def person_key(name):
    """
    One key per human being.

    Honorifics move around ("Dr Joy Samuel", "Pr Joy Samuel") and middle
    initials come and go ("Joy Samuel", "Joy T Samuel"), so both are dropped.
    Without this the archive lists the same preacher twice and splits his
    sermons between the two.
    """
    folded = normalise_name(name)
    folded = " ".join(w for w in folded.split() if len(w) > 1)
    return NAME_ALIASES.get(folded, folded)


def canonical_speakers(parsed, existing):
    """Pick one spelling per person: whatever the old archive already used if
    it has one, otherwise the spelling that appears most often."""
    tally = {}
    for record in parsed:
        key = person_key(record["speaker"])
        tally.setdefault(key, {})
        tally[key][record["speaker"]] = tally[key].get(record["speaker"], 0) + 1

    preferred = {}
    for old in existing:
        term = old.get("preacher")
        if term:
            preferred.setdefault(person_key(term["name"]), term["name"])

    chosen = {}
    for key, spellings in tally.items():
        if key in CANONICAL_NAMES:
            chosen[key] = CANONICAL_NAMES[key]
        elif key in preferred:
            chosen[key] = preferred[key]
        else:
            chosen[key] = max(spellings.items(), key=lambda kv: (kv[1], -len(kv[0])))[0]
    return chosen


def merge(parsed, existing):
    """
    YouTube owns the title, the speaker and the date. The old archive owns
    everything YouTube has no idea about: series, passage, description and the
    church's own artwork. A video already in the archive keeps its slug too, so
    links that are already out there do not break.
    """
    by_id = {s["youtubeId"]: s for s in existing if s.get("youtubeId")}
    speakers = canonical_speakers(parsed, existing)
    seen_ids, seen_slugs, records = set(), set(), []

    for record in parsed:
        video_id = record["youtubeId"]
        if video_id in seen_ids:
            continue
        seen_ids.add(video_id)

        old = by_id.get(video_id)
        name = speakers[person_key(record["speaker"])]
        preacher = {"slug": slugify(name), "name": name}

        slug = old["slug"] if old else slugify(record["title"])[:80] or video_id
        base, n = slug, 2
        while slug in seen_slugs:
            slug = f"{base}-{n}"
            n += 1
        seen_slugs.add(slug)

        merged = {
            "slug": slug,
            "title": record["title"],
            # A date in the title wins; otherwise keep whatever the archive knew.
            "date": record["date"] or (old or {}).get("date"),
            "preacher": preacher,
            "series": (old or {}).get("series"),
            "serviceType": (old or {}).get("serviceType") or service_type(record),
            "youtubeId": video_id,
            "passage": (old or {}).get("passage"),
            "description": (old or {}).get("description", ""),
            "image": (old or {}).get("image"),
        }
        # Not written out; only used to order the undated ones below.
        merged["_order"] = record.get("order", 10**6)
        records.append(merged)

    # Anything in the archive the channel no longer lists. Keep it: the sermon
    # happened, and the video may simply have been made private.
    for old in existing:
        if old.get("youtubeId") in seen_ids:
            continue
        if old["slug"] in seen_slugs:
            continue
        seen_slugs.add(old["slug"])
        # Fold its preacher too, or the archive lists one person twice purely
        # because one of their sermons is no longer on the channel.
        term = old.get("preacher")
        if term:
            name = speakers.get(person_key(term["name"]), term["name"])
            old = {**old, "preacher": {"slug": slugify(name), "name": name}}
        records.append(old)

    # Dated newest first; then the undated ones in the channel's own order.
    records.sort(
        key=lambda r: (
            0 if r["date"] else 1,
            _reverse_date(r["date"]),
            r.get("_order", 10**6),
        )
    )
    for record in records:
        record.pop("_order", None)
    return records


def _reverse_date(iso):
    """Sorts dates descending inside an otherwise ascending sort."""
    return "" if not iso else "".join(chr(ord("9") - int(c)) if c.isdigit() else c for c in iso)


def facets(records, key):
    grouped = {}
    for record in records:
        term = record.get(key)
        if not term:
            continue
        entry = grouped.setdefault(
            term["slug"],
            {"slug": term["slug"], "name": term["name"], "description": "", "count": 0, "latest": ""},
        )
        entry["count"] += 1
        if record["date"] and record["date"] > entry["latest"]:
            entry["latest"] = record["date"]
    return sorted(grouped.values(), key=lambda e: (-e["count"], e["name"]))


def write_content(records):
    (CONTENT / "sermons.json").write_text(
        json.dumps(records, indent=1, ensure_ascii=False), encoding="utf-8", newline="\n"
    )
    for name, key in (("preachers", "preacher"), ("series", "series"), ("service-types", "serviceType")):
        path = CONTENT / f"{name}.json"
        if name == "service-types" and not path.exists():
            continue
        path.write_text(
            json.dumps(facets(records, key), indent=1, ensure_ascii=False),
            encoding="utf-8",
            newline="\n",
        )
    return records


if __name__ == "__main__":
    main()
