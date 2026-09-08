"""
Fail if a page exists that the sitemap does not list, or vice versa.

STATIC_ROUTES in src/app/sitemap.ts is typed by hand, and /safeguarding was
live for several days before anyone noticed it was missing from it. Sermons,
series, preachers, posts and vacancies are all generated from data and need no
checking; this only covers the static pages.

    python scripts/check-sitemap.py

Exits non-zero on a mismatch, so it can go in CI.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "src" / "app"

# Its own routing, its own chrome, and it must never be indexed.
IGNORED = {"studio"}


def page_routes():
    routes = set()
    for page in APP.rglob("page.tsx"):
        rel = page.relative_to(APP).parent.as_posix()
        if "[" in rel or rel.split("/")[0] in IGNORED:
            continue
        routes.add("/" + ("" if rel == "." else rel))
    return routes


def listed_routes():
    source = (APP / "sitemap.ts").read_text(encoding="utf-8")
    # /vacancies is added conditionally, only when a role is open.
    return set(re.findall(r'path: "([^"]+)"', source)) | {"/vacancies"}


def main():
    pages, listed = page_routes(), listed_routes()
    missing = sorted(pages - listed)
    extra = sorted(listed - pages - {"/vacancies"})

    for route in missing:
        print(f"  missing from the sitemap: {route}")
    for route in extra:
        print(f"  in the sitemap but has no page: {route}")

    if missing or extra:
        print(f"\n{len(missing) + len(extra)} problem(s)")
        sys.exit(1)

    print(f"sitemap lists all {len(pages)} static pages")


if __name__ == "__main__":
    main()
