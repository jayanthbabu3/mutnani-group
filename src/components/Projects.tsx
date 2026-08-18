import { PROJECTS } from '../data/site'
import { useReveal } from '../lib/motion'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

/**
 * Named clients, named scopes.
 *
 * No photographs here on purpose. The group has real project photography; until
 * it is handed over, a stock warehouse from Unsplash would be worse than
 * nothing — it is the exact move that made the consultancy's attempt read as
 * unfinished. Names and scopes are true and verifiable; a stock photo is
 * neither. The README lists this as the first swap before launch.
 */
export default function Projects() {
  const ref = useReveal<HTMLElement>({ stagger: 0.08 })

  return (
    <Section id="projects" ref={ref}>
      <Eyebrow>{PROJECTS.eyebrow}</Eyebrow>
      <SectionTitle>{PROJECTS.title}</SectionTitle>
      <Lede>{PROJECTS.lede}</Lede>

      <ul className="mt-14 divide-y divide-line/60 border-y border-line/60">
        {PROJECTS.items.map((item) => (
          <li
            key={item.id}
            className="reveal group grid gap-x-8 gap-y-2 py-7 transition-colors duration-300 ease-micro sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] sm:items-baseline"
          >
            <h3 className="display-opsz font-display text-[1.35rem] leading-tight font-normal text-heading transition-colors duration-300 ease-micro group-hover:text-accent sm:text-[1.55rem]">
              {item.name}
            </h3>
            <p className="text-[0.9rem] leading-snug text-body">{item.scope}</p>
            <div className="flex items-baseline gap-4 sm:justify-end sm:text-right">
              <span className="tech-sm text-body/70">{item.place}</span>
              <span className="text-[0.85rem] font-medium text-accent tabular-nums">
                {item.figure}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
