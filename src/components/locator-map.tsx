import map from "@/content/locator-map.json";
import { site } from "@/lib/site";

/**
 * The map on /visit, drawn from real OpenStreetMap geometry.
 *
 * This replaced a live Google Maps iframe. That iframe put a third party and
 * its cookies on the page a first-time visitor is most likely to open, and it
 * dropped Google's own styling — red pin, blue business pins, green parks —
 * into the middle of a navy and paper layout.
 *
 * The geometry is fetched once by scripts/build-locator-map.py and committed,
 * so this costs one inline SVG and no network calls. Roads are weighted by
 * class so the trunk routes read first, which is what someone driving here
 * actually needs.
 *
 * Licence: OpenStreetMap data is ODbL, which requires attribution. The credit
 * under the map satisfies that — do not remove it.
 */

/** 1000 view units span 2200m, so this is a true 500m bar. */
const SCALE_BAR = (500 / 2200) * 1000;

export function LocatorMap({ className = "" }: { className?: string }) {
  const { viewBox, roads, rail, labels, church, station } = map;

  return (
    <figure className={className}>
      <div className="relative aspect-[4/3] overflow-hidden border border-rule bg-paper-bright">
        <svg
          viewBox={viewBox}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Map of the streets around ${site.name}, ${site.address.line1}, ${site.address.town}. Rowley Regis railway station is a short walk to the east.`}
        >
          {/* Roads, lightest class first so the trunk routes sit on top. */}
          <g fill="none" stroke="var(--color-ink)" strokeLinecap="round" strokeLinejoin="round">
            <g strokeWidth="1.6" opacity="0.2">
              {roads.d.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            <g strokeWidth="2.4" opacity="0.3">
              {roads.c.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            <g strokeWidth="4" opacity="0.42">
              {roads.b.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            <g strokeWidth="6.5" opacity="0.55">
              {roads.a.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>

            {/* Rail reads as rail: a dashed line rather than another road. */}
            <g strokeWidth="2.2" opacity="0.45" strokeDasharray="9 7">
              {rail.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </g>

          {/* Street names, set along the road they belong to. */}
          <g
            fill="var(--color-ink-muted)"
            fontSize="19"
            fontFamily="var(--font-sans)"
            textAnchor="middle"
          >
            {labels.map((l) => (
              <text
                key={l.name}
                transform={`translate(${l.x} ${l.y}) rotate(${l.a})`}
                dy="-7"
                // A halo, so names stay readable where they cross the mesh.
                stroke="var(--color-paper-bright)"
                strokeWidth="5"
                paintOrder="stroke"
              >
                {l.name}
              </text>
            ))}
          </g>

          {station && (
            <g>
              <circle cx={station.x} cy={station.y} r="7" fill="var(--color-ink)" />
              <text
                x={station.x}
                y={station.y}
                dy="30"
                textAnchor="middle"
                fontSize="20"
                fontFamily="var(--font-sans)"
                fill="var(--color-ink)"
                stroke="var(--color-paper-bright)"
                strokeWidth="5"
                paintOrder="stroke"
              >
                {station.name} station
              </text>
            </g>
          )}

          {/* The church. The only accent on the map, so the eye lands here. */}
          <g>
            <circle
              cx={church.x}
              cy={church.y}
              r="24"
              fill="var(--color-accent)"
              opacity="0.16"
            />
            <circle
              cx={church.x}
              cy={church.y}
              r="11"
              fill="var(--color-accent)"
              stroke="var(--color-paper-bright)"
              strokeWidth="3.5"
            />
            <text
              x={church.x}
              y={church.y}
              dy="-38"
              textAnchor="middle"
              fontSize="23"
              fontFamily="var(--font-sans)"
              fontWeight="500"
              fill="var(--color-ink)"
              stroke="var(--color-paper-bright)"
              strokeWidth="5.5"
              paintOrder="stroke"
            >
              {site.name}
            </text>
          </g>

          {/* Scale bar: the quiet detail that says this is a real map. */}
          <g
            stroke="var(--color-ink)"
            fill="var(--color-ink-muted)"
            opacity="0.75"
            strokeWidth="2"
          >
            <path d={`M40 710h${SCALE_BAR}M40 704v12M${40 + SCALE_BAR} 704v12`} />
            <text
              x={40 + SCALE_BAR / 2}
              y="694"
              textAnchor="middle"
              fontSize="18"
              fontFamily="var(--font-sans)"
              stroke="var(--color-paper-bright)"
              strokeWidth="5"
              paintOrder="stroke"
            >
              500m
            </text>
          </g>
        </svg>
      </div>

      {/* ODbL attribution. Required by the data licence. */}
      <figcaption className="label mt-3 text-2xs text-ink-muted">
        Map data{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="link-underline"
        >
          &copy; OpenStreetMap contributors
        </a>
      </figcaption>
    </figure>
  );
}
