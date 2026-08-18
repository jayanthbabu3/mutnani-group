import { PRODUCTS } from '../data/site'
import { useReveal } from '../lib/motion'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

/**
 * The order list.
 *
 * jkprefab puts thirteen of these in a dropdown, where nobody reads them and
 * Google indexes them as thirteen thin pages. They belong on the page, grouped,
 * so a visitor can scan for their own word — "cold room", "mezzanine" — and
 * find it in one screen.
 *
 * ── Why each card carries a photograph ────────────────────────────────────
 * It was four columns of plain text, and it read as a price list. The words
 * are the point — someone is scanning for "mezzanine flooring" — but a wall of
 * twenty-four line items gives the eye nothing to land on and no sense of what
 * any of it looks like when it is built. One image per card fixes both: it
 * says what the group is at a glance, and it breaks the four columns into four
 * things.
 *
 * The photograph is a HEADER, not a hero — a 3:2 band above the list, not a
 * background behind it. Text over photography at this size would need a scrim,
 * and a scrim over a dusk photograph in a dusk palette is mud.
 */
export default function Products() {
  const ref = useReveal<HTMLElement>({ stagger: 0.06 })

  return (
    <Section id="products" ref={ref}>
      <Eyebrow>{PRODUCTS.eyebrow}</Eyebrow>
      <SectionTitle>{PRODUCTS.title}</SectionTitle>
      <Lede>{PRODUCTS.lede}</Lede>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PRODUCTS.groups.map((group, i) => (
          <section
            key={group.id}
            className="reveal group/card overflow-hidden rounded-2xl border border-line/70 bg-raised/40 transition-colors duration-300 ease-micro hover:border-accent/45"
          >
            <div className="relative aspect-[3/2] overflow-hidden bg-ground">
              <img
                src={group.image}
                alt={group.imageAlt}
                width={1000}
                height={667}
                /* The first card is above the fold on a tall phone; the rest
                   are not, and four eager 3:2 images is four requests
                   competing with the hero's 3D chunk. */
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="size-full object-cover transition-transform duration-700 ease-micro group-hover/card:scale-[1.04]"
              />
              {/*
                A ramp from the card's own ground up into the photograph, so the
                image does not end on a hard line above the heading. Cheaper and
                steadier than a border: a 1px rule here read as a seam between
                two unrelated blocks.
              */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-raised to-transparent"
              />
            </div>

            <div className="p-6 pt-5 sm:p-7 sm:pt-6">
              <h3 className="display-opsz font-display text-[1.25rem] leading-tight font-normal text-heading">
                {group.name}
              </h3>
              <span aria-hidden className="mt-4 block h-px w-8 bg-accent/70" />
              <ul className="mt-5 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="text-[0.88rem] leading-snug text-body">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </Section>
  )
}
