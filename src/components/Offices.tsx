import { OFFICES } from '../data/site'

/**
 * The two office cards — address, role and a map — shared by the "why us"
 * section on the home page and by the Contact page.
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
 * The tiles are Google's own light style, unfiltered — on a white page that
 * is simply correct. `.map-frame` in index.css only seats them in the card.
 */
export function OfficeCard({ office }: { office: (typeof OFFICES)[number] }) {
  const q = encodeURIComponent(office.mapQuery)
  const embed = `https://www.google.com/maps?q=${q}&z=15&output=embed`
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${q}`

  return (
    <address className="reveal grid overflow-hidden rounded-2xl border border-line/70 bg-raised/40 not-italic sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="map-frame relative aspect-[16/9] w-full bg-ground sm:aspect-auto sm:min-h-[15rem]">
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
        <p className="mt-3.5 text-[0.9rem] leading-[1.65] text-heading">
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
