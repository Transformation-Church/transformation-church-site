"""
Download the sermon thumbnails YouTube holds, and serve them ourselves.

Just under half the sermons have no artwork of the church's own, so their
thumbnail was being fetched from i.ytimg.com as the page rendered. No cookie,
but it told Google every visitor's IP address and which page they were reading,
which meant asking permission for it, which meant a grey panel for anyone who
said no.

These are the church's own videos, so the simplest fix is to stop asking and
stop borrowing: fetch each thumbnail once, keep it, and serve it from our own
domain like every other image.

    python scripts/fetch-sermon-thumbnails.py

Writes public/media/sermons/youtube/<id>.jpg and points sermons.json at them.
Re-running only fetches what is missing.

Sizes, best first. hqdefault is deliberately last: it is 4:3 with the picture
letterboxed inside it, so cropping it to a 16:9 card slices the top off the
church's own title text, which is exactly what these cards are for.
"""

import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
SERMONS = ROOT / "src" / "content" / "sermons.json"
OUT_DIR = ROOT / "public" / "media" / "sermons" / "youtube"
PUBLIC_PREFIX = "/media/sermons/youtube"

SIZES = ("maxresdefault", "sddefault", "hq720", "mqdefault", "hqdefault")

# YouTube answers a missing size with a 120x90 grey placeholder rather than a
# 404, and it is always well under this.
MIN_BYTES = 4000


def download(video_id):
    for size in SIZES:
        url = f"https://i.ytimg.com/vi/{video_id}/{size}.jpg"
        try:
            request = urllib.request.Request(
                url, headers={"User-Agent": "transformationchurch.co.uk build"}
            )
            with urllib.request.urlopen(request, timeout=30) as response:
                data = response.read()
        except (urllib.error.URLError, TimeoutError):
            continue
        if len(data) >= MIN_BYTES:
            return data, size
    return None, None


def main():
    sermons = json.loads(SERMONS.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    needed = [
        s for s in sermons if not s.get("image") and s.get("youtubeId")
    ]
    print(f"sermons            : {len(sermons)}")
    print(f"without artwork    : {len(needed)}")

    saved = skipped = failed = 0
    for sermon in needed:
        video_id = sermon["youtubeId"]
        path = OUT_DIR / f"{video_id}.jpg"

        if path.exists() and path.stat().st_size >= MIN_BYTES:
            sermon["image"] = f"{PUBLIC_PREFIX}/{video_id}.jpg"
            skipped += 1
            continue

        data, size = download(video_id)
        if not data:
            print(f"  no thumbnail for {video_id}  ({sermon['title'][:44]})")
            failed += 1
            continue

        path.write_bytes(data)
        sermon["image"] = f"{PUBLIC_PREFIX}/{video_id}.jpg"
        saved += 1
        if saved % 25 == 0:
            print(f"  {saved} downloaded…")

    SERMONS.write_text(
        json.dumps(sermons, indent=1, ensure_ascii=False),
        encoding="utf-8",
        newline="\n",
    )

    total = sum(f.stat().st_size for f in OUT_DIR.glob("*.jpg"))
    still_remote = sum(
        1 for s in sermons if (s.get("image") or "").startswith("http")
    )
    print(f"\ndownloaded         : {saved}")
    print(f"already had        : {skipped}")
    print(f"no thumbnail       : {failed}")
    print(f"on disk            : {len(list(OUT_DIR.glob('*.jpg')))} files, {total / 1024 / 1024:.1f} MB")
    print(f"still remote       : {still_remote}")
    print(f"with artwork now   : {sum(1 for s in sermons if s.get('image'))}/{len(sermons)}")


if __name__ == "__main__":
    main()
