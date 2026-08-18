import { DIVISIONS, GROUP, divisionAnchor } from '../data/site'
import type { Division } from '../data/site'
import { useReveal } from '../lib/motion'
import { DIVISION_ART } from './divisionArt'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

/**
 * The three companies.
 *
 * Deliberately NOT three rounded cards with a stock photo each — that is what
 * the consultancy's attempt did, and it is what every group-holding-company
 * site does, so it reads as a template before anyone gets to the words.
 * Instead: three numbered columns divided by hairlines, set like a printed
 * prospectus. The structure of the group is the content, so the layout is the
 * structure of the group.
 *
 * Each column opens with a MEDIA block, because three columns of prose with
 * nothing to look at is a wall of text however well it is set. What goes in it:
 *
 *   · the client's own photograph, if `image` is set in content/site.json
 *   · otherwise a technical drawing of what that division makes
 *     (components/divisionArt.tsx)
 *
 * The drawing is the default and it is a finished treatment, not a grey box
 * waiting for an asset — it can state "42 m clear span" or "40–100 mm core",
 * which no photograph can. Generic warehouse stock is explicitly not an option
 * here; it is the exact move that made the consultancy's version read as
 * unfinished.
 */
export default function Divisions() {
  const ref = useReveal<HTMLElement>({ stagger: 0.09 })

  return (
    <Section id="divisions" ref={ref}>
      {/*
        Header stacked, left-aligned — the house setting.

        It was briefly two columns, title left and lede right, purely to save
        height. It fitted and it read badly: the lede stopped looking like the
        title's own sentence and became a second, unrelated block of text.
        Stacking costs about 56px, which is bought back below rather than by
        breaking the reading order.

        The height that DOES come free is in the lede's measure. It was capped at
        `max-w-xl` inside a narrow column and ran to four lines; the section is
        full-width here, so `max-w-3xl` sets the same sentence in two. Same
        words, same size, half the height, and a better line length.
      */}
      <Eyebrow>{GROUP.eyebrow}</Eyebrow>
      <SectionTitle>{GROUP.title}</SectionTitle>
      <Lede>{GROUP.lede}</Lede>

      {/*
        The same card as the order list further down the page.

        These were three bare columns separated by hairlines, on the reasoning
        that a border around each one turns a group into three unrelated
        products. That was a nice theory and the page disagreed: the order-list
        cards read better, and two different treatments for "a picture, a
        heading and a list" is just inconsistency with a rationale attached.
        One card, used twice.
      */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DIVISIONS.map((division, i) => (
          <article
            key={division.id}
            id={divisionAnchor(division.id)}
            className="reveal group/card scroll-mt-24 overflow-hidden rounded-2xl border border-line/70 bg-raised/40 transition-colors duration-300 ease-micro hover:border-accent/45"
          >
            <DivisionMedia division={division} />

            <div className="p-6 pt-5 sm:p-7 sm:pt-6">
              <div className="flex items-baseline gap-4">
                <span className="text-[0.78rem] font-semibold text-accent tabular-nums">
                  0{i + 1}
                </span>
                <span className="tech-sm text-body/70">{division.kind}</span>
              </div>

              <h3 className="display-opsz mt-3 font-display text-[1.25rem] leading-tight font-normal text-heading">
                {division.company}
              </h3>
              <span aria-hidden className="mt-4 block h-px w-8 bg-accent/70" />

              <p className="mt-5 text-[0.88rem] leading-[1.65] text-body">{division.lede}</p>

              <ul className="mt-5 space-y-2.5">
                {division.offers.map((offer) => (
                  <li key={offer} className="text-[0.88rem] leading-snug text-body">
                    {offer}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

/**
 * The media block at the top of each column.
 *
 * No border and no radius, matching the hero: the drawing sits ON the page over
 * a barely-there wash rather than inside a card, so the three columns stay one
 * editorial spread instead of becoming three tiles.
 *
 * A photograph, when there is one, does get a radius — a photo needs an edge to
 * be a photo, whereas a line drawing on the page ground needs the opposite.
 */
function DivisionMedia({ division }: { division: Division }) {
  const Art = DIVISION_ART[division.id]

  if (division.image) {
    return (
      <div className="relative aspect-[3/2] overflow-hidden bg-ground">
        <img
          src={division.image}
          alt={division.imageAlt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-700 ease-micro group-hover/card:scale-[1.04]"
        />
        {/* A ramp from the card's own ground into the picture, so the image
            does not end on a hard line above the heading. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-raised to-transparent"
        />
      </div>
    )
  }

  // A division with no art registered would silently render nothing, which is
  // worse than an obvious gap — so fail loudly in development instead.
  if (!Art) {
    if (import.meta.env.DEV) throw new Error(`No art registered for division "${division.id}"`)
    return null
  }

  return (
    <div
      className="relative aspect-[3/2] w-full"
      // Decorative here: every fact the drawing states is also in the prose
      // beside it, so a screen reader announcing it twice is noise. The `role`
      // and `aria-label` inside each art component cover the case where it is
      // ever used on its own.
      aria-hidden
    >
      {/* The wash. A radial rather than a flat fill so the drawing has somewhere
          to sit without the block reading as a panel. */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background:
            'radial-gradient(72% 68% at 50% 46%, color-mix(in oklab, var(--color-raised) 85%, transparent), transparent 78%)',
        }}
      />
      <Art className="relative size-full" />
    </div>
  )
}
