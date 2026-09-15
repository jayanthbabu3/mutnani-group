import { HERO, SITE } from '../data/site'
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
      className="relative isolate overflow-hidden pt-28 pb-16 lg:flex lg:min-h-[100svh] lg:items-center lg:pt-24 lg:pb-10"
    >
      <Shell>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-14">
          {/* ── Copy ──────────────────────────────────────────────────── */}
          <div className="order-2 lg:order-1">
            <p data-entrance className="tech flex items-center gap-3 text-accent/85">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              {HERO.eyebrow}
            </p>

            {/*
              No italic on the stressed line: the accent colour already carries
              that emphasis, and a high-contrast display italic at display size
              reads as an invitation rather than as steel.

              The clamp is measured, not chosen. Both slogan lines cost 8.07em
              in Fraunces 300 at -0.02em tracking, and the tightest budget on
              the page is NOT the 360px phone (9.25em) — it is 1280px, where the
              two-column split has already happened but the type is near full
              size (9.49em). `4.4vw` and the 3.6rem cap are what keep every
              breakpoint above the cost with ~13% to spare. Re-measure both
              lines before changing either the copy or these numbers.

              Two block spans, not a `{line1} {line2}` run: the colour change
              marks the second CLAUSE, so it has to start a line. Left inline,
              the accent picks up in the middle of line one and the device stops
              reading. SplitText treats each block as its own line, so the mask
              sweep still works per clause.
            */}
            <h1
              data-entrance="lines"
              className="mt-6 font-display text-[clamp(1.7rem,3.2vw,2.75rem)] leading-[1.1] font-bold tracking-tight text-heading"
            >
              <span className="block">{line1}</span>
              <span className="block text-accent">{line2}</span>
            </h1>

            <p
              data-entrance="rise"
              className="mt-6 max-w-xl text-[0.98rem] leading-[1.75] text-body"
            >
              {HERO.sub}
            </p>

            <div data-entrance="rise" className="mt-9 flex flex-wrap items-center gap-3">
              <CtaLink href="#contact">{HERO.primaryCta}</CtaLink>
              <CtaLink href="#build" variant="ghost">
                {HERO.secondaryCta}
              </CtaLink>
            </div>

            <dl
              data-entrance="rise"
              data-entrance-at="+=0.15"
              className="mt-11 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-7"
            >
              {HERO.stats.map((s) => (
                <Stat key={s.label} {...s} />
              ))}
            </dl>

            <p data-entrance className="tech-sm mt-8 text-body">
              {SITE.basedLine}
            </p>
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
