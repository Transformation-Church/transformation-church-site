"""
Build the /visit locator map from OpenStreetMap.

The page used to embed a live Google Maps iframe. That pulled a third party and
its cookies onto the page a first-time visitor is most likely to open, and it
dropped Google's own red-pin-and-green-parks styling into the middle of a navy
and paper layout.

This fetches the real road and rail geometry once, projects it, and writes a
small JSON file of SVG paths. The page then draws an accurate map in the site's
own palette with no network calls at all.

Re-run only when the roads change, which is to say almost never:

    python scripts/build-locator-map.py

Data is OpenStreetMap, licensed ODbL. The attribution the licence requires is
rendered under the map by the LocatorMap component.
"""

import json
import math
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src" / "content" / "locator-map.json"

# The church, from the Google Maps listing.
CHURCH_LAT, CHURCH_LON = 52.477975, -2.034637

# Frame size on the ground. Wide enough to place the church in its road network
# and reach the station, tight enough that the streets stay readable.
WIDTH_M, HEIGHT_M = 2200, 1650
VIEW_W, VIEW_H = 1000, 750

# Drawn heaviest first so the trunk roads sit on top of the residential mesh.
ROAD_CLASSES = {
    "motorway": "a",
    "motorway_link": "a",
    "trunk": "a",
    "trunk_link": "a",
    "primary": "b",
    "primary_link": "b",
    "secondary": "b",
    "tertiary": "c",
    "residential": "d",
    "unclassified": "d",
}

# Named roads worth labelling. Residential streets would just be noise.
LABEL_CLASSES = {"a", "b"}
MAX_LABELS = 9

# Labels are placed greedily, longest road first, and anything landing closer
# than this to one already placed is dropped. Without it the labels pile up in
# whichever corner has the most named roads.
LABEL_SPACING = 150

# Kept clear: the church marker and its own label, and the scale bar.
KEEP_CLEAR = (
    {"x": VIEW_W / 2, "y": VIEW_H / 2, "r": 130},
    {"x": 130, "y": VIEW_H - 45, "r": 200},
)


def bbox():
    dlat = (HEIGHT_M / 2) / 111_132
    dlon = (WIDTH_M / 2) / (111_320 * math.cos(math.radians(CHURCH_LAT)))
    return (
        CHURCH_LAT - dlat,
        CHURCH_LON - dlon,
        CHURCH_LAT + dlat,
        CHURCH_LON + dlon,
    )


S, W, N, E = bbox()


# The public Overpass instances are free and busy, so a 504 is routine rather
# than a real failure. Try each in turn before giving up.
MIRRORS = (
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
)


def fetch():
    query = f"""[out:json][timeout:90];
(
  way({S},{W},{N},{E})["highway"~"^({'|'.join(ROAD_CLASSES)})$"];
  way({S},{W},{N},{E})["railway"="rail"];
  node({S},{W},{N},{E})["railway"="station"];
);
out geom;"""

    last = None
    for attempt in range(2):
        for mirror in MIRRORS:
            request = urllib.request.Request(
                mirror,
                data=urllib.parse.urlencode({"data": query}).encode(),
                # Overpass rejects requests without one.
                headers={"User-Agent": "transformationchurch.co.uk locator map build"},
            )
            try:
                with urllib.request.urlopen(request, timeout=180) as response:
                    return json.load(response)["elements"]
            except (urllib.error.URLError, TimeoutError) as error:
                print(f"  {mirror}: {error}")
                last = error
        if attempt == 0:
            time.sleep(20)

    raise SystemExit(f"every Overpass mirror failed, last error: {last}")


def project(lat, lon):
    """Equirectangular. Over two kilometres the error is far below a pixel."""
    x = (lon - W) / (E - W) * VIEW_W
    y = (N - lat) / (N - S) * VIEW_H
    return x, y


def simplify(points, epsilon=0.7):
    """Ramer-Douglas-Peucker. One view unit is about 2.2m on the ground, so
    dropping detail below a unit is invisible and roughly halves the file."""
    if len(points) < 3:
        return points

    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    span = math.hypot(dx, dy)

    worst, index = 0.0, 0
    for i, (x, y) in enumerate(points[1:-1], start=1):
        if span == 0:
            d = math.hypot(x - x1, y - y1)
        else:
            d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / span
        if d > worst:
            worst, index = d, i

    if worst <= epsilon:
        return [points[0], points[-1]]
    return simplify(points[: index + 1], epsilon)[:-1] + simplify(points[index:], epsilon)


def path_of(geometry):
    points = simplify([project(p["lat"], p["lon"]) for p in geometry])

    # Whole units: the map is 1000 units across for 2.2km of ground.
    kept = []
    for x, y in points:
        point = (round(x), round(y))
        if not kept or point != kept[-1]:
            kept.append(point)
    if len(kept) < 2:
        return None

    head, *tail = kept
    return f"M{head[0]} {head[1]}" + "".join(f"L{x} {y}" for x, y in tail)


def label_for(name, geometry):
    """Place a label at the midpoint of a way's visible run, angled to follow
    it. Measured along the whole polyline rather than per segment: OSM splits
    ways into many short pieces, so no single segment is long enough to sit a
    label on."""
    points = [project(p["lat"], p["lon"]) for p in geometry]
    inset = [
        (x, y)
        for x, y in points
        if 85 < x < VIEW_W - 85
        and 45 < y < VIEW_H - 45
        and all(
            math.hypot(x - z["x"], y - z["y"]) > z["r"] for z in KEEP_CLEAR
        )
    ]
    if len(inset) < 2:
        return None

    spans = [math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(inset, inset[1:])]
    total = sum(spans)
    if total < 55:
        return None

    travelled = 0.0
    for (x1, y1), (x2, y2), span in zip(inset, inset[1:], spans):
        if travelled + span >= total / 2:
            t = 0.5 if span == 0 else (total / 2 - travelled) / span
            x, y = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
            angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
            # Keep type the right way up.
            if angle > 90:
                angle -= 180
            elif angle < -90:
                angle += 180
            return {
                "name": name,
                "x": round(x, 1),
                "y": round(y, 1),
                "a": round(angle, 1),
                "len": round(total, 1),
            }
        travelled += span

    return None


def main():
    elements = fetch()
    roads = {"a": [], "b": [], "c": [], "d": []}
    rail = []
    labels = {}
    station = None

    for element in elements:
        tags = element.get("tags", {})

        if element["type"] == "node" and tags.get("railway") == "station":
            x, y = project(element["lat"], element["lon"])
            station = {
                "x": round(x, 1),
                "y": round(y, 1),
                "name": tags.get("name", "Station"),
            }
            continue

        geometry = element.get("geometry")
        if not geometry:
            continue

        if tags.get("railway") == "rail":
            if d := path_of(geometry):
                rail.append(d)
            continue

        klass = ROAD_CLASSES.get(tags.get("highway"))
        if not klass:
            continue
        if d := path_of(geometry):
            roads[klass].append(d)

        name = tags.get("name")
        if name and klass in LABEL_CLASSES:
            label = label_for(name, geometry)
            # One label per road: keep the one sitting on its longest run.
            if label and label["len"] > labels.get(name, {}).get("len", 0):
                labels[name] = label

    # Longest roads first, then drop anything crowding a label already placed.
    chosen = []
    for label in sorted(labels.values(), key=lambda l: -l["len"]):
        if len(chosen) == MAX_LABELS:
            break
        if all(
            math.hypot(label["x"] - c["x"], label["y"] - c["y"]) > LABEL_SPACING
            for c in chosen
        ):
            chosen.append(label)
    for label in chosen:
        del label["len"]

    church_x, church_y = (round(v, 1) for v in project(CHURCH_LAT, CHURCH_LON))

    OUT.write_text(
        json.dumps(
            {
                "viewBox": f"0 0 {VIEW_W} {VIEW_H}",
                "roads": roads,
                "rail": rail,
                "labels": chosen,
                "church": {"x": church_x, "y": church_y},
                "station": station,
            },
            separators=(",", ":"),
        ),
        encoding="utf-8",
        newline="\n",
    )

    counts = " ".join(f"{k}:{len(v)}" for k, v in roads.items())
    print(f"{OUT.name}  roads {counts}  rail:{len(rail)}  labels:{len(chosen)}")
    print(f"station: {station['name'] if station else 'none'}")
    print(f"size: {OUT.stat().st_size / 1024:.1f} kB")


if __name__ == "__main__":
    main()
