import { useMemo, useState } from 'react'
import { ROUTES } from '../data/site'
import { useReveal } from '../lib/motion'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

const MASK = [
  'radial-gradient(82% 86% at 50% 50%, #000 58%, rgba(0,0,0,0.85) 80%, transparent 100%)',
  'linear-gradient(to right, transparent 0%, #000 3%, #000 97%, transparent 100%)',
  'linear-gradient(to bottom, transparent 0%, #000 7%, #000 93%, transparent 100%)',
].join(', ')

/**
 * Balaji Prefab Import & Exports — what actually leaves and what arrives.
 *
 * This section took four goes, and the first three failed the same way. A fan
 * of labelled lanes, then a real world map, then a dial of bearings and
 * distances: every one of them drew WHERE the goods go. None of them drew the
 * trade. A list of countries is not a business — the business is that a
 * finished panel gets on a lorry and a coil of steel comes off one.
 *
 * So the two halves swap jobs. The words carry the destinations, because a
 * destination is a name and names belong in type. The picture carries the
 * movement, because movement is the one thing type cannot do: the shutter
 * lifts, a flatbed loaded with panels runs for the port, and switching to
 * imports reverses the whole yard — a truck comes in off the quay with a coil
 * and takes it inside.
 *
 * ── One control, two halves ───────────────────────────────────────────────
 * `mode` is the only state here. It picks the direction the yard runs, the
 * cargo on the bed, the copy and which markets are listed. There is no
 * separate "filter" any more: choosing to look at exports IS the filter, which
 * is one idea where there used to be two.
 *
 * Markets marked `both` would appear under each mode. None do today: the group
 * imports from four cities in China and its export desk is not open yet, so
 * the export side shows that plainly rather than an empty table.
 */

type Mode = 'out' | 'in'

const MARKETS = ROUTES.markets
const ORIGIN = ROUTES.origin

/**
 * The two directions come from `content/site.json`, not from a constant here.
 *
 * They were hardcoded in this file, which made four pieces of client-facing
 * copy — two ledes, two captions — unreachable from the CMS. Every one of them
 * asserts something about how the business runs, and the client has to be able
 * to correct anything they would not say themselves.
 */
const MODES = ROUTES.modes

const countFor = (mode: Mode) => MARKETS.filter((m) => m.dir === mode || m.dir === 'both').length

/** "Coming soon" when a direction has no markets, never "0 countries". */
const countLabel = (mode: Mode) => {
  const n = countFor(mode)
  return n === 0 ? 'Coming soon' : `${n} ${n === 1 ? 'city' : 'cities'}`
}

export default function TradeRoutes() {
  const reveal = useReveal<HTMLElement>({ stagger: 0.07 })
  const [mode, setMode] = useState<Mode>('in')

  /*
    Grouped by COUNTRY, and the country is said once. A table repeated "China"
    on every row and gave the region a column of its own, so four facts took
    twelve cells. One heading per country with its cities under it says the
    same thing in five words, and still scales if a second country is added.
  */
  const groups = useMemo(() => {
    const wanted = MARKETS.filter((m) => m.dir === mode || m.dir === 'both')
    const out: { country: string; items: typeof wanted }[] = []
    for (const m of wanted) {
      const open = out.find((g) => g.country === m.country)
      if (open) open.items.push(m)
      else out.push({ country: m.country, items: [m] })
    }
    return out
  }, [mode])

  const current = MODES.find((m) => m.id === mode)!

  return (
    <Section id="trade" ref={reveal}>
      <Eyebrow>{ROUTES.eyebrow}</Eyebrow>
      <SectionTitle>{ROUTES.title}</SectionTitle>
      <Lede>{ROUTES.lede}</Lede>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-12">
        {/* ── Left: the trade ────────────────────────────────────────────── */}
        <div className="reveal">
          {/*
            The switch is two cards, not two pills. It is the only control in
            the section and it changes everything on screen — the yard, the copy
            and the list — so it should look like a decision, not like a chip on
            a filter bar.
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
                  <span className="tech-sm mt-1.5 block text-body">{countLabel(m.id)}</span>
                </button>
              )
            })}
          </div>

          <p className="mt-5 text-[0.9rem] leading-[1.7] text-body">{current.lede}</p>

          {groups.length === 0 ? (
            <p className="mt-7 rounded-lg border border-dashed border-line px-5 py-6 text-[0.9rem] leading-[1.6] text-body">
              Nothing to list yet — the export desk is still being set up.
            </p>
          ) : (
            groups.map((g) => (
              <div
                key={g.country}
                className="mt-7 rounded-xl border border-line bg-raised/40 p-5 sm:p-6"
              >
                <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
                  <p className="display-opsz font-display text-[1.4rem] leading-none text-heading">
                    {g.country}
                  </p>
                  <p className="tech-sm text-body">
                    {g.items.length} sourcing {g.items.length === 1 ? 'city' : 'cities'}
                  </p>
                </div>
                <ul className="mt-4 grid grid-cols-2 gap-2.5">
                  {g.items.map((m, i) => (
                    <li
                      key={m.id}
                      className="flex items-baseline gap-3 rounded-lg border border-line bg-ground px-4 py-3"
                    >
                      <span className="tech-sm text-accent tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[0.95rem] text-heading">{m.city}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}

          <p className="mt-5 text-[0.8rem] leading-[1.6] text-body">
            {ROUTES.note.replace('{origin}', ORIGIN.name).replace('{second}', ROUTES.second.name)}
          </p>
        </div>

        {/* ── Right: the yard ────────────────────────────────────────────── */}
        <div className="reveal lg:sticky lg:top-24">
          {/*
            One picture for both directions — the same container ship used on
            the Global Trade division card, so the trade vertical looks the same
            wherever it appears. Switching import/export changes the words and
            the list, not the photograph.
          */}
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9] lg:aspect-[3/2]">
            <img
              src="/divisions/trade.webp"
              alt="A loaded container ship under way at sea at sunset."
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
              style={{
                WebkitMaskImage: MASK,
                maskImage: MASK,
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect',
              }}
            />
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
