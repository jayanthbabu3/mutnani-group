import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

/**
 * The building's dimensions and the scene's colours, in one place.
 *
 * Colours are MIRRORED from src/index.css — three.js cannot read a Tailwind
 * token, so this is the one sanctioned duplication in the project. If the
 * palette is ever repainted, this file changes with it or the 3D stops
 * matching the page.
 *
 *   STEEL      cool structural steel, read against a daylight sky
 *   PANEL      off-white cladding — the group's buildings really are white
 *   ACCENT     --color-accent              (#0054a8) — the brand blue, on the
 *                                          roof sheet and the signage
 *   INK        --color-heading             (#0d2136) — type on the sign
 *   GROUND     --color-ground              (#ffffff)
 *
 * One thing that does NOT mirror the page: every metal here is close to
 * dielectric. There is no environment map in this project, so a high
 * `metalness` has nothing to reflect and resolves toward black — which passed
 * for moody steel against navy and came back as charcoal sticks against a
 * daylight sky.
 */
export const COLOR = {
  ground: '#ffffff',
  slab: '#ccd5df',
  slabEdge: '#aab7c6',

  /* Structural steel. Darker than it was: on the navy page a pale steel was
     the lightest thing in frame, and on a white one the same value vanishes
     into the sky. These read as galvanised section against daylight. */
  steel: '#8496ad',
  steelDark: '#61758f',

  /* Cladding. Barely off-white — the group's buildings really are white, and
     the separation from the page comes from the sky behind and the shading
     across the faces, not from tinting the panel into a grey it is not. */
  panel: '#f4f7fb',
  panelEdge: '#ccd8e6',

  /* Roof sheet, in the brand blue. Lifted a step off `accent` so the shaded
     slope still has somewhere to go before it reads black. */
  roof: '#1163bd',
  roofDark: '#0b4e9b',

  accent: '#0054a8',
  accentDim: '#003c90',
  /** Mirrors --color-heading. The sign sets type on a white plate now, so the
      scene needs the page's ink as well as its accent. */
  ink: '#0d2136',

  /* ── The yard ──────────────────────────────────────────────────────────
     Tints of the page, as before, so the yard recedes and the building stays
     the subject — but now they descend from white instead of climbing out of
     navy, and they have to stay clearly separated from each other or the
     lower half of the frame goes back to being one flat smear. */
  yard: '#e7ecf2',
  drive: '#dae1ea',
  kerb: '#c3ccd8',

  /* ── Things that give it scale ──────────────────────────────────────────
     A 8.5 m eave means nothing until there is a 1.75 m person beside it. */
  skin: '#b08d72',
  clothes: '#40587f',
  clothesAlt: '#2f4466',
  /* Hi-vis, and the one place the logo's lime belongs in the model: it is
     literally a high-visibility colour, it is 2.21:1 so it can never be asked
     to carry text, and a crew in lime vests is what that half of the mark is
     FOR here rather than decoration. */
  hiVis: '#84c000',
} as const

/**
 * One bay is one column pair plus the rafter between them. Everything else is
 * derived, so changing the bay count or the span rebuilds the whole shed
 * without any other number needing to move.
 */
export const BUILDING = {
  /**
   * Number of frames along the length. 4 frames = 3 bays.
   *
   * Deliberately short. A real warehouse is far longer, but at the aspect ratio
   * of the hero stage a long shed becomes a thin band on the horizon and the
   * structure — which is the whole point — stops being legible. Three bays is
   * the fewest that still reads as repeating frames rather than as one portal.
   */
  frames: 4,
  /** Metres between frames — real PEB spacing, so the proportions read true. */
  bay: 6,
  /** Clear span across, eave to eave. */
  span: 15,
  /** Eave height. Tall relative to the span, so the columns read as columns. */
  eave: 8.5,
  /** Extra height at the ridge, giving the roof its pitch. */
  rise: 2.8,
  /** Purlins per roof slope. */
  purlinsPerSlope: 5,
  /** Wall panel width — 1 m modules, as they are actually made. */
  panelWidth: 1,
  /**
   * Roller shutter on the front gable — 5 m × 5 m, which takes a lorry.
   *
   * The width is FIVE panel modules exactly, and the wicket is one, because the
   * cladding is cut by whole modules. Pick 4.4 m instead and the opening lands
   * mid-panel, leaving a 300 mm sliver of wall either side of the door frame
   * that looks like a modelling mistake. If either width changes, keep it a
   * whole multiple of `panelWidth` and keep the centre on a module centre.
   */
  doorWidth: 5,
  doorHeight: 5,
  /** Personnel door beside it — and the reason the shed reads as occupied. */
  wicketWidth: 1,
  wicketHeight: 2.1,
  /** Module centre, so the wicket also cuts exactly one panel. */
  wicketX: -4,
} as const

export const derived = {
  get length() {
    return (BUILDING.frames - 1) * BUILDING.bay
  },
  get half() {
    return BUILDING.span / 2
  },
  get ridge() {
    return BUILDING.eave + BUILDING.rise
  },
  /** Slope length from eave to ridge, for laying purlins and sheets on it. */
  get slope() {
    return Math.hypot(BUILDING.span / 2, BUILDING.rise)
  },
  /** Roof pitch in radians — the rotation every rafter, purlin and sheet uses. */
  get pitch() {
    return Math.atan2(BUILDING.rise, BUILDING.span / 2)
  },
}

/** A person is 1.75 m. Every other figure in the yard is sized off this. */
export const PERSON_HEIGHT = 1.75

/** Frame centres along the length, centred on the origin. */
export const frameZ = Array.from(
  { length: BUILDING.frames },
  (_, i) => i * BUILDING.bay - derived.length / 2,
)

/**
 * The six stages, as normalised windows on a 0..1 timeline. The hero's caption
 * strip and the geometry read the SAME array, so a caption can never describe
 * a stage the model is not currently building.
 */
export const PHASES = [
  { id: 'slab', from: 0.0, to: 0.14 },
  { id: 'columns', from: 0.12, to: 0.34 },
  { id: 'rafters', from: 0.32, to: 0.52 },
  { id: 'purlins', from: 0.5, to: 0.66 },
  { id: 'walls', from: 0.62, to: 0.84 },
  { id: 'roof', from: 0.8, to: 1.0 },
] as const

/** 0 before the window, 1 after it, eased in between. */
export function phaseProgress(t: number, index: number) {
  const phase = PHASES[index]
  if (!phase) return 0
  const raw = (t - phase.from) / (phase.to - phase.from)
  const clamped = Math.min(1, Math.max(0, raw))
  // expo.out — the same curve as --ease-entrance, so the 3D and the DOM
  // reveals move in one hand.
  return clamped === 1 ? 1 : 1 - Math.pow(2, -10 * clamped)
}

/** Which phase index the playhead is inside, for the caption strip. */
export function activePhase(t: number) {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (t >= PHASES[i].from) return i
  }
  return 0
}

/**
 * The playhead.
 *
 * It lives here rather than in BuildScene.tsx on purpose: the hero needs it to
 * label the caption strip, and importing anything out of BuildScene would pull
 * three.js into the main bundle and undo the lazy 3D chunk entirely. Nothing in
 * this file touches three.
 *
 * A ref, not state — this number changes sixty times a second, and a setState
 * at that rate would re-render the hero and the Canvas with it.
 *
 * Reduced motion pins it at 1: the finished building, held still. Not a blank
 * canvas, and not a frame frozen half-erected.
 */
export function useBuildTimeline(seq: number, active: boolean) {
  const progress = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      progress.current = 1
      return
    }
    if (!active) return

    const state = { t: progress.current }

    const tween = gsap.to(state, {
      t: 1,
      duration: 11,
      ease: 'none',
      onUpdate: () => {
        progress.current = state.t
      },
      // Rewinds and runs again, holding the finished building for a beat
      // between runs — the thing being sold should be what is on screen most
      // of the time, not a construction site.
      repeat: -1,
      repeatDelay: 4.5,
      onRepeat: () => {
        state.t = 0
      },
    })

    return () => {
      tween.kill()
    }
  }, [seq, active])

  return progress
}
