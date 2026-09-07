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
 * Two framings, because a phone gets about 350 CSS pixels of map against the
 * desktop column's 700. Shrinking the wide frame to fit put every street name
 * at roughly eight pixels, so narrow screens get their own tighter frame
 * instead: half the ground covered, half as many streets, all of them legible.
 * Only one is ever rendered — the other is display:none, so it is out of the
 * accessibility tree too and nothing is announced twice.
 *
 * Licence: OpenStreetMap data is ODbL, which requires attribution. The credit
 * under the map satisfies that — do not remove it.
 */

type Frame = typeof map.wide;

/**
 * `scale` converts view units to roughly consistent screen pixels across the
 * two framings, so type and stroke weights land the same size in the browser
 * whichever frame is showing.
 */
function Plan({ frame, scale }: { frame: Frame; scale: number }) {
  const { roads, rail, labels, church, station, viewBox } = frame;
  const [, , width, height] = viewBox.split(" ").map(Number);

  const s = (value: number) => value * scale;

  // Halo behind every label, so names stay readable over the road mesh.
  const halo = {
    stroke: "var(--color-paper-bright)",
    strokeWidth: s(5),
    paintOrder: "stroke" as const,
  };

  return (
    <svg
      viewBox={viewBox}
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label={`Map of the streets around ${site.name}, ${site.address.line1}, ${site.address.town}. Rowley Regis railway station is a short walk to the east.`}
    >
      {/* Roads, lightest class first so the trunk routes sit on top. */}
      <g
        fill="none"
        stroke="var(--color-ink)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g strokeWidth={s(1.6)} opacity="0.2">
          {roads.d.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g strokeWidth={s(2.4)} opacity="0.3">
          {roads.c.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g strokeWidth={s(4)} opacity="0.42">
          {roads.b.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g strokeWidth={s(6.5)} opacity="0.55">
          {roads.a.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>

        {/* Rail reads as rail: a dashed line rather than another road. */}
        <g
          strokeWidth={s(2.2)}
          opacity="0.45"
          strokeDasharray={`${s(9)} ${s(7)}`}
        >
          {rail.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </g>

      {/* Street names, set along the road they belong to. */}
      <g
        fill="var(--color-ink-muted)"
        fontSize={s(19)}
        fontFamily="var(--font-sans)"
        textAnchor="middle"
      >
        {labels.map((l) => (
          <text
            key={l.name}
            transform={`translate(${l.x} ${l.y}) rotate(${l.a})`}
            dy={s(-7)}
            {...halo}
          >
            {l.name}
          </text>
        ))}
      </g>

      {station && (
        <g>
          <circle cx={station.x} cy={station.y} r={s(7)} fill="var(--color-ink)" />
          <text
            x={station.x}
            y={station.y}
            dy={s(30)}
            textAnchor="middle"
            fontSize={s(20)}
            fontFamily="var(--font-sans)"
            fill="var(--color-ink)"
            {...halo}
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
          r={s(24)}
          fill="var(--color-accent)"
          opacity="0.16"
        />
        <circle
          cx={church.x}
          cy={church.y}
          r={s(11)}
          fill="var(--color-accent)"
          stroke="var(--color-paper-bright)"
          strokeWidth={s(3.5)}
        />
        <text
          x={church.x}
          y={church.y}
          dy={s(-38)}
          textAnchor="middle"
          fontSize={s(23)}
          fontFamily="var(--font-sans)"
          fontWeight="500"
          fill="var(--color-ink)"
          {...halo}
          strokeWidth={s(5.5)}
        >
          {site.name}
        </text>
      </g>

      {/* Scale bar: the quiet detail that says this is a real map. */}
      {(() => {
        const x = width * 0.05;
        const y = height * 0.945;
        return (
          <g
            stroke="var(--color-ink)"
            fill="var(--color-ink-muted)"
            opacity="0.75"
            strokeWidth={s(2)}
          >
            <path
              d={`M${x} ${y}h${frame.scale.units}M${x} ${y - s(6)}v${s(12)}M${
                x + frame.scale.units
              } ${y - s(6)}v${s(12)}`}
            />
            <text
              x={x + frame.scale.units / 2}
              y={y - s(16)}
              textAnchor="middle"
              fontSize={s(18)}
              fontFamily="var(--font-sans)"
              {...halo}
            >
              {frame.scale.metres}m
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

export function LocatorMap({ className = "" }: { className?: string }) {
  return (
    <figure className={className}>
      {/* Square and closer in, for the ~350px a phone gives it. */}
      <div className="relative aspect-square overflow-hidden border border-rule bg-paper-bright md:hidden">
        <Plan frame={map.close} scale={1.6} />
      </div>

      <div className="relative hidden aspect-[4/3] overflow-hidden border border-rule bg-paper-bright md:block">
        <Plan frame={map.wide} scale={1} />
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
