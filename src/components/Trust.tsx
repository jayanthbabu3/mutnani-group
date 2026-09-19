import { OFFICES, TRUST } from '../data/site'
import { useReveal } from '../lib/motion'
import { OfficeCard } from './Offices'
import { Eyebrow, Section, SectionTitle } from './ui'

/**
 * Why the group gets asked back, plus both addresses.
 *
 * The offices sit here rather than only in the footer: for a B2B buyer,
 * "which of these two cities is going to run my project" is a qualifying
 * question, not a contact detail.
 */
export default function Trust() {
  const ref = useReveal<HTMLElement>({ stagger: 0.08 })

  return (
    <Section id="why-us" ref={ref}>
      <Eyebrow>{TRUST.eyebrow}</Eyebrow>
      <SectionTitle>{TRUST.title}</SectionTitle>

      {/* Points run as one strip across the full width, offices as two
          landscape cards under them. It was points-left / offices-right, and
          two stacked map cards made the right column twice the height of the
          left — a tall empty column beside a tall full one. Rows keep every
          band the width of the page and the section close to one screen. */}
      <dl className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST.points.map((point) => (
          <div key={point.title} className="reveal border-t border-line/60 pt-5">
            <dt className="display-opsz font-display text-[1.15rem] leading-tight font-normal text-heading">
              {point.title}
            </dt>
            <dd className="mt-3 text-[0.88rem] leading-[1.7] text-body">{point.body}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {OFFICES.map((office) => (
          <OfficeCard key={office.id} office={office} />
        ))}
      </div>
    </Section>
  )
}
