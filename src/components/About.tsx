import { ABOUT, whatsappHref } from '../data/site'
import { useReveal } from '../lib/motion'
import { CtaLink, Eyebrow, Section, SectionTitle } from './ui'

/**
 * The group's own story — and the only section on the page carrying the
 * group's OWN photography.
 *
 * That is deliberate and worth defending. Every other section refuses
 * pictures on purpose: the alternative was stock, and a stock warehouse on a
 * prefab company's site is what made the previous attempt read as unfinished
 * (see the note in Projects, and `imagePlaceholder` in data/site.ts). These
 * four are real — the HIL Achievers Club award, and three buildings the group
 * actually put up — so this is the one place a photograph is evidence rather
 * than decoration.
 *
 * The left column is a RECORD, not a scrapbook. It was a fan of overlapping
 * prints at angles first, and that was wrong twice over: the prints covered
 * the faces in the one photograph whose subject is people, and a tilted
 * collage is the visual language of a mood board, not of a firm that has been
 * trading since 2000. It also flattered nothing — three of these four files
 * are 334px wide, and a collage wants to show them big.
 *
 * So: the award is framed and captioned like the credential it is, with a
 * plate across its foot naming the award and the year. The three site
 * photographs sit under it in a strict row, small — the size their resolution
 * actually supports — each labelled with what it is and what state it is in.
 * Labelled small photographs read as evidence; big soft ones read as filler.
 */
export default function About() {
  const ref = useReveal<HTMLElement>({ stagger: 0.08 })

  return (
    <Section id="about" ref={ref}>
      {/* The left track is sized to the record, not to half the page: an even
          split left the capped column floating with a ragged gap beside it. */}
      <div className="grid items-center gap-12 lg:grid-cols-[32rem_minmax(0,1fr)] lg:gap-20">
        {/* ── The record ─────────────────────────────────────────────── */}
        {/* Capped: at a full half of a 1600px page the award runs 736px wide
            and pushes the section past a screen on its own. */}
        <div className="order-2 w-full max-w-[32rem] lg:order-1">
          <figure className="reveal relative">
            <div className="relative overflow-hidden rounded-sm bg-raised shadow-[0_36px_70px_-24px_rgba(0,0,0,0.75)] ring-1 ring-heading/10">
              <img
                src={ABOUT.award.image}
                alt={ABOUT.award.imageAlt}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              {/* The plate. A gold hairline over a navy wash, sitting on the
                  photograph rather than under it, so the credential and the
                  evidence for it are one object. */}
              <figcaption className="absolute inset-x-0 bottom-0 border-t border-accent/60 bg-ground/85 px-5 py-3.5 backdrop-blur-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="tech-sm text-heading/90">{ABOUT.award.caption}</span>
                  <span className="text-[0.82rem] font-medium text-accent tabular-nums">
                    {ABOUT.award.year}
                  </span>
                </div>
              </figcaption>
            </div>
          </figure>

          {/* The three site photographs. Small on purpose — see the note at
              the top of this file. */}
          <ul className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
            {ABOUT.gallery.map((shot) => (
              <li key={shot.id} className="reveal group">
                <div className="overflow-hidden rounded-sm bg-raised ring-1 ring-heading/10">
                  <img
                    src={shot.image}
                    alt={shot.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-micro group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-2.5 border-t border-line/60 pt-2 text-[0.8rem] leading-tight text-heading/85">
                  {shot.label}
                </p>
                <p className="tech-sm mt-1 text-body/60">{shot.note}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ── The story ───────────────────────────────────────────────── */}
        <div className="order-1 lg:order-2">
          <Eyebrow>{ABOUT.eyebrow}</Eyebrow>
          <SectionTitle>{ABOUT.title}</SectionTitle>

          <div className="reveal mt-6 space-y-4">
            {ABOUT.body.map((para) => (
              <p key={para} className="max-w-xl text-[0.95rem] leading-[1.75] text-body">
                {para}
              </p>
            ))}
          </div>

          <dl className="reveal mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-line/60 pt-7">
            {ABOUT.figures.map((figure) => (
              <div key={figure.label}>
                <dt className="sr-only">{figure.label}</dt>
                <dd>
                  <span className="display-opsz block font-display text-[1.75rem] leading-none font-normal text-heading tabular-nums">
                    {figure.value}
                  </span>
                  <span className="tech-sm mt-2.5 block text-body/70">{figure.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <CtaLink href={whatsappHref()} external className="reveal mt-9">
            {ABOUT.cta}
          </CtaLink>
        </div>
      </div>
    </Section>
  )
}
