import { useEffect, useState } from 'react'
import { DIVISIONS, GROUP, divisionAnchor } from '../data/site'
import type { Division } from '../data/site'
import { prefersReducedMotion, useReveal } from '../lib/motion'
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
      {/* Wider than the standard lede measure: this sentence is one thought
          and the default 3xl broke it with "Delivery." alone on line two. */}
      <Lede className="max-w-5xl">{GROUP.lede}</Lede>

      {/*
        The same card as the order list further down the page.

        These were three bare columns separated by hairlines, on the reasoning
        that a border around each one turns a group into three unrelated
        products. That was a nice theory and the page disagreed: the order-list
        cards read better, and two different treatments for "a picture, a
        heading and a list" is just inconsistency with a rationale attached.
        One card, used twice.
      */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DIVISIONS.map((division, i) => (
          <article
            key={division.id}
            id={divisionAnchor(division.id)}
            className="reveal group/card flex scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-line/70 bg-raised/40 transition-colors duration-300 ease-micro hover:border-accent/45"
          >
            <DivisionMedia division={division} />

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <div className="flex items-baseline gap-4">
                <span className="text-[0.78rem] font-semibold text-accent tabular-nums">
                  0{i + 1}
                </span>
                <span className="tech-sm text-body">{division.kind}</span>
              </div>

              <h3 className="mt-2 font-display text-[1.15rem] leading-tight font-semibold text-heading">
                {division.company}
              </h3>
              <span aria-hidden className="mt-3 block h-px w-8 bg-accent/70" />

              <p className="mt-3 text-[0.85rem] leading-[1.6] text-body">{division.lede}</p>

              <ul className="mt-3 space-y-1.5">
                {division.offers.map((offer) => (
                  <li key={offer} className="text-[0.85rem] leading-snug text-body">
                    {offer}
                  </li>
                ))}
              </ul>

              {/* Only a company with a page of its own gets this, which today
                  is Balaji Prefab: the thirteen building types it puts up are
                  too many for a card and too useful to leave out. `mt-auto`
                  holds it to the foot of the card so the three link rows line
                  up however long a list above them runs. */}
              {division.more ? (
                <a
                  href={division.more.href}
                  className="mt-auto inline-flex items-center gap-2 pt-5 text-[0.82rem] font-medium text-accent transition-colors duration-200 ease-micro hover:text-accent-glow"
                >
                  {division.more.label}
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3 transition-transform duration-200 ease-micro group-hover/card:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              ) : null}
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

  if (division.gallery.length) {
    return <DivisionCarousel division={division} />
  }

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
      className="relative aspect-[2/1] w-full"
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


/**
 * Several photographs for one company, cross-faded, with the name of what is
 * in shot printed on the frame.
 *
 * Why a carousel and not a strip of five thumbnails: at card width a fifth of
 * the frame is 80px, which is not a photograph of anything. One frame at full
 * width, changing, shows each product as a product.
 *
 * It advances itself because nothing on a marketing card earns a tap, stops
 * while the pointer is on the card so a visitor reading a caption is not
 * interrupted, and does not move at all under prefers-reduced-motion — there
 * the first photograph simply stays, with the dots still able to change it.
 */
function DivisionCarousel({ division }: { division: Division }) {
  // A photograph the client has not supplied yet 404s, and a broken frame is
  // worse than one fewer frame. Anything that fails to load drops out, and if
  // every shot is missing the card falls back to whatever it showed before.
  const [missing, setMissing] = useState<string[]>([])
  const shots = division.gallery.filter((shot) => !missing.includes(shot.src))

  const [rawIndex, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const i = shots.length ? rawIndex % shots.length : 0

  useEffect(() => {
    if (paused || prefersReducedMotion() || shots.length < 2) return
    const t = window.setInterval(() => setI((n) => (n + 1) % shots.length), 4200)
    return () => window.clearInterval(t)
  }, [paused, shots.length])

  if (!shots.length) {
    return (
      <div className="relative aspect-[3/2] overflow-hidden bg-ground">
        {division.image ? (
          <img
            src={division.image}
            alt={division.imageAlt}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : null}
        {/* Keeps the failed sources out of the DOM but still lets a late
            upload appear on the next load. */}
      </div>
    )
  }

  return (
    <div
      // 3:2 rather than the 2:1 the drawings use: these are photographs of
      // products shot 4:3, and a 2:1 window cut a third out of every one of
      // them — the ceiling lost its grid, the panel lost its core.
      className="relative aspect-[3/2] overflow-hidden bg-ground"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {shots.map((shot, n) => (
        <img
          key={shot.src}
          src={shot.src}
          alt={shot.alt}
          loading="lazy"
          decoding="async"
          aria-hidden={n !== i}
          onError={() => setMissing((was) => (was.includes(shot.src) ? was : [...was, shot.src]))}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-micro ${
            n === i ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* The title sits on the photograph, so it is read WITH the thing it
          names. The scrim is only as tall as the words, and dark, because a
          pale one washes the picture out. */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-heading/85 via-heading/45 to-transparent px-4 pt-10 pb-3">
        <p className="tech-sm text-ground">{shots[i].title}</p>

        <div className="flex items-center gap-1.5">
          {shots.map((shot, n) => (
            <button
              key={shot.src}
              type="button"
              onClick={(e) => {
                // The card is a link-like block; picking a photograph is not
                // navigating to the division.
                e.preventDefault()
                e.stopPropagation()
                setI(n)
              }}
              aria-label={`Show ${shot.title}`}
              aria-current={n === i}
              className={`h-1.5 rounded-full transition-all duration-300 ease-micro ${
                n === i ? 'w-5 bg-ground' : 'w-1.5 bg-ground/55 hover:bg-ground/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
