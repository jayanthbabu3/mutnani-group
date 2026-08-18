import { Fragment, useMemo, useState } from 'react'
import TradeYardSceneLazy from '../three/TradeYardSceneLazy'
import { ROUTES } from '../data/site'
import { useInView, useReveal } from '../lib/motion'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

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
 * Markets marked `both` appear under each mode, because they genuinely go both
 * ways — Singapore takes panels and sends back machinery.
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

export default function TradeRoutes() {
  const reveal = useReveal<HTMLElement>({ stagger: 0.07 })
  const [stage, onScreen] = useInView<HTMLDivElement>('280px')
  const [mode, setMode] = useState<Mode>('out')

  /*
    Grouped by region so the list reads as coverage rather than as fourteen
    unrelated rows — "the Gulf, four ports" is a claim; four country names in a
    column is data. Regions keep the order they appear in the content.
  */
  const groups = useMemo(() => {
    const wanted = MARKETS.filter((m) => m.dir === mode || m.dir === 'both')
    const out: { region: string; items: typeof wanted }[] = []
    for (const m of wanted) {
      const open = out.find((g) => g.region === m.region)
      if (open) open.items.push(m)
      else out.push({ region: m.region, items: [m] })
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
                  <span className="tech-sm mt-1.5 block text-body/60">
                    {countFor(m.id)} countries
                  </span>
                </button>
              )
            })}
          </div>

          <p className="mt-5 text-[0.9rem] leading-[1.7] text-body">{current.lede}</p>

          {/*
            A table, because this is tabular data and every other shape wasted
            the column. It was region headings over a two-up list whose rows
            used `justify-between`, which opens a river of empty space between
            each country and its port — the wider the column, the worse it got,
            and three region headings added their own padding on top.

            Columns instead: the region reads once per group, the ports line up
            under each other, and nothing stretches to fill.
          */}
          <table className="mt-7 w-full border-collapse text-left">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="tech-sm hidden pb-2.5 font-normal text-body/40 sm:table-cell"
                >
                  Region
                </th>
                <th scope="col" className="tech-sm pb-2.5 font-normal text-body/40">
                  Country
                </th>
                <th scope="col" className="tech-sm pb-2.5 font-normal text-body/40">
                  Port
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) =>
                g.items.map((m, i) => (
                  <Fragment key={m.id}>
                    {/* Below `sm` the region column is dropped — three columns
                        do not fit a 360px phone — so the region comes back as
                        its own row above each group. */}
                    {i === 0 && (
                      <tr className="sm:hidden">
                        <th
                          scope="colgroup"
                          colSpan={2}
                          className="tech-sm border-t border-line/40 pt-4 pb-1 text-left font-normal text-accent/80"
                        >
                          {g.region}
                        </th>
                      </tr>
                    )}
                    <tr className={i === 0 ? 'sm:border-t sm:border-line/40' : ''}>
                      <td className="tech-sm hidden py-2 align-baseline text-accent/80 sm:table-cell">
                        {i === 0 ? g.region : ''}
                      </td>
                      <td className="py-2 pr-4 align-baseline text-[0.9rem] text-heading">
                        {m.country}
                      </td>
                      <td className="tech-sm py-2 align-baseline text-body/45">{m.city}</td>
                    </tr>
                  </Fragment>
                )),
              )}
            </tbody>
          </table>

          <p className="mt-5 text-[0.8rem] leading-[1.6] text-body/70">
            {ROUTES.note.replace('{origin}', ORIGIN.name).replace('{second}', ROUTES.second.name)}
          </p>
        </div>

        {/* ── Right: the yard ────────────────────────────────────────────── */}
        <div className="reveal lg:sticky lg:top-24">
          {/*
            Landscape at every width: the yard is a road with the works at one
            end and a ship at the other. The camera derives its distance from
            the stage's own aspect ratio, so a narrower stage pulls back rather
            than cropping the shed off the left.
          */}
          <div
            ref={stage}
            className="stage-bleed relative aspect-[16/10] w-full bg-ground sm:aspect-[16/9] lg:aspect-[3/2]"
          >
            <TradeYardSceneLazy mode={mode} active={onScreen} />
          </div>

          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="max-w-md text-[0.85rem] leading-snug text-body">{current.caption}</p>
            <span className="tech-sm shrink-0 text-body/45">{ORIGIN.sub}</span>
          </div>
        </div>
      </div>
    </Section>
  )
}
