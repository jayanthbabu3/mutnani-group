import { OFFICES, TRUST } from '../data/site'
import { useReveal } from '../lib/motion'
import { Eyebrow, Section, SectionTitle } from './ui'

/**
 * Why the group gets asked back, plus both addresses.
 *
 * The offices sit here rather than only in the footer: for a B2B buyer,
 * "which of these two cities is going to run my project" is a qualifying
 * question, not a contact detail.
 *
 * Each office card carries a live map tile beside the address. It is Google's
 * keyless embed (`maps?q=…&output=embed`), which needs no API key and no
 * script — just an iframe — and it is INERT: pointer-events are off, so it
 * cannot trap the wheel while Lenis is scrolling the page, and it never
 * becomes a maze of controls inside a card. It is a locator, not an app.
 * The real action is the "Open in Google Maps" link under it, which hands
 * off to the visitor's own maps with directions ready. `loading="lazy"` keeps
 * the two Google requests out of the critical path.
 *
 * Google's tiles are light; `.map-dark` in index.css inverts and re-hues
 * them so the tile sits on the navy instead of punching a white hole in it.
 */
export default function Trust() {
  const ref = useReveal<HTMLElement>({ stagger: 0.08 })

  return (
    <Section id="why-us" ref={ref}>
      <Eyebrow>{TRUST.eyebrow}</Eyebrow>
      <SectionTitle>{TRUST.title}</SectionTitle>

      {/* Points run as one strip across the full width, offices as two
          landscape cards under them. It was points-left / offices-right, and
          two stacked map cards made the right column twice the height of the
          left — a tall empty column beside a tall full one. Rows keep every
          band the width of the page and the section close to one screen. */}
      <dl className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST.points.map((point) => (
          <div key={point.title} className="reveal border-t border-line/60 pt-5">
            <dt className="display-opsz font-display text-[1.15rem] leading-tight font-normal text-heading">
              {point.title}
            </dt>
            <dd className="mt-3 text-[0.88rem] leading-[1.7] text-body">{point.body}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {OFFICES.map((office) => (
          <OfficeCard key={office.id} office={office} />
        ))}
      </div>
    </Section>
  )
}

function OfficeCard({ office }: { office: (typeof OFFICES)[number] }) {
  const q = encodeURIComponent(office.mapQuery)
  const embed = `https://www.google.com/maps?q=${q}&z=15&output=embed`
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${q}`

  return (
    <address className="reveal grid overflow-hidden rounded-2xl border border-line/70 bg-raised/40 not-italic sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="map-dark relative aspect-[16/9] w-full bg-ground sm:aspect-auto sm:min-h-[15rem]">
        <iframe
          src={embed}
          title={`Map of ${office.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
        />
      </div>

      <div className="flex flex-col p-6">
        <p className="tech-sm text-accent">{office.name}</p>
        <p className="mt-3.5 text-[0.9rem] leading-[1.65] text-heading/85">
          {office.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line/60 pt-3.5">
          <p className="text-[0.82rem] text-body">{office.role}</p>
          <a
            href={directions}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-accent transition-colors duration-200 ease-micro hover:text-accent-glow"
          >
            Open in Google Maps
            <svg
              viewBox="0 0 24 24"
              className="size-3"
              fill="none"
              stroke="currentColor"
              aria-hidden
            >
              <path d="M7 17 17 7m0 0H9m8 0v8" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </a>
        </div>
      </div>
    </address>
  )
}
