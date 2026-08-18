import { useEffect, useRef, useState } from 'react'
import BuildSceneLazy from '../three/BuildSceneLazy'
// From layout, NOT from BuildScene: BuildScene imports three, and importing
// anything out of it here would pull the whole 3D bundle back into the main
// chunk and undo BuildSceneLazy.
import { activePhase, useBuildTimeline } from '../three/layout'
import { HERO, SITE, STAGES } from '../data/site'
import { prefersReducedMotion, useCountUp, useEntrance, useInView } from '../lib/motion'
import { CtaLink, Shell } from './ui'

/**
 * Split hero: the promise on the left, the building erecting itself on the
 * right. The caption under the stage names the stage currently being built, so
 * the animation is legible as a process rather than admired as an effect —
 * which is the difference between a hero that sells prefab and one that just
 * moves.
 */
export default function Hero() {
  const ref = useEntrance<HTMLElement>()
  // Observer-backed state, not a polled ref: the Canvas's `frameloop` is a
  // prop, so React has to re-render for it to change. See useInView.
  const [stageRef, active] = useInView<HTMLDivElement>('220px')
  const [seq] = useState(0)

  const progress = useBuildTimeline(seq, active)
  const phase = usePhaseLabel(progress, active)

  const { line1, line2 } = HERO.headline

  return (
    <header
      ref={ref}
      id="top"
      className="relative isolate overflow-hidden pt-28 pb-16 lg:flex lg:min-h-[100svh] lg:items-center lg:pt-24 lg:pb-10"
    >
      <div aria-hidden className="accent-glow-field absolute inset-0 -z-10" />

      <Shell>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-14">
          {/* ── Copy ──────────────────────────────────────────────────── */}
          <div>
            <p data-entrance className="tech flex items-center gap-3 text-accent/85">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              {HERO.eyebrow}
            </p>

            {/*
              No italic on the stressed line: the accent colour already carries
              that emphasis, and a high-contrast display italic at display size
              reads as an invitation rather than as steel.

              The clamp is measured, not chosen. Both slogan lines cost 8.07em
              in Fraunces 300 at -0.02em tracking, and the tightest budget on
              the page is NOT the 360px phone (9.25em) — it is 1280px, where the
              two-column split has already happened but the type is near full
              size (9.49em). `4.4vw` and the 3.6rem cap are what keep every
              breakpoint above the cost with ~13% to spare. Re-measure both
              lines before changing either the copy or these numbers.

              Two block spans, not a `{line1} {line2}` run: the colour change
              marks the second CLAUSE, so it has to start a line. Left inline,
              the accent picks up in the middle of line one and the device stops
              reading. SplitText treats each block as its own line, so the mask
              sweep still works per clause.
            */}
            <h1
              data-entrance="lines"
              className="display-opsz mt-6 font-display text-[clamp(2.05rem,4.4vw,3.6rem)] leading-[1.06] font-light tracking-[-0.02em] text-heading"
            >
              <span className="block">{line1}</span>
              <span className="block text-accent">{line2}</span>
            </h1>

            <p
              data-entrance="rise"
              className="mt-6 max-w-xl text-[0.98rem] leading-[1.75] text-body"
            >
              {HERO.sub}
            </p>

            <div data-entrance="rise" className="mt-9 flex flex-wrap items-center gap-3">
              <CtaLink href="#contact">{HERO.primaryCta}</CtaLink>
              <CtaLink href="#build" variant="ghost">
                {HERO.secondaryCta}
              </CtaLink>
            </div>

            <dl
              data-entrance="rise"
              data-entrance-at="+=0.15"
              className="mt-11 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-7"
            >
              {HERO.stats.map((s) => (
                <Stat key={s.label} {...s} />
              ))}
            </dl>

            <p data-entrance className="tech-sm mt-8 text-body/65">
              {SITE.basedLine}
            </p>
          </div>

          {/* ── Stage ─────────────────────────────────────────────────── */}
          <div data-entrance data-entrance-at="+=0.3" className="lg:pl-4">
            {/* No grid, no border, no radius — see `.stage-bleed` in index.css.
                A graph-paper grid behind a rendered building read as leftover
                scaffolding, and a bordered card around a sky read as a bright
                box on a dark page. The horizon lives inside the scene now
                (three/skyTexture.ts) and the canvas is masked so it dissolves
                into the page instead of stopping at a line.

                `bg-ground` matches both the page and the sky's zenith, so it is
                seamless in the split second before the canvas paints and behind
                the no-WebGL still frame. */}
            <div
              ref={stageRef}
              className="stage-bleed relative aspect-[4/3] w-full bg-ground sm:aspect-[16/11]"
            >
              <BuildSceneLazy progress={progress} seq={seq} active={active} />
              {/* The one affordance the stage needs. It is a turntable now
                  (see Rig in three/BuildScene.tsx), and nothing about a
                  rendered building says "grab me" — this does. */}
              <p
                aria-hidden
                className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-2 rounded-full border border-line/60 bg-ground/60 px-3 py-1.5 tech-sm text-heading/70 backdrop-blur-sm motion-reduce:hidden"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    d="M3 12h18M6 8l-3 4 3 4M18 8l3 4-3 4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Drag to rotate
              </p>
            </div>

            {/* The caption strip. Six dots, the live one filled, and the name
                of what is going up right now. */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="tech-sm text-accent">
                  {String(phase + 1).padStart(2, '0')} · {STAGES[phase].label}
                </p>
                <p className="mt-1.5 text-[0.82rem] leading-snug text-body">{STAGES[phase].note}</p>
              </div>
              <ol className="flex shrink-0 items-center gap-1.5" aria-hidden>
                {STAGES.map((stage, i) => (
                  <li
                    key={stage.id}
                    className={`h-px transition-all duration-500 ease-micro ${
                      i <= phase ? 'w-6 bg-accent' : 'w-3 bg-line'
                    }`}
                  />
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Shell>
    </header>
  )
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useCountUp(value)
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      {/* Numbers in the sans: Fraunces has old-style figures, and "1000" set
          in it reads as a run of ascenders and descenders. */}
      <dd className="text-[1.7rem] leading-none font-semibold text-heading tabular-nums sm:text-[2.1rem]">
        <span ref={ref} />
        <span className="font-light text-accent">{suffix}</span>
      </dd>
      <p className="tech-sm mt-2.5 text-body/70">{label}</p>
    </div>
  )
}

/**
 * The caption's phase index.
 *
 * Polls the playhead on rAF but only calls setState when the phase actually
 * changes — six re-renders across an eleven-second build, rather than sixty a
 * second. The alternative, lifting the whole playhead into state, would
 * re-render the hero and the Canvas on every frame.
 */
function usePhaseLabel(progress: { current: number }, active: boolean) {
  const [phase, setPhase] = useState(prefersReducedMotion() ? STAGES.length - 1 : 0)
  const last = useRef(phase)

  useEffect(() => {
    if (prefersReducedMotion() || !active) return

    let raf = 0
    const tick = () => {
      const next = activePhase(progress.current)
      if (next !== last.current) {
        last.current = next
        setPhase(next)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress, active])

  return phase
}
