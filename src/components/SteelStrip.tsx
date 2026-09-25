import { APPLICATIONS } from '../data/site'
import { useReveal } from '../lib/motion'
import { Section, TwoTone } from './ui'

/**
 * Whose steel it is.
 *
 * A buyer comparing two prefab quotes asks what the sheet is rolled from long
 * before they ask about the shed, so the mills are named on the page that
 * lists the buildings. Names set in type, not the mills' logos: a supplier's
 * trademark is theirs to grant, and this site is careful about that elsewhere.
 */
export default function SteelStrip() {
  const steel = APPLICATIONS.steel
  const ref = useReveal<HTMLDivElement>({ stagger: 0.06 })

  return (
    <Section className="!min-h-0 !pt-2 !pb-16 md:!block lg:!pb-20">
      <div
        ref={ref}
        className="grid gap-8 rounded-2xl border border-line/70 bg-raised/40 p-7 sm:p-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14"
      >
        <div>
          <p className="reveal tech-sm text-accent">{steel.eyebrow}</p>
          <h2 className="reveal display-opsz mt-3 font-display text-[1.3rem] leading-tight font-semibold text-heading">
            <TwoTone text={steel.title} />
          </h2>
          <p className="reveal mt-4 max-w-md text-[0.9rem] leading-[1.7] text-body">{steel.lede}</p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {steel.mills.map((mill) => (
            <li
              key={mill.name}
              className="reveal rounded-xl border border-line bg-ground px-5 py-5 text-center"
            >
              <p className="display-opsz font-display text-[1.25rem] leading-none font-semibold text-heading">
                {mill.name}
              </p>
              <p className="tech-sm mt-3 text-body">{mill.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
