import { PARTNERS } from '../data/site'
import { useReveal } from '../lib/motion'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

/**
 * Who has already bought, in one glance. Real marks only — see
 * `public/partners/` and the CLIENT note on `partners` in data/site.ts before
 * swapping any of them.
 *
 * ONE row, and it bleeds to the viewport edges. Two rows were tried and read
 * as the same four logos shuffled — with four marks, repetition across rows
 * is the first thing a visitor notices. One row that runs edge to edge
 * instead makes width do the work: the strip is wider than any screen, so
 * the eye never sees a start or an end, only motion. The section shell still
 * governs the heading; only the strip escapes it, the same way the 3D stages
 * bleed in the hero.
 *
 * The cards are tall on purpose. A logo alone in a wide card is a badge; a
 * logo with the company's name and sector under it is a card about a client,
 * and it carries the vertical space that a bare strip left empty. The track
 * holds three copies of the list — `marquee` in index.css walks it exactly
 * one copy's width, so the seam is invisible and the loop never jumps. It
 * never pauses: a strip that stops when a cursor drifts near it reads as
 * broken. Under prefers-reduced-motion it becomes a static wrapped row.
 *
 * Full colour at rest, not grayscale-until-hover — these are four named,
 * verifiable clients, and desaturating a client's own mark by default reads
 * as disrespect to the name on it.
 */
export default function Partners() {
  const ref = useReveal<HTMLElement>({ stagger: 0.08 })
  const loop = [...PARTNERS.items, ...PARTNERS.items, ...PARTNERS.items]

  return (
    <Section id="partners" ref={ref} className="overflow-hidden">
      <div className="mx-auto max-w-3xl text-center">
        <div className="flex justify-center">
          <Eyebrow>{PARTNERS.eyebrow}</Eyebrow>
        </div>
        <SectionTitle className="mx-auto">{PARTNERS.title}</SectionTitle>
        <Lede className="mx-auto">{PARTNERS.lede}</Lede>
      </div>

      {/* Escapes the shell so the strip runs edge to edge — the only element
          in the section allowed to. Width and offset are the viewport, not
          the shell, so no gutter is left at either side. */}
      <div className="partners-fade partners-marquee reveal relative left-1/2 mt-16 w-screen -translate-x-1/2 overflow-hidden py-4 sm:mt-20">
        <div className="partners-track flex w-max items-stretch gap-6 sm:gap-8">
          {loop.map((item, i) => (
            <figure
              key={`${item.id}-${i}`}
              aria-hidden={i >= PARTNERS.items.length}
              className={`flex w-[17rem] shrink-0 flex-col items-center justify-between rounded-3xl border border-line/30 bg-[#fafaf8] px-8 pt-9 pb-7 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-micro hover:-translate-y-1.5 sm:w-[20rem] sm:px-10 sm:pt-11 sm:pb-8 ${
                i >= PARTNERS.items.length ? 'partners-track-dup' : ''
              }`}
            >
              <div className="flex h-24 w-full items-center justify-center sm:h-28">
                <img
                  src={item.logo}
                  alt={item.logoAlt}
                  loading="lazy"
                  className="max-h-full w-auto max-w-full object-contain"
                />
              </div>
              <figcaption className="mt-7 w-full border-t border-ground/10 pt-5 text-center">
                <p className="text-[0.92rem] leading-snug font-medium text-ground">{item.name}</p>
                <p className="tech-sm mt-2 text-ground/55">{item.sector}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  )
}
