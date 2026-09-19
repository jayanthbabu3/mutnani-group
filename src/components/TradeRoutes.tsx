import { useRef, useState } from 'react'
import type { Ref } from 'react'
import { ROUTES } from '../data/site'
import { prefersReducedMotion, useInView, useReveal } from '../lib/motion'
import ImportGlobeLazy from '../three/ImportGlobeLazy'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

/**
 * Mutnani IMEX Infra — what comes in, and what will go out.
 *
 * ── Why there is no list of places ────────────────────────────────────────
 * This section used to name the four Chinese cities the group buys from. The
 * client asked for that to come off: a sourcing list on a public site is a
 * map for competitors. So the picture says "from across the world" — a globe
 * with lines rising out of whole regions, none of them labelled — and the
 * words say what happens once the goods land, which is the part the group
 * actually wants to be hired for.
 *
 * The only places named are the group's own two desks, pinned on the globe.
 *
 * ── One control, two halves ───────────────────────────────────────────────
 * `mode` is the only state. It picks the direction the globe runs, the copy,
 * and whether the import steps or the "coming soon" note shows.
 */

type Mode = 'out' | 'in'

const ORIGIN = ROUTES.origin
const SECOND = ROUTES.second

/**
 * The two directions come from `content/site.json`, not from a constant here:
 * every line of it is a claim about how the business runs, and the client has
 * to be able to correct it.
 */
const MODES = ROUTES.modes

export default function TradeRoutes() {
  const reveal = useReveal<HTMLElement>({ stagger: 0.07 })
  const [mode, setMode] = useState<Mode>('in')
  const [stage, onScreen] = useInView<HTMLDivElement>('280px')
  const [still] = useState(prefersReducedMotion)
  const mumbai = useRef<HTMLDivElement>(null)
  const hyderabad = useRef<HTMLDivElement>(null)
  const india = useRef<HTMLDivElement>(null)
  const china = useRef<HTMLDivElement>(null)

  const current = MODES.find((m) => m.id === mode)!

  return (
    <Section id="trade" ref={reveal}>
      <Eyebrow>{ROUTES.eyebrow}</Eyebrow>
      <SectionTitle>{ROUTES.title}</SectionTitle>
      <Lede>{ROUTES.lede}</Lede>

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-12">
        {/* ── Left: the trade ────────────────────────────────────────────── */}
        <div className="reveal">
          {/*
            The switch is two cards, not two pills. It is the only control in
            the section and it changes everything on screen — the globe, the
            copy and the steps — so it should look like a decision, not like a
            chip on a filter bar.
          */}
          <div role="group" aria-label="Direction of trade" className="grid grid-cols-2 gap-3">
            {MODES.map((m) => {
              const on = mode === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMode(m.id)}
                  className={`rounded-lg border px-4 py-3.5 text-left transition-all duration-300 ease-snap ${
                    on
                      ? 'border-accent bg-accent/10'
                      : 'border-line hover:border-accent/50 hover:bg-raised/40'
                  }`}
                >
                  <span
                    className={`block text-[0.95rem] font-medium ${
                      on ? 'text-accent' : 'text-heading'
                    }`}
                  >
                    {m.label}
                  </span>
                  <span className="tech-sm mt-1.5 block text-body">{m.tag}</span>
                </button>
              )
            })}
          </div>

          <p className="mt-5 text-[0.9rem] leading-[1.7] text-body">{current.lede}</p>

          {mode === 'out' ? (
            <p className="mt-7 rounded-lg border border-dashed border-line px-5 py-6 text-[0.9rem] leading-[1.6] text-body">
              Nothing to list yet — the export desk is still being set up.
            </p>
          ) : (
            <ol className="mt-7 rounded-xl border border-line bg-raised/40 px-5 sm:px-6">
              {ROUTES.flow.map((step, i) => (
                <li
                  key={step.title}
                  className="flex gap-4 border-b border-line py-4 last:border-b-0 sm:gap-5"
                >
                  <span className="tech-sm pt-1 text-accent tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block text-[0.98rem] font-medium text-heading">
                      {step.title}
                    </span>
                    <span className="mt-1 block text-[0.85rem] leading-[1.6] text-body">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}

          <p className="mt-5 text-[0.8rem] leading-[1.6] text-body">
            {ROUTES.note.replace('{origin}', ORIGIN.name).replace('{second}', SECOND.name)}
          </p>
        </div>

        {/* ── Right: the globe ───────────────────────────────────────────── */}
        <div className="reveal">
          <div
            ref={stage}
            role="img"
            aria-label={`A globe turned between China and India, with trade lines from China and the rest of the world landing at ${SECOND.name} and running on to ${ORIGIN.name}.`}
            className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden"
          >
            {/* The globe's shadow on the page, so it sits rather than floats. */}
            <div
              aria-hidden
              className="absolute bottom-[3%] left-1/2 h-[5%] w-[52%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(13,33,54,0.16),rgba(13,33,54,0))]"
            />
            <ImportGlobeLazy
              mode={mode}
              active={onScreen}
              still={still}
              labels={{ mumbai, hyderabad, india, china }}
            />
            <CountryLabel ref={china} name="China" tone="bg-secondary" />
            <CountryLabel ref={india} name="India" tone="bg-accent" />
            <DeskLabel ref={mumbai} name={SECOND.name} sub="Clearing & freight" side="left" />
            <DeskLabel ref={hyderabad} name={ORIGIN.name} sub="Works" side="right" />
          </div>

          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="max-w-md text-[0.85rem] leading-snug text-body">{current.caption}</p>
            <span className="tech-sm shrink-0 text-body">{ORIGIN.sub}</span>
          </div>
        </div>
      </div>
    </Section>
  )
}

/**
 * A country's name, on the country itself — as a solid pill in that country's
 * colour. Plain text over the dots disappeared: blue on blue dots for India,
 * green on green for China. The pill is the one thing on the globe that is
 * a flat, full-strength colour, so the two names are the first thing read.
 */
function CountryLabel({ ref, name, tone }: { ref: Ref<HTMLDivElement>; name: string; tone: string }) {
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute top-0 left-0 opacity-0">
      <span
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-[0.72rem] font-bold tracking-[0.22em] text-white uppercase shadow-[0_2px_10px_rgba(13,33,54,0.28)] ring-2 ring-white sm:px-3.5 sm:py-1.5 sm:text-[0.82rem] ${tone}`}
      >
        {name}
      </span>
    </div>
  )
}

/**
 * A desk's name, pinned to its city by the globe's frame loop. It starts
 * hidden and only shows once the scene has placed it, so it never sits in the
 * corner before the globe loads.
 */
function DeskLabel({
  ref,
  name,
  sub,
  side,
}: {
  ref: Ref<HTMLDivElement>
  name: string
  sub: string
  side: 'left' | 'right'
}) {
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 opacity-0"
    >
      {/*
        Pushed out on a leader line, down and away from the city: Mumbai and
        Hyderabad are close together and India is the subject, so neither
        label may sit on it. Mumbai goes out over the Arabian Sea, Hyderabad
        down over the Bay of Bengal.
      */}
      <span
        className={`absolute top-0 h-px w-6 origin-left sm:w-9 bg-heading/40 ${
          side === 'left' ? 'right-0 origin-right rotate-[-24deg]' : 'left-0 rotate-[38deg]'
        }`}
      />
      <div
        className={`absolute whitespace-nowrap rounded-md border border-line bg-ground/90 px-2.5 py-1.5 shadow-sm backdrop-blur-sm ${
          side === 'left' ? 'right-5 bottom-1 text-right sm:right-8' : 'top-3 left-5 sm:top-4 sm:left-7'
        }`}
      >
        <span className="block text-[0.8rem] leading-none font-medium text-heading">{name}</span>
        {/* The role only where there is room; on a phone the name alone fits. */}
        <span className="tech-sm mt-1 hidden text-[0.6rem] text-body sm:block">{sub}</span>
      </div>
    </div>
  )
}
