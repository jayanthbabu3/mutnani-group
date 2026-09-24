import ContactCta from '../components/ContactCta'
import PageHero from '../components/PageHero'
import RoofingLine from '../components/RoofingLine'
import SteelStrip from '../components/SteelStrip'
import { APPLICATION_ICONS } from '../components/applicationIcons'
import { Divider, Section } from '../components/ui'
import { LINE, PAGES, ROOFING_RANGE } from '../data/site'
import { useReveal } from '../lib/motion'
import { usePageMeta } from '../lib/meta'

/**
 * What Balaji Roofing rolls — the range first, then the line that makes it.
 *
 * The order is the buyer's: what can I buy, and only then how is it made. The
 * line itself is the section from the home page, unchanged, so the drawing of
 * the process lives in one place and this page inherits every edit to it.
 */
export default function RoofingRangePage() {
  const page = PAGES.roofing
  usePageMeta('Roofing range', page.meta)

  const ref = useReveal<HTMLDivElement>({ stagger: 0.05 })

  return (
    <>
      <PageHero crumb="Roofing range" eyebrow={page.eyebrow} title={page.title} lede={page.lede} />

      <Section className="!min-h-0 !py-14 md:!block lg:!py-16">
        <div ref={ref}>
          {/* The sizes the whole range is made to, before the range itself:
              they are the first question on a roofing enquiry, and they
              qualify every item under them. */}
          {/* A grid, not a flex row: the labels under these numbers are long
              ("Sheet thickness", "Cover width") and as flex items they ran
              into each other. */}
          <dl className="reveal grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-3 sm:max-w-2xl">
            {LINE.figures.map((figure) => (
              <div key={figure.label}>
                <dd className="text-[1.3rem] leading-none font-semibold text-heading tabular-nums">
                  {figure.value}
                  <span className="ml-1 text-[0.78rem] font-light text-accent">{figure.unit}</span>
                </dd>
                <dt className="tech-sm mt-2 text-body">{figure.label}</dt>
              </div>
            ))}
          </dl>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROOFING_RANGE.items.map((item) => (
              <li
                key={item.title}
                className="group/type reveal flex gap-4 rounded-2xl border border-line/70 bg-raised/40 p-5 transition-all duration-300 ease-micro hover:-translate-y-0.5 hover:border-accent/45 hover:bg-ground"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-ground text-accent transition-colors duration-300 ease-micro group-hover/type:border-accent/40 group-hover/type:bg-accent group-hover/type:text-ground">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d={APPLICATION_ICONS[item.icon] ?? APPLICATION_ICONS.panel} />
                  </svg>
                </span>

                <span className="min-w-0">
                  <h2 className="font-display text-[0.98rem] leading-snug font-semibold text-heading">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-[0.85rem] leading-[1.65] text-body">{item.body}</p>
                </span>
              </li>
            ))}
          </ul>

          <p className="reveal mt-8 border-t border-line/60 pt-5 text-[0.8rem] leading-[1.6] text-body">
            {LINE.note}
          </p>
        </div>
      </Section>

      <Divider />
      <RoofingLine />
      <SteelStrip />
      <ContactCta />
    </>
  )
}
