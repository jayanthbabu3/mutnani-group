/**
 * One drawing per division.
 *
 * These are NOT decoration and they are not stock photography. Each one is a
 * technical drawing of the thing that division actually sells, in the same hand
 * as the PUF panel section: hairlines, one accent stroke, a dimension where a
 * dimension is the point. Three reasons it is drawn rather than photographed:
 *
 *   · the client's real project photography is not handed over yet, and generic
 *     warehouse stock is precisely what made the previous attempt read as
 *     unfinished
 *   · a drawing can say "42 m clear span" or "40–100 mm core"; a photo cannot
 *   · it costs nothing to load and repaints with the palette
 *
 * When the real photos arrive they replace these — set `image` on the division
 * in content/site.json and the drawing steps aside. See Divisions.tsx.
 *
 * Everything is stroked in token colours. `vector-effect: non-scaling-stroke`
 * keeps hairlines at 1px however the column is sized, which is the whole reason
 * these read as drawings and not as thick cartoon outlines on a phone.
 */

const LINE = 'var(--color-line)'
const BODY = 'var(--color-body)'
const ACCENT = 'var(--color-accent)'
const HEADING = 'var(--color-heading)'

type ArtProps = { className?: string }

const frame = {
  viewBox: '0 0 400 300',
  fill: 'none',
  vectorEffect: 'non-scaling-stroke' as const,
}

/**
 * 01 · Prefabricated construction — a portal frame in elevation.
 *
 * The clear span dimension is the drawing's whole argument: no column in the
 * middle. That is the one fact a buyer of an industrial shed cares about, and
 * it is the fact the hero animation spends six seconds making.
 */
export function PrefabArt({ className = '' }: ArtProps) {
  return (
    <svg
      viewBox={frame.viewBox}
      className={className}
      fill="none"
      role="img"
      aria-label="Elevation of a pre-engineered portal frame, clear span with no internal column."
    >
      {/* Ground */}
      <line x1="20" y1="238" x2="380" y2="238" stroke={LINE} strokeWidth="1" />
      {/* Foundations */}
      {[62, 338].map((x) => (
        <rect key={x} x={x - 13} y="232" width="26" height="7" fill={LINE} opacity="0.55" />
      ))}

      {/* Tapered columns — deeper at the eave, where the moment is. */}
      <path d="M55 232 L55 108 L69 104 L69 232 Z" stroke={HEADING} strokeWidth="1.4" />
      <path d="M331 232 L331 108 L345 104 L345 232 Z" stroke={HEADING} strokeWidth="1.4" />

      {/* Rafters to the ridge. The accent is on the ridge line only. */}
      <path d="M52 106 L200 58 L348 106" stroke={ACCENT} strokeWidth="1.6" />
      <path d="M66 112 L200 68 L334 112" stroke={HEADING} strokeWidth="1.2" />

      {/* Purlins on the slope */}
      {[0.22, 0.44, 0.66, 0.88].map((t) => {
        const lx = 52 + (200 - 52) * t
        const ly = 106 - (106 - 58) * t
        const rx = 348 - (348 - 200) * t
        const ry = 106 - (106 - 58) * t
        return (
          <g key={t} stroke={BODY} strokeWidth="1" opacity="0.75">
            <circle cx={lx} cy={ly - 3} r="2" fill={BODY} stroke="none" />
            <circle cx={rx} cy={ry - 3} r="2" fill={BODY} stroke="none" />
          </g>
        )
      })}

      {/* Knee braces — the detail that says this is engineered, not drawn. */}
      <path d="M69 128 L104 116" stroke={BODY} strokeWidth="1" />
      <path d="M331 128 L296 116" stroke={BODY} strokeWidth="1" />

      {/* Clear-span dimension */}
      <g stroke={ACCENT} strokeWidth="1">
        <line x1="55" y1="262" x2="345" y2="262" />
        <line x1="55" y1="254" x2="55" y2="270" />
        <line x1="345" y1="254" x2="345" y2="270" />
      </g>
      <text
        x="200"
        y="284"
        textAnchor="middle"
        fill={ACCENT}
        fontSize="15"
        fontWeight="600"
        letterSpacing="1"
      >
        UP TO 42 M CLEAR
      </text>
    </svg>
  )
}

/**
 * 02 · Manufacturing — the two things the line makes, in section.
 *
 * Above: the trapezoidal roofing profile, which is the shape of the sheet.
 * Below: the sandwich panel, hatched core between two skins, with the thickness
 * range on it. Both are what Balaji Roofing rolls, and neither is legible in a
 * photograph of a stack of panels.
 */
export function RoofingArt({ className = '' }: ArtProps) {
  /** One trapezoid: up the rib, across the crown, down, along the valley. */
  const rib = (x: number) => `L${x + 8} 74 L${x + 26} 74 L${x + 34} 104 L${x + 56} 104`
  const profile = [0, 56, 112, 168, 224, 280].map((x) => rib(x + 30)).join(' ')

  return (
    <svg
      viewBox={frame.viewBox}
      className={className}
      fill="none"
      role="img"
      aria-label="Section through a trapezoidal roofing sheet above a PUF sandwich panel."
    >
      {/* Trapezoidal sheet profile */}
      <path d={`M30 104 ${profile}`} stroke={HEADING} strokeWidth="1.5" />
      <text x="30" y="46" fill={BODY} fontSize="12" letterSpacing="2.4">
        TRAPEZOIDAL SHEET
      </text>

      {/* Sandwich panel, in section */}
      <g>
        <rect x="30" y="168" width="340" height="7" fill={HEADING} opacity="0.9" />
        <rect x="30" y="175" width="340" height="46" stroke={LINE} strokeWidth="1" />
        <rect x="30" y="221" width="340" height="7" fill={HEADING} opacity="0.7" />
        {/* Core hatching */}
        {Array.from({ length: 22 }, (_, i) => (
          <line
            key={i}
            x1={34 + i * 16}
            y1="221"
            x2={34 + i * 16 + 18}
            y2="175"
            stroke={ACCENT}
            strokeWidth="0.9"
            opacity="0.3"
          />
        ))}
        {/* Tongue and groove, so it reads as a panel that joins to another */}
        <path d="M370 168 h18 v14 h-9 v16 h9 v14 h-18" stroke={LINE} strokeWidth="1.1" />
      </g>

      {/* Thickness dimension */}
      <g stroke={ACCENT} strokeWidth="1">
        <line x1="18" y1="168" x2="18" y2="228" />
        <line x1="12" y1="168" x2="24" y2="168" />
        <line x1="12" y1="228" x2="24" y2="228" />
      </g>
      <text x="30" y="258" fill={ACCENT} fontSize="15" fontWeight="600" letterSpacing="1">
        40 – 100 MM CORE
      </text>
      <text x="30" y="278" fill={BODY} fontSize="12" letterSpacing="2.4">
        CUT TO LENGTH
      </text>
    </svg>
  )
}

/**
 * 03 · Global trade — a container, and the two directions it moves in.
 *
 * The lanes repeat the gesture the Trade section makes further down the page:
 * inbound in the accent, outbound in the body tint. Same idea drawn twice on
 * purpose — this is the summary, that one is the detail.
 */
export function TradeArt({ className = '' }: ArtProps) {
  return (
    <svg
      viewBox={frame.viewBox}
      className={className}
      fill="none"
      role="img"
      aria-label="A shipping container with inbound and outbound lanes."
    >
      {/* Container body */}
      <rect x="64" y="96" width="272" height="112" stroke={HEADING} strokeWidth="1.5" />
      {/* Corrugations */}
      {Array.from({ length: 16 }, (_, i) => (
        <line
          key={i}
          x1={80 + i * 16}
          y1="102"
          x2={80 + i * 16}
          y2="202"
          stroke={LINE}
          strokeWidth="1"
          opacity="0.8"
        />
      ))}
      {/* Door end, with its locking bars */}
      <rect x="286" y="96" width="50" height="112" stroke={HEADING} strokeWidth="1.2" />
      {[298, 310, 322].map((x) => (
        <line key={x} x1={x} y1="104" x2={x} y2="200" stroke={BODY} strokeWidth="1.2" />
      ))}
      {/* Corner castings */}
      {[
        [64, 96],
        [336, 96],
        [64, 208],
        [336, 208],
      ].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x - 6}
          y={y - 6}
          width="12"
          height="12"
          fill={LINE}
          opacity="0.7"
        />
      ))}

      {/* Inbound / outbound lanes */}
      <g strokeWidth="1.6" strokeLinecap="round">
        <line x1="26" y1="56" x2="304" y2="56" stroke={ACCENT} strokeDasharray="8 6" />
        <path d="M298 50 l8 6 -8 6" stroke={ACCENT} />
        <line x1="374" y1="250" x2="96" y2="250" stroke={BODY} strokeDasharray="8 6" />
        <path d="M102 244 l-8 6 8 6" stroke={BODY} />
      </g>
      <text x="26" y="40" fill={ACCENT} fontSize="12" letterSpacing="2.4">
        INBOUND · COIL, CORE, MACHINERY
      </text>
      <text x="374" y="278" textAnchor="end" fill={BODY} fontSize="12" letterSpacing="2.4">
        OUTBOUND · PANEL, SHEET, STRUCTURE
      </text>
    </svg>
  )
}

/** Keyed by the division's id in content/site.json. */
export const DIVISION_ART: Record<string, (props: ArtProps) => React.ReactElement> = {
  prefab: PrefabArt,
  roofing: RoofingArt,
  trade: TradeArt,
}
