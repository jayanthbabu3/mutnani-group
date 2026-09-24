import { HERO } from '../data/site'
import { useCountUp, useEntrance } from '../lib/motion'
import { Shell } from './ui'

/**
 * Framed cinematic hero: the construction timelapse fills one large rounded
 * frame, the promise sits on it in white, and the three companies line up
 * along its foot as glass cards — so the first screen says both "we build
 * this" (the film) and "these are the three of us" (the cards) without a
 * paragraph in between.
 *
 * The frame, not a full-bleed video, because the header is transparent over
 * white: a dark full-bleed ground would need the logo and nav re-inked, and
 * the inset keeps the header exactly as it is on every other page.
 *
 * Height is a MINIMUM tied to the screen (`svh`), so on a 1280×800 MacBook the
 * whole hero — headline, buttons and all three cards — lands on one screen,
 * and on anything shorter the frame grows with its content instead of
 * clipping it. Re-check at 1280×800 before adding copy.
 *
 * `poster` is not optional: Safari on a Mac in Low Power Mode refuses to
 * autoplay, and without a poster the frame would be a dark empty box.
 */
export default function Hero() {
  const ref = useEntrance<HTMLElement>()
  const { line1, line2 } = HERO.headline

  return (
    <header ref={ref} id="top" className="relative pt-[4.75rem] pb-6 lg:pb-8">
      <Shell>
        <div className="relative isolate flex flex-col overflow-hidden rounded-[1.75rem] bg-heading lg:min-h-[calc(100svh-6.5rem)] lg:rounded-[2rem]">
          {/* ── Film ───────────────────────────────────────────────────── */}
          <video
            className="absolute inset-0 -z-20 size-full object-cover object-center"
            src="/hero-timelapse.mp4"
            poster="/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          {/* Two washes: one from the left behind the copy, one from the foot
              behind the cards. Together they hold white text at AA over the
              brightest sky in the film without flattening the picture. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(8,22,40,0.92)_0%,rgba(8,22,40,0.72)_40%,rgba(8,22,40,0.25)_75%,rgba(8,22,40,0.15)_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-[linear-gradient(to_top,rgba(8,22,40,0.95)_0%,rgba(8,22,40,0.6)_45%,transparent_100%)]"
          />

          {/* ── Promise ────────────────────────────────────────────────── */}
          <div className="flex flex-1 flex-col justify-center px-5 pt-10 pb-9 sm:px-10 sm:pt-12 lg:px-14 lg:pt-14">
            <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="max-w-2xl">
                {HERO.eyebrow ? (
                  <p
                    data-entrance
                    className="tech-sm inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-white/90 backdrop-blur-md"
                  >
                    <span className="size-1.5 animate-pulse rounded-full bg-brand-lime" />
                    {HERO.eyebrow}
                  </p>
                ) : null}

                {/*
                  White then lime: the logo's two faces. The lime cannot carry
                  text on white (2.2:1), but on this dark wash it is well past
                  AA, which is the one place the site gets to use it for type.
                */}
                <h1
                  data-entrance="lines"
                  className="mt-6 font-display text-[clamp(2.1rem,4.4vw,4rem)] leading-[1.04] font-bold tracking-tight text-white"
                >
                  <span className="block">{line1}</span>
                  <span className="block text-brand-lime">{line2}</span>
                </h1>

                <p
                  data-entrance="rise"
                  className="mt-5 max-w-lg text-[1rem] leading-relaxed text-white/80 sm:text-[1.06rem]"
                >
                  {HERO.sub}
                </p>

                <div data-entrance="rise" className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="#contact"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-brand-lime px-6 py-3 text-[0.82rem] font-semibold tracking-[0.04em] text-heading transition-all duration-300 ease-micro hover:bg-white sm:px-7 sm:py-3.5"
                  >
                    {HERO.primaryCta}
                    <Arrow />
                  </a>
                  <a
                    href="#build"
                    className="group inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/5 px-6 py-3 text-[0.82rem] font-medium tracking-[0.04em] text-white backdrop-blur-md transition-all duration-300 ease-micro hover:border-white hover:bg-white/15 sm:px-7 sm:py-3.5"
                  >
                    {HERO.secondaryCta}
                    <Arrow />
                  </a>
                </div>
              </div>

              <dl
                data-entrance="rise"
                data-entrance-at="+=0.15"
                className="grid grid-cols-3 gap-4 border-t border-white/20 pt-6 lg:grid-cols-1 lg:gap-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
              >
                {HERO.stats.map((s) => (
                  <Stat key={s.label} {...s} />
                ))}
              </dl>
            </div>
          </div>

          {/* ── The three companies ────────────────────────────────────── */}
          <ul
            data-entrance="rise"
            data-entrance-at="+=0.25"
            className="grid gap-3 px-4 pb-4 sm:px-6 sm:pb-6 lg:grid-cols-[1.7fr_1fr_1fr] lg:gap-4 lg:px-8 lg:pb-8"
          >
            {HERO.companies.map((c, i) => (
              <li
                key={c.name}
                className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl transition-colors duration-300 ease-micro hover:border-white/30 hover:bg-white/[0.12] lg:p-6"
              >
                <p className="flex items-center gap-2.5">
                  <span className="grid size-6 place-items-center rounded-full bg-brand-lime text-[0.68rem] font-bold text-heading tabular-nums">
                    {i + 1}
                  </span>
                  <span className="tech-sm text-brand-lime">{c.kind}</span>
                </p>
                <h2 className="mt-3 font-display text-[1.02rem] leading-snug font-semibold text-white">
                  {c.name}
                </h2>
                <ul
                  className={`mt-3 grid gap-x-6 gap-y-1.5 ${
                    c.items.length > 3 ? 'sm:grid-cols-[auto_auto] sm:justify-start' : ''
                  }`}
                >
                  {c.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[0.88rem] leading-snug text-white/80"
                    >
                      <Check />
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </Shell>
    </header>
  )
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5 transition-transform duration-300 ease-micro group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path d="M4 12h15m0 0-6-6m6 6-6 6" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Check() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="mt-[0.18em] size-[0.95em] shrink-0 text-brand-lime"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
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
      <dd className="text-[1.45rem] leading-none font-semibold whitespace-nowrap text-white tabular-nums sm:text-[2rem]">
        <span ref={ref} />
        <span className="ml-0.5 text-[0.6em] font-medium text-brand-lime">{suffix}</span>
      </dd>
      <p className="tech-sm mt-2 text-white/65">{label}</p>
    </div>
  )
}
