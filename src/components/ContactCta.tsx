import { CONTENT, SITE } from '../data/site'
import { useReveal } from '../lib/motion'
import { CtaLink, Shell, TwoTone } from './ui'

/**
 * The close of an inner page: one band that hands the visitor to Contact.
 *
 * The Companies and About pages end here instead of carrying the whole
 * enquiry form — that lives on Contact, once. The heading reuses the enquiry
 * section's own title, so the band and the page it leads to say the same
 * thing.
 */
export default function ContactCta() {
  const ref = useReveal<HTMLElement>({ stagger: 0.08 })

  return (
    <section ref={ref} className="py-12 md:py-14">
      <Shell>
        <div className="relative isolate overflow-hidden rounded-3xl border border-line bg-raised/40 px-6 py-8 sm:px-10 sm:py-10">
          <div
            aria-hidden
            className="blueprint absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top_right,#000_0%,transparent_70%)]"
          />
          <p className="reveal tech flex items-center gap-3 text-accent/85">
            <span className="h-px w-6 bg-accent/50" />
            {CONTENT.contact.eyebrow}
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <h2 className="reveal max-w-xl font-display text-[clamp(1.4rem,2.1vw,1.85rem)] leading-[1.18] font-semibold tracking-[-0.015em] text-heading">
              <TwoTone text={CONTENT.contact.title} />
            </h2>
            <div className="reveal flex flex-wrap items-center gap-3">
              <CtaLink href="/contact">Contact us</CtaLink>
              <CtaLink href={`tel:${SITE.phone}`} variant="ghost">
                {SITE.phoneDisplay}
              </CtaLink>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  )
}
