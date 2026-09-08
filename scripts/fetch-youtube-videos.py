"""
Fetch the full video list from the church's YouTube channel.

The channel is the source of truth for sermons now, and it holds far more than
the WordPress export did. There is no API key to manage here: this calls the
same InnerTube endpoint the website itself calls, and follows the grid's
continuation tokens until they run out.

    python scripts/fetch-youtube-videos.py

Writes scripts/data/youtube-videos.json, which is the raw material for
build-sermons.py. Nothing here interprets a title; that is deliberate, so a
re-fetch never silently changes how a sermon is parsed.
"""

import json
import time
import urllib.error
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent / "data" / "youtube-videos.json"

CHANNEL_ID = "UC8oivVSDGI6855qly4rHRPg"  # @TransformationChurchUK

# The "Videos" tab. Shorts and live tabs have their own params; we only want
# the uploads grid.
VIDEOS_TAB_PARAMS = "EgZ2aWRlb3PyBgQKAjoA"

# The public web client key. It is not a secret — it ships in every YouTube
# page — and it is what identifies this as an ordinary web request.
API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8"

CONTEXT = {
    "client": {
        "clientName": "WEB",
        "clientVersion": "2.20260904.01.00",
        "hl": "en",
        "gl": "GB",
    }
}

ENDPOINT = f"https://www.youtube.com/youtubei/v1/browse?key={API_KEY}&prettyPrint=false"


def browse(payload):
    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps({"context": CONTEXT, **payload}).encode(),
        headers={
            "Content-Type": "application/json",
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
            ),
            "Accept-Language": "en-GB,en;q=0.9",
        },
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError) as error:
            print(f"  retry {attempt + 1}: {error}")
            time.sleep(3)
    raise SystemExit("YouTube would not answer")


def walk(node, visit, depth=0):
    if depth > 25 or node is None:
        return
    if isinstance(node, list):
        for item in node:
            walk(item, visit, depth + 1)
        return
    if not isinstance(node, dict):
        return
    visit(node)
    for value in node.values():
        walk(value, visit, depth + 1)


def grid_token(response):
    """
    The continuation token belonging to the video grid.

    A channel page carries several continuations — the About panel has one too
    — so take the token only from a list that actually holds videos. Picking
    the wrong one returns 200 with no items, which looks like the end of the
    channel.
    """
    token = None

    def visit(node):
        nonlocal token
        items = node.get("contents") or node.get("continuationItems")
        if not isinstance(items, list):
            return
        if not any(
            isinstance(i, dict) and ("richItemRenderer" in i or "lockupViewModel" in i)
            for i in items
        ):
            return
        for item in items:
            if not isinstance(item, dict):
                continue
            found = (
                item.get("continuationItemRenderer", {})
                .get("continuationEndpoint", {})
                .get("continuationCommand", {})
                .get("token")
            )
            if found:
                token = found

    walk(response, visit)
    return token


def harvest(response, videos, seen):
    def visit(node):
        lockup = node.get("lockupViewModel")
        if not lockup or lockup.get("contentType") != "LOCKUP_CONTENT_TYPE_VIDEO":
            return
        video_id = lockup.get("contentId")
        if not video_id or video_id in seen:
            return

        metadata = (lockup.get("metadata") or {}).get("lockupMetadataViewModel") or {}
        title = (metadata.get("title") or {}).get("content")
        if not title:
            return

        rows = []
        walk(
            metadata.get("metadata"),
            lambda n: rows.append(n["content"])
            if isinstance(n.get("content"), str)
            else None,
        )

        duration = None

        def find_duration(node):
            nonlocal duration
            text = node.get("text")
            if isinstance(text, str) and text.count(":") in (1, 2):
                if all(part.isdigit() for part in text.split(":")):
                    duration = text

        walk(lockup.get("contentImage"), find_duration)

        seen.add(video_id)
        videos.append(
            {
                "id": video_id,
                "title": title,
                "duration": duration,
                # Relative, e.g. "3 years ago". Only used to sanity-check a
                # year inferred from a title, never as the sermon's own date.
                "uploadedText": next(
                    (r for r in rows if "ago" in r), None
                ),
            }
        )

    walk(response, visit)


def main():
    videos, seen = [], set()

    response = browse({"browseId": CHANNEL_ID, "params": VIDEOS_TAB_PARAMS})
    harvest(response, videos, seen)
    token = grid_token(response)
    print(f"page 1: {len(videos)} videos")

    page = 1
    while token and page < 60:
        response = browse({"continuation": token})
        before = len(videos)
        harvest(response, videos, seen)
        token = grid_token(response)
        page += 1
        print(f"page {page}: {len(videos)} videos (+{len(videos) - before})")
        if len(videos) == before:
            break

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(videos, indent=1, ensure_ascii=False),
        encoding="utf-8",
        newline="\n",
    )
    print(f"\n{len(videos)} videos -> {OUT.relative_to(Path.cwd())}")
    print(f"newest: {videos[0]['title']}")
    print(f"oldest: {videos[-1]['title']}")


if __name__ == "__main__":
    main()
