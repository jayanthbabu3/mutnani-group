import { CONTENT, SITE } from '../data/site'
import { useReveal } from '../lib/motion'
import { Shell } from './ui'

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
        {/*
          Filled, not outlined. As a bordered card on a white page this band
          was a wide empty rectangle with a heading in one corner and two
          buttons in the other — the last thing on the page and the quietest.
          In the brand blue it closes the page, and the line under the heading
          gives the buttons something to follow.
        */}
        <div className="relative isolate overflow-hidden rounded-3xl bg-accent px-6 py-10 text-ground sm:px-12 sm:py-12">
          <div
            aria-hidden
            className="blueprint absolute inset-0 -z-10 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_top_right,#000_0%,transparent_72%)]"
          />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
            <div>
              <p className="reveal tech flex items-center gap-3 text-ground/70">
                <span className="h-px w-6 bg-ground/45" />
                {CONTENT.contact.eyebrow}
              </p>
              <h2 className="reveal mt-4 max-w-2xl font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.15] font-semibold tracking-[-0.015em]">
                {CONTENT.contact.title.split(' | ').join(' ')}
              </h2>
              {/* Optional: an empty `contact.ctaLine` leaves the heading to
                  carry the band on its own. */}
              {CONTENT.contact.ctaLine ? (
                <p className="reveal mt-3 max-w-xl text-[0.92rem] leading-[1.7] text-ground/80">
                  {CONTENT.contact.ctaLine}
                </p>
              ) : null}
            </div>

            <div className="reveal flex flex-wrap items-center gap-3">
              <a
                href="/contact"
                className="group inline-flex items-center gap-2.5 rounded-full bg-ground px-6 py-3.5 text-[0.82rem] font-semibold tracking-[0.04em] text-accent transition-all duration-300 ease-micro hover:shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45)]"
              >
                Contact us
                <Arrow />
              </a>
              <a
                href={`tel:${SITE.phone}`}
                className="group inline-flex items-center gap-2.5 rounded-full border border-ground/45 px-6 py-3.5 text-[0.82rem] font-medium tracking-[0.04em] text-ground transition-colors duration-300 ease-micro hover:border-ground hover:bg-ground/10"
              >
                {SITE.phoneDisplay}
                <Arrow />
              </a>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" aria-hidden>
      <path d="M4 12h15m0 0-6-6m6 6-6 6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
