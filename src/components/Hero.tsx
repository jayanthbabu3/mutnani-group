import { HERO } from '../data/site'
import { useCountUp, useEntrance } from '../lib/motion'
import { CtaLink, Shell } from './ui'

const MASK = [
  'radial-gradient(82% 86% at 50% 50%, #000 58%, rgba(0,0,0,0.85) 80%, transparent 100%)',
  'linear-gradient(to right, transparent 0%, #000 3%, #000 97%, transparent 100%)',
  'linear-gradient(to bottom, transparent 0%, #000 7%, #000 93%, transparent 100%)',
].join(', ')

/**
 * Split hero: the promise on the left, the building erecting itself on the
 * right. The caption under the stage names the stage currently being built, so
 * the animation is legible as a process rather than admired as an effect —
 * which is the difference between a hero that sells prefab and one that just
 * moves.
 */
export default function Hero() {
  const ref = useEntrance<HTMLElement>()

  const { line1, line2 } = HERO.headline

  return (
    <header
      ref={ref}
      id="top"
      className="relative isolate overflow-hidden pt-28 pb-20 lg:flex lg:min-h-[100svh] lg:items-center lg:pt-24 lg:pb-10"
    >
      <Shell>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-14">
          {/* ── Copy ──────────────────────────────────────────────────── */}
          <div className="order-2 lg:order-1">
            {/* Only when the client wants one: an empty `hero.eyebrow` in the
                content file drops the line, and the headline leads instead. */}
            {HERO.eyebrow ? (
              <p data-entrance className="tech flex items-center gap-3 text-accent/85">
                <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                {HERO.eyebrow}
              </p>
            ) : null}

            {/*
              No italic on the stressed line: the blue-to-green switch already carries
              that emphasis, and a high-contrast display italic at display size
              reads as an invitation rather than as steel.

              Sized for the longest line, "Three Companies, One Group.":
              it has to hold one line in the ~560px copy column at 1280px,
              which is what caps the clamp. Re-check it there before changing
              either the copy or these numbers.

              Two block spans, not a `{line1} {line2}` run: the colour change
              marks the second CLAUSE, so it has to start a line. Left inline,
              the accent picks up in the middle of line one and the device stops
              reading. SplitText treats each block as its own line, so the mask
              sweep still works per clause.
            */}
            <h1
              data-entrance="lines"
              className="mt-6 first:mt-0 font-display text-[clamp(1.6rem,2.9vw,2.6rem)] leading-[1.1] font-bold tracking-tight text-heading"
            >
              <span className="block text-accent">{line1}</span>
              <span className="block text-secondary">{line2}</span>
            </h1>

            {/* The three companies as a checklist rather than one long
                sentence: a buyer scanning for "PEB" or "False Ceiling" finds it
                under the company that does it. */}
            <ul data-entrance="rise" className="mt-7 max-w-xl space-y-4 lg:mt-8">
              {HERO.companies.map((c, i) => (
                <li key={c.name} className="border-l-2 border-accent/40 pl-4">
                  <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <span className="tech-sm text-accent tabular-nums">0{i + 1}</span>
                    <span className="text-[0.98rem] font-semibold text-heading">{c.name}</span>
                    <span className="tech-sm text-secondary">{c.kind}</span>
                  </p>
                  <ul className="mt-2 grid gap-x-8 gap-y-1.5 sm:grid-cols-[auto_auto] sm:justify-start">
                    {c.items.map((item) => (
                      <li
                        key={item}
                        className={`flex items-start gap-2 text-[0.92rem] leading-snug text-body ${
                          c.items.length === 1 ? 'sm:col-span-2' : ''
                        }`}
                      >
                        <Check />
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <div data-entrance="rise" className="mt-8 flex flex-wrap items-center gap-3">
              <CtaLink href="#contact">{HERO.primaryCta}</CtaLink>
              <CtaLink href="#build" variant="ghost">
                {HERO.secondaryCta}
              </CtaLink>
            </div>

            <dl
              data-entrance="rise"
              data-entrance-at="+=0.15"
              className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6"
            >
              {HERO.stats.map((s) => (
                <Stat key={s.label} {...s} />
              ))}
            </dl>
          </div>

          {/* ── Stage ─────────────────────────────────────────────────── */}
          <div data-entrance data-entrance-at="+=0.3" className="order-1 lg:order-2 lg:pl-4">
            <div className="relative mx-auto aspect-[4/3] w-full sm:aspect-[16/11]">
              <video
                className="absolute inset-0 size-full object-cover object-center"
                style={{
                  WebkitMaskImage: MASK,
                  maskImage: MASK,
                  WebkitMaskComposite: 'source-in',
                  maskComposite: 'intersect',
                }}
                src="/hero-timelapse.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </div>
        </div>
      </Shell>
    </header>
  )
}

function Check() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="mt-[0.2em] size-[0.95em] shrink-0 text-secondary"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  )
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useCountUp(value)
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      {/* Numbers in the sans: Fraunces has old-style figures, and "1000" set
          in it reads as a run of ascenders and descenders. */}
      <dd className="text-[1.7rem] leading-none font-semibold text-heading tabular-nums sm:text-[2.1rem]">
        <span ref={ref} />
        <span className="font-light text-accent">{suffix}</span>
      </dd>
      <p className="tech-sm mt-2.5 text-body">{label}</p>
    </div>
  )
}
