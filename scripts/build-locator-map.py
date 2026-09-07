"""
Build the /visit locator map from OpenStreetMap.

The page used to embed a live Google Maps iframe. That pulled a third party and
its cookies onto the page a first-time visitor is most likely to open, and it
dropped Google's own styling into the middle of a navy and paper layout.

This fetches the real road and rail geometry once and writes two framings of it:

  wide   2.2km across, for the desktop column
  close  1.1km across and square, for phones

A phone gets roughly 350 CSS pixels of map. Showing it the same 2.2km means
every street name renders at about eight pixels, so the narrow frame zooms in
rather than shrinking the type: fewer streets, each one legible, and still
everything needed to find the door.

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

# Drawn heaviest last, so the trunk roads sit on top of the residential mesh.
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

FRAMES = {
    # Size on the ground, then the SVG coordinate space.
    "wide": {
        "ground": (2200, 1650),
        "view": (1000, 750),
        "labels": 10,
        # Labels are placed greedily, longest road first; anything landing
        # closer than this to one already placed is dropped. Without it they
        # pile up in whichever corner has the most named roads.
        "spacing": 140,
        "affordance": False,
        # Type scale LocatorMap draws this frame at. Everything the script
        # needs to reserve space for is sized from it.
        "scale": 1,
    },
    "close": {
        "ground": (1100, 1100),
        "view": (800, 800),
        # Fewer, because each is drawn much larger relative to the frame.
        "labels": 7,
        "spacing": 170,
        # The "Google Maps" pill is always visible on touch, where there is no
        # hover to reveal it, so street labels have to route around it. On the
        # wide frame it only appears on hover, so it reserves nothing.
        "affordance": True,
        # Drawn at 1.6x, so half as much ground fits the same legible type.
        "scale": 1.6,
    },
}


def bbox(lat, lon, width_m, height_m):
    dlat = (height_m / 2) / 111_132
    dlon = (width_m / 2) / (111_320 * math.cos(math.radians(lat)))
    return lat - dlat, lon - dlon, lat + dlat, lon + dlon


# The widest frame decides what to ask Overpass for. The close frame is a
# subset of it, so one request serves both.
FETCH_S, FETCH_W, FETCH_N, FETCH_E = bbox(
    CHURCH_LAT, CHURCH_LON, *FRAMES["wide"]["ground"]
)

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
  way({FETCH_S},{FETCH_W},{FETCH_N},{FETCH_E})["highway"~"^({'|'.join(ROAD_CLASSES)})$"];
  way({FETCH_S},{FETCH_W},{FETCH_N},{FETCH_E})["railway"="rail"];
  node({FETCH_S},{FETCH_W},{FETCH_N},{FETCH_E})["railway"="station"];
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


def simplify(points, epsilon):
    """Ramer-Douglas-Peucker. Detail finer than a view unit is invisible, and
    dropping it roughly halves the file."""
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


# Only used to reserve space for the church label, which LocatorMap draws from
# site.name. Length is all that matters here.
CHURCH_LABEL = "Transformation Church"

# Average advance width per character, as a fraction of the type size. Rough,
# but erring wide only ever costs a label.
CHAR_WIDTH = 0.28


def text_box(text, size, cx, cy):
    """The rectangle a centred label occupies."""
    half_w = len(text) * size * CHAR_WIDTH
    half_h = size * 0.8
    return (cx - half_w, cy - half_h, cx + half_w, cy + half_h)


def overlaps(a, b):
    return a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]


class Frame:
    """One framing of the same geometry."""

    def __init__(self, name, spec):
        self.name = name
        self.view_w, self.view_h = spec["view"]
        self.max_labels = spec["labels"]
        self.spacing = spec["spacing"]
        self.scale = spec["scale"]
        self.affordance = spec["affordance"]
        self.label_size = 19 * self.scale
        self.s, self.w, self.n, self.e = bbox(CHURCH_LAT, CHURCH_LON, *spec["ground"])

        # Rectangles street labels must not touch. Everything drawn on top of
        # the road mesh carries a paper halo, so an overlap does not merely
        # crowd a street name, it erases the part underneath.
        cx, cy = self.view_w / 2, self.view_h / 2
        k = self.scale
        self.keep_clear = [
            # The church marker and its label.
            (cx - 24 * k, cy - 24 * k, cx + 24 * k, cy + 24 * k),
            text_box(CHURCH_LABEL, 23 * k, cx, cy - 38 * k),
        ]

    def project(self, lat, lon):
        """Equirectangular. Over two kilometres the error is far below a pixel."""
        return (
            (lon - self.w) / (self.e - self.w) * self.view_w,
            (self.n - lat) / (self.n - self.s) * self.view_h,
        )

    def reserve_station(self, station):
        """The station label is the widest thing on the map after the church,
        so its footprint has to be known before street labels are placed."""
        k = self.scale
        x, y = station["x"], station["y"]
        self.keep_clear.append((x - 7 * k, y - 7 * k, x + 7 * k, y + 7 * k))
        self.keep_clear.append(
            text_box(f"{station['name']} station", 20 * k, x, y + 30 * k)
        )

    def reserve_affordance(self):
        """Top-right corner. The pill has a solid background rather than a
        halo, so anything under it is hidden outright, and street labels are
        already kept off the top edge — so reserving here costs almost nothing,
        where the bottom-right corner cost three of five labels."""
        self.keep_clear.append(
            (self.view_w * 0.46, 0, self.view_w, self.view_h * 0.15)
        )

    def reserve_scale_bar(self, units):
        k = self.scale
        x, y = self.view_w * 0.05, self.view_h * 0.945
        self.keep_clear.append((x, y - 30 * k, x + units, y + 10 * k))

    def on_frame(self, points, margin=40):
        return any(
            -margin < x < self.view_w + margin and -margin < y < self.view_h + margin
            for x, y in points
        )

    def path_of(self, geometry):
        raw = [self.project(p["lat"], p["lon"]) for p in geometry]
        # Ways entirely outside this framing would just be file size.
        if not self.on_frame(raw):
            return None

        kept = []
        for x, y in simplify(raw, 0.7):
            point = (round(x), round(y))
            if not kept or point != kept[-1]:
                kept.append(point)
        if len(kept) < 2:
            return None

        head, *tail = kept
        return f"M{head[0]} {head[1]}" + "".join(f"L{x} {y}" for x, y in tail)

    def label_for(self, name, geometry):
        """Place a label at the midpoint of a way's visible run, angled to
        follow it. Measured along the whole polyline rather than per segment:
        OSM splits ways into many short pieces, so no single segment is long
        enough to sit a label on."""
        edge_x = self.view_w * 0.09
        edge_y = self.view_h * 0.06
        inset = [
            (x, y)
            for x, y in (self.project(p["lat"], p["lon"]) for p in geometry)
            if edge_x < x < self.view_w - edge_x and edge_y < y < self.view_h - edge_y
        ]
        if len(inset) < 2:
            return None

        spans = [math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(inset, inset[1:])]
        total = sum(spans)
        if total < self.view_w * 0.06:
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
                # The label is centred here and rotated with the road, so
                # half the name extends each way along that angle. Checking
                # the anchor alone let long names hang off the frame and run
                # under the station label.
                half = len(name) * self.label_size * CHAR_WIDTH
                reach_x = abs(half * math.cos(math.radians(angle)))
                reach_y = abs(half * math.sin(math.radians(angle)))
                top = y - 7 * self.scale
                box = (
                    x - reach_x,
                    top - max(reach_y, self.label_size * 0.8),
                    x + reach_x,
                    top + max(reach_y, self.label_size * 0.8),
                )

                pad = self.label_size * 0.5
                if box[0] < pad or box[2] > self.view_w - pad:
                    return None
                if box[1] < pad or box[3] > self.view_h - pad:
                    return None
                if any(overlaps(box, zone) for zone in self.keep_clear):
                    return None

                return {
                    "name": name,
                    "x": round(x, 1),
                    "y": round(y, 1),
                    "a": round(angle, 1),
                    "len": round(total, 1),
                }
            travelled += span

        return None

    def build(self, elements):
        roads = {"a": [], "b": [], "c": [], "d": []}
        rail = []
        labels = {}

        across = (self.e - self.w) * 111_320 * math.cos(math.radians(CHURCH_LAT))
        # The largest round distance that stays under a third of the frame.
        metres = next(m for m in (1000, 500, 250, 200, 100) if m / across < 0.34)
        units = round(metres / across * self.view_w, 1)
        self.reserve_scale_bar(units)
        if self.affordance:
            self.reserve_affordance()

        # Both markers have to be reserved before any street label is placed.
        station = None
        for element in elements:
            tags = element.get("tags", {})
            if element["type"] == "node" and tags.get("railway") == "station":
                x, y = self.project(element["lat"], element["lon"])
                if self.on_frame([(x, y)], margin=20):
                    station = {
                        "x": round(x, 1),
                        "y": round(y, 1),
                        "name": tags.get("name", "Station"),
                    }
                    self.reserve_station(station)
                break

        for element in elements:
            tags = element.get("tags", {})
            if element["type"] == "node":
                continue

            geometry = element.get("geometry")
            if not geometry:
                continue

            if tags.get("railway") == "rail":
                if d := self.path_of(geometry):
                    rail.append(d)
                continue

            klass = ROAD_CLASSES.get(tags.get("highway"))
            if not klass:
                continue
            if d := self.path_of(geometry):
                roads[klass].append(d)

            name = tags.get("name")
            if name and klass in LABEL_CLASSES:
                label = self.label_for(name, geometry)
                # One label per road: keep the one on its longest run.
                if label and label["len"] > labels.get(name, {}).get("len", 0):
                    labels[name] = label

        # Longest roads first, then drop anything crowding a label already placed.
        chosen = []
        for label in sorted(labels.values(), key=lambda l: -l["len"]):
            if len(chosen) == self.max_labels:
                break
            if all(
                math.hypot(label["x"] - c["x"], label["y"] - c["y"]) > self.spacing
                for c in chosen
            ):
                chosen.append(label)
        for label in chosen:
            del label["len"]

        return {
            "viewBox": f"0 0 {self.view_w} {self.view_h}",
            "roads": roads,
            "rail": rail,
            "labels": chosen,
            "church": {"x": round(self.view_w / 2, 1), "y": round(self.view_h / 2, 1)},
            "station": station,
            "scale": {"metres": metres, "units": units},
        }


def main():
    elements = fetch()
    output = {name: Frame(name, spec).build(elements) for name, spec in FRAMES.items()}

    OUT.write_text(
        json.dumps(output, separators=(",", ":")), encoding="utf-8", newline="\n"
    )

    for name, frame in output.items():
        counts = " ".join(f"{k}:{len(v)}" for k, v in frame["roads"].items())
        station = frame["station"]["name"] if frame["station"] else "off frame"
        print(
            f"{name:6} roads {counts}  rail:{len(frame['rail'])}  "
            f"labels:{len(frame['labels'])}  scale:{frame['scale']['metres']}m  "
            f"station:{station}"
        )
        print(f"       {', '.join(l['name'] for l in frame['labels'])}")
    print(f"size: {OUT.stat().st_size / 1024:.1f} kB")


if __name__ == "__main__":
    main()
