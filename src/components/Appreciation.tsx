import { useCallback, useEffect, useState } from 'react'
import { APPRECIATION } from '../data/site'
import { useReveal } from '../lib/motion'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

/**
 * The appreciation letters — what the contractors wrote, and the letter itself.
 *
 * ── Why the quote leads, and the scan follows ────────────────────────────
 * A grid of three scanned A4 pages is unreadable at tile size and asks the
 * visitor to do the work of finding the sentence that matters. So each letter
 * is a card: who wrote it, when, the one line worth reading, and what the work
 * was. The scan is one tap away for anyone who wants to verify it, which is
 * the minority — but that minority is the reason the letters are here at all.
 *
 * ── Why the scans are redacted ───────────────────────────────────────────
 * These letters come from the group's own customers. Publishing a contractor's
 * letterhead publishes their switchboard, and the client does not want their
 * clients approached by everyone who browses this page. Every image in
 * /public/appreciation has the letterhead, footer, phone, email, website and
 * the signing officer's name painted out before export; the source PDFs sit in
 * /source-letters, outside public/, so the originals are never served. The
 * seal and signature stay — they are what make the page believable.
 */
export default function Appreciation() {
  const ref = useReveal<HTMLElement>({ stagger: 0.08 })
  const [open, setOpen] = useState<number | null>(null)

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback(
    (by: number) =>
      setOpen((i) => (i === null ? i : (i + by + APPRECIATION.items.length) % APPRECIATION.items.length)),
    [],
  )

  // Escape closes, arrows page. Bound while open only, so the page keeps its
  // own arrow-key scrolling the rest of the time.
  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, close, step])

  return (
    <Section id="appreciation" ref={ref}>
      <Eyebrow>{APPRECIATION.eyebrow}</Eyebrow>
      <SectionTitle>{APPRECIATION.title}</SectionTitle>
      <Lede>{APPRECIATION.lede}</Lede>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {APPRECIATION.items.map((item, i) => (
          <li key={item.id} className="reveal">
            {/* The whole card opens the letter. The scan is INSET rather than
                bled to the card edge: a letter is a sheet of paper, and paper
                on a page has a margin around it — bleeding it made the card
                look like a cropped screenshot. The inner frame is the sheet,
                the card padding is the desk it sits on. */}
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open the letter from ${item.company}, ${item.date}`}
              className="group/letter flex h-full w-full flex-col rounded-2xl border border-line/70 bg-raised/40 p-4 text-left transition-all duration-300 ease-micro hover:-translate-y-1 hover:border-accent/45 hover:bg-ground hover:shadow-[0_18px_44px_-30px_rgba(13,33,54,0.6)] sm:p-5"
            >
              <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg border border-line/60 bg-white shadow-[0_10px_26px_-20px_rgba(13,33,54,0.75)] transition-shadow duration-300 ease-micro group-hover/letter:shadow-[0_16px_34px_-20px_rgba(13,33,54,0.8)]">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-x-0 top-0 w-full transition-transform duration-500 ease-entrance group-hover/letter:scale-[1.02]"
                />
                {/* The sheet runs past the crop, so it fades out rather than
                    being guillotined mid-sentence. */}
                <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/85 to-transparent" />
                {/* The page keeps going past the crop; this is the edge of the
                    window onto it, not the edge of the paper. */}
                <span className="absolute inset-x-0 bottom-0 h-px bg-line/70" />
              </span>

              {/* A fixed floor under the name so the link rules line up
                  across the three cards however long a company name runs. */}
              <span className="mt-4 block px-1">
                <span className="flex items-baseline gap-4">
                  <span className="text-[0.78rem] font-semibold text-accent tabular-nums">
                    0{i + 1}
                  </span>
                  <span className="tech-sm text-body">{item.date}</span>
                </span>

                <span className="mt-2 block font-display text-[1.15rem] leading-tight font-semibold text-heading">
                  {item.company}
                </span>
                <span aria-hidden className="mt-3 block h-px w-8 bg-accent/70" />

                <span className="mt-3 block text-[0.85rem] leading-[1.6] text-body">
                  {item.scope}
                </span>
              </span>

              <span className="mt-auto flex items-center gap-2 px-1 pt-5 text-[0.8rem] font-medium text-accent transition-colors duration-200 ease-micro group-hover/letter:text-accent-glow">
                {APPRECIATION.cta}
                <svg
                  viewBox="0 0 24 24"
                  className="size-3 transition-transform duration-200 ease-micro group-hover/letter:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null ? <LetterView index={open} onClose={close} onStep={step} /> : null}
    </Section>
  )
}

/**
 * The letter at full size, on a dimmed page.
 *
 * `object-contain` in a viewport-bounded box: an A4 page cropped to fit would
 * defeat the only reason for opening it.
 */
function LetterView({
  index,
  onClose,
  onStep,
}: {
  index: number
  onClose: () => void
  onStep: (by: number) => void
}) {
  const item = APPRECIATION.items[index]
  // Fit-to-screen by default, actual size on demand: the seal and the
  // signature are the parts worth scrutinising, and at fit size they are
  // thumbnails. Zoomed, the figure scrolls in both directions.
  const [zoom, setZoom] = useState(false)

  // A different letter starts fitted again.
  useEffect(() => setZoom(false), [index])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Letter from ${item.company}`}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ground/92 p-4 backdrop-blur-md sm:p-8"
      onClick={onClose}
    >
      <figure
        className="relative flex max-h-full w-full max-w-4xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-full overflow-auto rounded-lg border border-line/60 bg-ground ${
            zoom ? 'max-h-[58svh]' : ''
          }`}
        >
          <img
            key={item.image}
            src={item.image}
            alt={item.imageAlt}
            width={item.width}
            height={item.height}
            onClick={() => setZoom((z) => !z)}
            className={
              zoom
                ? 'w-[min(1100px,150vw)] max-w-none cursor-zoom-out'
                : 'mx-auto max-h-[58svh] w-auto cursor-zoom-in object-contain'
            }
          />
        </div>

        <figcaption className="mt-5 max-w-2xl text-center">
          <p className="tech-sm text-accent">{item.date}</p>
          <p className="display-opsz mt-2 font-display text-[1.2rem] leading-tight text-heading">
            {item.company}
          </p>
          <blockquote className="mt-3 flex items-start justify-center gap-2.5">
            <QuoteMark />
            <p className="text-[0.98rem] leading-[1.55] text-heading">{item.quote}</p>
          </blockquote>
          <p className="mt-3 text-[0.88rem] leading-[1.7] text-body">{item.detail}</p>
          <p className="tech-sm mt-3 text-body">{item.scope}</p>
          <p className="mt-1.5 text-[0.82rem] leading-snug text-body">
            Contact details on the letterhead have been removed.{' '}
            <button
              type="button"
              onClick={() => setZoom((z) => !z)}
              className="font-medium text-accent transition-colors duration-200 ease-micro hover:text-accent-glow"
            >
              {zoom ? 'Fit to screen' : 'Zoom in'}
            </button>
          </p>
        </figcaption>

        <div className="mt-6 flex items-center gap-3">
          <Step dir="prev" onClick={() => onStep(-1)} />
          <span className="tech-sm text-body tabular-nums">
            {String(index + 1).padStart(2, '0')} /{' '}
            {String(APPRECIATION.items.length).padStart(2, '0')}
          </span>
          <Step dir="next" onClick={() => onStep(1)} />
        </div>
      </figure>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        autoFocus
        className="tap-44 absolute top-4 right-4 grid size-10 place-items-center rounded-full border border-line text-heading transition-colors duration-200 ease-micro hover:border-accent hover:text-accent sm:top-6 sm:right-6"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

function Step({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous letter' : 'Next letter'}
      className="tap-44 grid size-9 place-items-center rounded-full border border-line text-heading transition-colors duration-200 ease-micro hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" aria-hidden>
        <path
          d={dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function QuoteMark() {
  return (
    <svg viewBox="0 0 24 24" className="mt-1 size-5 shrink-0 text-secondary" fill="currentColor" aria-hidden>
      <path d="M9.5 5.5c-3.6 1.4-5.5 4-5.5 7.6V18.5h6.4v-6.1H7.2c0-2.3 1-3.9 2.9-4.8zM20.6 5.5c-3.6 1.4-5.5 4-5.5 7.6V18.5h6.4v-6.1h-3.2c0-2.3 1-3.9 2.9-4.8z" />
    </svg>
  )
}
