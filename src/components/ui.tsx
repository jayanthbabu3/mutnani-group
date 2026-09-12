import type { ReactNode, Ref } from 'react'

/**
 * The section vocabulary. Compose these — never re-implement them, or the
 * rhythm drifts section by section.
 */

/**
 * THE shell. Width and gutters are defined here and nowhere else, so the
 * header, every section and the footer share one left edge.
 *
 * The padding lives INSIDE the max-width box. Get that inverted in one place —
 * a header that centres a 104rem box and then pads it, next to a section that
 * pads the viewport and then centres — and the two left edges differ by the
 * gutter (56px at xl). It looks like a mistake and it is invisible until you
 * measure, because both look "centred".
 *
 * If a header, footer or overlay needs the shell, it uses this. It never
 * writes `max-w-[104rem]` itself.
 */
export function Shell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[104rem] px-5 sm:px-8 xl:px-14 ${className}`}>
      {children}
    </div>
  )
}

/**
 * ONE vertical rhythm for every section.
 *
 * There were two: a `compact` scale and a default one, and which section got
 * which was decided section by section. The result was a page whose gaps went
 * 84 · 156 · 156 · 84 · 156 · 224 · 224 — the spacing lurched depending on
 * which pair you happened to scroll past, and the tight pairs read as a
 * mistake rather than as emphasis.
 *
 * Now every boundary is identical. `compact` is gone rather than set equal to
 * the default, because a prop that no longer changes anything is a trap for
 * whoever reads this next.
 *
 * ── One section per screen ────────────────────────────────────────────────
 * `min-h-svh` plus centred content gives each section a screen of its own, so
 * scrolling lands on one thing at a time rather than on the tail of one
 * section and the head of the next.
 *
 * It is a MINIMUM, not a height. A section with more content than a screen
 * stays as tall as its content — the rule cannot be enforced by CSS, only
 * offered, and on a phone it is not offered at all: measured at 390×844 every
 * section's content alone runs 863–2250px, so a viewport can never hold one
 * whole section there no matter how the padding is set. Forcing `min-h` on
 * mobile would add empty screens without ever achieving it, so mobile relies
 * on the padding instead: 96px a side, about a fifth of a phone screen, which
 * is enough to say a section has ended.
 *
 * `svh` not `vh`: on iOS `vh` is the height with the URL bar hidden, so every
 * section would be taller than the screen actually is until the bar collapses.
 *
 * The FLEX is `md:` too, not just the `min-h`. As a flex container at every
 * width it broke the phone layout: a flex item will not shrink below its
 * content, so the build steps' horizontal rail pushed the whole shell wider
 * than the screen and twenty-three elements overflowed. Below `md` the section
 * stays a plain block, which is all it needs to be — there is nothing to
 * centre when the content is taller than the screen anyway.
 */
export function Section({
  id,
  children,
  className = '',
  ref,
}: {
  id?: string
  children: ReactNode
  className?: string
  ref?: Ref<HTMLElement>
}) {
  return (
    <section
      id={id}
      ref={ref}
      className={`relative scroll-mt-20 py-24 md:flex md:min-h-svh md:items-center md:py-32 ${className}`}
    >
      <Shell>{children}</Shell>
    </section>
  )
}

/** Small wide-tracked label with a hairline marker. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="reveal tech flex items-center gap-3 text-accent/85">
      <span className="h-px w-6 bg-accent/50" />
      {children}
    </p>
  )
}

/**
 * ONE size for every section heading on the page.
 *
 * There were three. The base was `clamp(2.1rem, 4.6vw, 3.6rem)`; Divisions,
 * BuildSteps and TradeRoutes each passed the same smaller clamp by hand; and
 * RoofingLine passed a third, smaller still. Three sizes that all meant
 * "section heading" is not a hierarchy, it is drift — each one was set to fix
 * the wrapping in one particular section and nobody compared them side by side.
 *
 * The hero is the only heading allowed to be bigger, because it is the only one
 * that is not a section heading.
 *
 * `className` remains for POSITION, not for size. If a section needs a smaller
 * heading to fit, the copy is too long — shorten the copy.
 */
export function SectionTitle({
  children,
  className = '',
}: {
  children: ReactNode
  /** Spacing and alignment only. Do not pass a `text-*` size here. */
  className?: string
}) {
  return (
    <h2
      className={`reveal mt-4 max-w-3xl font-display text-[clamp(1.9rem,3.2vw,2.7rem)] leading-[1.12] font-semibold tracking-[-0.015em] text-heading ${className}`}
    >
      {children}
    </h2>
  )
}

/**
 * The one paragraph under a section heading.
 *
 * Four sections used this; four others hand-rolled a `<p>` with a slightly
 * different measure, size and top margin. Same drift as the headings, same fix
 * — this is now the only way to set the line under a title.
 */
export function Lede({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`reveal mt-4 max-w-3xl text-[0.95rem] leading-[1.7] text-body ${className}`}>
      {children}
    </p>
  )
}

export function CtaLink({
  href,
  children,
  variant = 'solid',
  external,
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: 'solid' | 'ghost'
  external?: boolean
  className?: string
}) {
  const base =
    'group inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-[0.78rem] font-medium tracking-[0.04em] transition-all duration-300 ease-micro sm:px-7 sm:py-3.5 sm:text-[0.82rem]'
  const skin =
    variant === 'solid'
      ? 'bg-accent font-semibold text-ground hover:bg-accent-glow hover:shadow-[0_10px_24px_-10px_rgba(0,84,168,0.55)]'
      : 'border border-line text-heading/85 hover:border-accent/60 hover:text-accent'

  return (
    <a
      href={href}
      className={`${base} ${skin} ${className}`}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" aria-hidden>
        <path d="M4 12h15m0 0-6-6m6 6-6 6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </a>
  )
}

/** Hairline rule with a marker at its centre — the band divider. */
export function Divider() {
  return (
    <div className="mx-auto flex max-w-[104rem] items-center gap-4 px-5 sm:px-8 xl:px-14">
      <span className="hairline h-px flex-1" />
      <span className="size-1 rotate-45 bg-accent/50" />
      <span className="hairline h-px flex-1" />
    </div>
  )
}
