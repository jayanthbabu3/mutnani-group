import ContactCta from '../components/ContactCta'
import PageHero from '../components/PageHero'
import TradeRoutes from '../components/TradeRoutes'
import { Section } from '../components/ui'
import { DIVISIONS, PAGES } from '../data/site'
import { useReveal } from '../lib/motion'
import { usePageMeta } from '../lib/meta'

/**
 * What Mutnani IMEX Infra brings in — reached from "View more" on the
 * company's card, like the other two.
 *
 * The desk's own list first, then the globe from the home page unchanged, so
 * the drawing of the trade lives in one place and this page inherits every
 * edit to it.
 */
export default function ImportsPage() {
  const page = PAGES.imports
  usePageMeta('Imports', page.meta)

  const trade = DIVISIONS.find((division) => division.id === 'trade')!
  const ref = useReveal<HTMLDivElement>({ stagger: 0.06 })

  return (
    <>
      <PageHero crumb="Imports" eyebrow={page.eyebrow} title={page.title} lede={page.lede} />

      <Section className="!min-h-0 !py-14 md:!block lg:!py-16">
        <div ref={ref}>
          <p className="reveal tech-sm border-t border-line pt-5 text-body">What the desk handles</p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trade.offers.map((offer, i) => (
              <li
                key={offer}
                className="reveal rounded-2xl border border-line/70 bg-raised/40 p-5 transition-colors duration-300 ease-micro hover:border-accent/45 hover:bg-ground"
              >
                <span className="tech-sm text-accent tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-3 text-[0.95rem] leading-snug text-heading">{offer}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <TradeRoutes />

      <ContactCta />
    </>
  )
}
