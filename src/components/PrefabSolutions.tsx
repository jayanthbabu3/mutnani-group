import { PREFAB } from '../data/site'
import { useReveal } from '../lib/motion'
import { Eyebrow, Section, SectionTitle } from './ui'

/**
 * Vertical 01 — Balaji Prefab Solutions.
 *
 * The group is three companies, and until this section existed the page never
 * said so plainly. It showed a three-up overview near the top, then a build
 * process, then a panel line, then a trade yard — four sections whose
 * ownership a visitor had to work out for themselves. Two of the three
 * companies had a section with their name on it; the one that builds the
 * actual building did not.
 *
 * ── The NAME is the heading ───────────────────────────────────────────────
 * It read the other way round at first: "We draw it, make it, erect it" as the
 * heading, with the company buried in a small line above it. That is backwards
 * for a section whose entire job is to say WHICH of the three companies this
 * is. The name is the headline, the slogan is the gold line under it, and the
 * paragraph that used to sit under both is gone — three stacked lines of
 * introduction before any content is two too many.
 *
 * ── Why the heading sits INSIDE the left column ───────────────────────────
 * Everywhere else on the site the heading spans the full width above its
 * content. Here it does not, and that is deliberate: with the heading above,
 * the image started level with the capability list and ran on past the bottom
 * of it, so the two halves of the section began and ended at different heights
 * and the whole thing sat crooked. Putting the heading in the column makes the
 * two columns the same run of content, and `items-stretch` plus a `flex-1`
 * image makes them the same height — tops and bottoms level at every width.
 *
 * ── Not a repeat of the Divisions cards ───────────────────────────────────
 * Divisions is a three-up: one paragraph each, so the group reads as a group.
 * This is the same company at full length. The cards answer "who are they";
 * this answers "what do I get".
 */
export default function PrefabSolutions() {
  const ref = useReveal<HTMLElement>({ stagger: 0.07 })

  return (
    <Section id="prefab" ref={ref}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-stretch lg:gap-14">
        {/* ── The company, and what it does ──────────────────────────────── */}
        <div className="flex flex-col lg:order-1">
          <Eyebrow>{PREFAB.eyebrow}</Eyebrow>
          <SectionTitle className="!mt-3">{PREFAB.title}</SectionTitle>
          {/* Deliberately small. It is a strapline under the company name, not
              a second headline — at display size the two competed and the eye
              could not tell which one was the section's subject. */}
          <p className="reveal mt-2.5 text-[clamp(0.92rem,1.05vw,1.05rem)] leading-snug text-accent">
            {PREFAB.sub}
          </p>

          {/* `mt-auto` on the list's wrapper would push it to the bottom; it is
              the NOTE that takes the slack instead, so the capabilities stay
              tight under the heading and the column still fills its height. */}
          <ol className="mt-9 divide-y divide-line/50 border-y border-line/50">
            {PREFAB.capabilities.map((c, i) => (
              <li key={c.name} className="reveal flex gap-5 py-5">
                <span className="mt-1 text-[0.72rem] font-semibold text-accent/80 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block text-[1rem] leading-tight text-heading">{c.name}</span>
                  <span className="mt-1.5 block text-[0.88rem] leading-[1.6] text-body">
                    {c.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <p className="reveal mt-5 text-[0.82rem] leading-[1.6] text-body/70 lg:mt-auto lg:pt-5">
            {PREFAB.note}
          </p>
        </div>

        {/* ── The work ───────────────────────────────────────────────────── */}
        <div className="reveal flex flex-col lg:order-2">
          {/*
            `flex-1` plus `min-h-0` is what lets the picture absorb whatever
            height the left column happens to be, instead of the two sides
            each finding their own. Below `lg` the flex column is not
            constrained, so the aspect ratio takes over and the image keeps a
            sane shape on a phone.
          */}
          <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-line/60">
            <img
              src={PREFAB.image}
              alt={PREFAB.imageAlt}
              width={1400}
              height={1000}
              loading="lazy"
              decoding="async"
              className="aspect-[7/5] size-full object-cover lg:aspect-auto"
            />
          </div>

          <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-5">
            {PREFAB.figures.map((f) => (
              <div key={f.label}>
                <dd className="text-[1.6rem] leading-none font-semibold text-heading tabular-nums">
                  {f.value}
                  <span className="ml-1 text-[0.8rem] font-light text-accent">{f.unit}</span>
                </dd>
                <dt className="tech-sm mt-2.5 text-body/60">{f.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  )
}
