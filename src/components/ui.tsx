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
 * ── Rhythm, not one-section-per-screen ──────────────────────────────────
 * Sections used to carry `min-h-svh` with their content centred, so scrolling
 * landed on one section at a time. It read well on the long ones and badly on
 * every short one: partners, why-us and contact have well under a screen of
 * content, so the rule bought a tidy scroll with half a screen of white above
 * and below each of them, and the home page ran to 12,000px.
 *
 * Now the boundary is padding alone — generous, identical everywhere — and a
 * section is exactly as tall as what is in it.
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
      // Padding only — no one-screen minimum. Every section used to reserve
      // a full viewport and centre itself in it, which gave the short ones
      // (partners, why-us, contact) half a screen of white above and below
      // and made the home page 12,000px of mostly nothing. The rhythm now
      // comes from the padding, so a section is as tall as it needs to be.
      className={`relative scroll-mt-20 py-14 md:py-16 lg:py-20 ${className}`}
    >
      <Shell>{children}</Shell>
    </section>
  )
}

/**
 * The page's one `h1`, for search engines and screen readers.
 *
 * The inner pages carry no heading block any more — the client wanted the
 * content to start straight away — but a page still needs an h1, and the tab
 * title alone is not one.
 */
export function PageTitle({ children }: { children: string }) {
  return <h1 className="sr-only">{children}</h1>
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
/**
 * Headings in the two logo colours. A ` | ` in the copy marks the switch:
 * everything before it is brand blue, everything after it brand green
 * (`secondary`, the text-safe green — the lime is fills only). A title with
 * no marker keeps the plain heading colour.
 */
export function TwoTone({ text }: { text: string }) {
  const [lead, ...rest] = text.split(' | ')
  if (!rest.length) return <>{text}</>
  return (
    <>
      <span className="text-accent">{lead}</span>{' '}
      <span className="text-secondary">{rest.join(' ')}</span>
    </>
  )
}

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
      className={`reveal mt-4 max-w-3xl font-display text-[clamp(1.55rem,2.5vw,2.1rem)] leading-[1.18] font-semibold tracking-[-0.015em] text-pretty text-heading ${className}`}
    >
      {typeof children === 'string' ? <TwoTone text={children} /> : children}
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
      : 'border border-line text-heading hover:border-accent/60 hover:text-accent'

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
