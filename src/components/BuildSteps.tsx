import { useEffect, useRef, useState } from 'react'
import { BUILD } from '../data/site'
import { prefersReducedMotion, useInView, useReveal } from '../lib/motion'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

/**
 * How a building goes up — one step at a time, not six stacked paragraphs.
 *
 * This was a vertical timeline: six items down the page, each with its own
 * heading and paragraph, running to about three screens. Everything was
 * readable and nobody read it, because six equal paragraphs is a wall.
 *
 * It now follows the pattern from the sibling Rise-infra build: a rail of
 * NAMED steps across the full width, and one detail panel below showing the
 * selected step — a photograph of what it looks like, the paragraph, and the
 * two figures a buyer is actually asking for. It autoplays, so the sequence
 * still reads as a sequence to somebody who never clicks; a click or the pause
 * button stops it.
 *
 * The point the section exists to make — that steps 02 and 03 overlap — is
 * carried by the rail itself: the two parallel steps are bracketed and marked,
 * so the overlap is visible before a word is read.
 */

const STEPS = BUILD.steps
const PARALLEL = 'runs in parallel'

export default function BuildSteps() {
  const reveal = useReveal<HTMLElement>({ stagger: 0.06 })
  const [active, setActive] = useState(0)
  // Autoplay is off from the start under reduced motion — a panel that changes
  // itself every few seconds is exactly what that setting is asking us not to do.
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [swiped, setSwiped] = useState(false)
  const rail = useRef<HTMLDivElement>(null)
  const [visRef, visible] = useInView<HTMLDivElement>('80px')

  const step = STEPS[active]
  const isParallel = step.days === PARALLEL

  // Only advances while the section is actually on screen; a carousel playing
  // to nobody is wasted work and a wasted battery.
  useEffect(() => {
    if (!playing || !visible) return
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 3600)
    return () => clearInterval(t)
  }, [playing, visible])

  // The rail follows the autoplay. Scrolls the CONTAINER, never the page —
  // scrollIntoView here would drag the whole document around under the reader.
  useEffect(() => {
    const el = rail.current
    const chip = el?.children[active] as HTMLElement | undefined
    if (!el || !chip || el.scrollWidth <= el.clientWidth) return
    el.scrollTo({
      left: chip.offsetLeft - el.clientWidth / 2 + chip.clientWidth / 2,
      behavior: 'smooth',
    })
  }, [active])

  const pick = (i: number) => {
    setActive(i)
    setPlaying(false)
  }

  return (
    <Section id="build" ref={reveal}>
      <Eyebrow>{BUILD.eyebrow}</Eyebrow>
      <SectionTitle>{BUILD.title}</SectionTitle>
      <Lede>{BUILD.lede}</Lede>

      {/* The autoplay control sits next to what it controls and says which
          state it is in — a bare pause glyph makes the visitor guess. */}
      <div ref={visRef} className="mt-7 flex items-center justify-between gap-4">
        <span className="tech-sm text-body/55">
          {playing ? 'Playing through the steps' : 'Paused — pick any step'}
        </span>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause the step autoplay' : 'Play through the steps'}
          aria-pressed={playing}
          className="tap-44 grid size-9 place-items-center rounded-full border border-line text-heading/80 transition-colors duration-200 ease-micro hover:border-accent/50 hover:text-accent"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
              <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* ── The rail ──────────────────────────────────────────────────────
          One swipeable row on phones, six columns from lg. A 2×3 grid of cards
          on a phone would push the detail panel — the thing worth reading — a
          full screen down. */}
      <div className="relative mt-3">
        <div
          ref={rail}
          role="tablist"
          aria-label="Build steps"
          onScroll={() => !swiped && setSwiped(true)}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {STEPS.map((s, i) => {
            const isActive = i === active
            const isDone = i < active
            const par = s.days === PARALLEL
            return (
              <button
                key={s.n}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => pick(i)}
                className={`group w-32 shrink-0 snap-start rounded-xl border p-3 text-left transition-colors duration-200 ease-micro lg:w-auto lg:shrink ${
                  isActive
                    ? 'border-accent bg-accent/[0.07]'
                    : 'border-line/70 bg-raised/40 hover:border-accent/40'
                }`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span
                    className={`text-[0.68rem] font-semibold tabular-nums ${
                      isActive || isDone ? 'text-accent' : 'text-body/45'
                    }`}
                  >
                    {s.n}
                  </span>
                  {/* The parallel pair is marked on the rail, not just in the
                      panel — it is the one thing this section exists to say. */}
                  <span className={`tech-sm ${par ? 'text-accent/80' : 'text-body/50'}`}>
                    {par ? '∥' : s.days.replace(' days', 'd').replace(' weeks', 'w')}
                  </span>
                </span>

                <span
                  className={`mt-1.5 block text-[0.82rem] leading-tight font-medium ${
                    isActive ? 'text-heading' : 'text-heading/80'
                  }`}
                >
                  {s.short}
                </span>

                <span className="mt-2.5 block h-[3px] w-full overflow-hidden rounded-full bg-line/60">
                  <span
                    className={`block h-full rounded-full transition-all duration-500 ease-micro ${
                      isActive || isDone ? 'bg-accent' : 'bg-line'
                    }`}
                    style={{ width: isActive || isDone ? '100%' : '0%' }}
                  />
                </span>
              </button>
            )
          })}
        </div>

        {/* The visual "…" of the rail. A hard edge reads as finished. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-ground to-transparent lg:hidden"
        />
      </div>

      <p
        aria-hidden
        className={`tech-sm mt-1 flex items-center gap-2 text-body/60 transition-opacity duration-300 ease-micro lg:hidden ${
          swiped ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        Swipe for all {STEPS.length} steps
        <svg
          viewBox="0 0 24 24"
          className="size-3.5 animate-pulse"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <path d="M4 12h15m0 0-5-5m5 5-5 5" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </p>

      {/* ── The selected step ─────────────────────────────────────────────
          The photograph is pinned to 3:2 rather than stretching with the
          column: these are shot 3:2, and letting a wide screen stretch the box
          crops the subject out of the top and bottom. */}
      <div className="reveal mt-4 grid gap-6 overflow-hidden rounded-2xl border border-line/70 bg-raised/40 p-6 sm:p-7 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)_auto] lg:items-center">
        <div className="relative -m-6 mb-0 aspect-[3/2] overflow-hidden sm:-m-7 sm:mb-0 lg:m-0 lg:w-full lg:rounded-xl">
          <img
            // Keyed on the step so React swaps the element rather than mutating
            // src on one node, which leaves the previous photo on screen for a
            // frame while the next decodes.
            key={step.n}
            src={step.image}
            alt={step.imageAlt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        </div>

        <div className="min-w-0">
          <p className="tech-sm text-accent/80">
            Step {step.n} of {String(STEPS.length).padStart(2, '0')}
          </p>
          <h3 className="display-opsz mt-2 font-display text-[1.35rem] leading-tight font-normal text-heading sm:text-[1.55rem]">
            {step.title}
          </h3>
          <p className="mt-3 max-w-2xl text-[0.92rem] leading-[1.7] text-body">{step.body}</p>
        </div>

        <dl className="grid grid-cols-2 gap-4 self-center border-t border-line/70 pt-5 lg:grid-cols-1 lg:gap-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
          <div>
            <dt className="tech-sm text-body/50">On the programme</dt>
            <dd className="mt-1 text-[1rem] font-semibold text-heading">
              {isParallel ? 'Runs in parallel' : step.days}
            </dd>
          </div>
          <div>
            <dt className="tech-sm text-body/50">Where it happens</dt>
            <dd className="mt-1 text-[1rem] font-semibold text-accent">{step.where}</dd>
          </div>
        </dl>
      </div>

      <p className="reveal tech-sm mt-4 text-body/55">
        Steps 02 and 03 overlap — the building is being made while your foundation cures. That is
        where the weeks come from.
      </p>
    </Section>
  )
}
