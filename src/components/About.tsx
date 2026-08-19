import { useCallback, useEffect, useState } from 'react'
import { ABOUT, whatsappHref } from '../data/site'
import { useReveal } from '../lib/motion'
import { CtaLink, Eyebrow, Section, SectionTitle } from './ui'

/**
 * Who the group is, told through what it has been given.
 *
 * This was a photograph-beside-a-paragraph block — the layout every company
 * site in this trade already uses, which is exactly why it read as somebody
 * else's template. What replaced it is not a restyling of that: the awards
 * ARE the section now. Six of them, real and dated, from Birla Aerocon in
 * 2018 to two Global India Business Forum awards in 2026, one of them
 * presented by the Governor of Telangana.
 *
 * That matters more than a stock-looking hero photo, because a certificate
 * being handed over on a stage is third-party proof. Nobody has to take the
 * group's word for it, which is the whole job of an About section.
 *
 * ── Why a mosaic and not a rail ──────────────────────────────────────────
 * The six files are wildly different shapes — two 3:2 landscapes off a DSLR,
 * two phone portraits, a vertical video. A uniform grid crops the portraits
 * to strips and beheads people; a same-height rail leaves the landscapes
 * enormous next to the phone shots. The mosaic gives each tile a span chosen
 * for its own aspect, so nothing important is ever cropped out, and the
 * result is deliberately irregular — a wall of framed things, which is what
 * it is.
 *
 * Tile spans live here rather than in content: they are a composition, not a
 * fact about an award, and a client reordering the list in a CMS should not
 * have to think about a grid.
 *
 * ── The lightbox ─────────────────────────────────────────────────────────
 * Tiles are cropped to fit the mosaic, so there has to be a way to see the
 * whole frame — and the certificate in `excellence` is only legible full
 * size. Escape and the arrow keys work, the backdrop closes it, and focus is
 * put on the dialog so a keyboard is never stranded behind it.
 */

/** Grid spans per tile, by index. See the note above on why these are here. */
const TILE = [
  // The framed certificate — portrait, and the one worth reading, so it gets
  // the full-height column on the left.
  'col-span-2 row-span-2',
  // Global Leaders, landscape.
  'col-span-4 row-span-1',
  // India–Asia, landscape.
  'col-span-4 row-span-1',
  // The video, portrait.
  'col-span-2 row-span-1',
  // India–China, portrait-ish.
  'col-span-2 row-span-1',
  // HIL 2018–19, landscape — the oldest, so it closes the wall.
  'col-span-2 row-span-1',
]

export default function About() {
  const ref = useReveal<HTMLElement>({ stagger: 0.06 })
  const [open, setOpen] = useState<number | null>(null)

  const step = useCallback(
    (by: number) =>
      setOpen((i) => (i === null ? i : (i + by + ABOUT.awards.length) % ABOUT.awards.length)),
    [],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    // The page must not scroll behind an open lightbox — on a phone that
    // reads as the dialog sliding off rather than the page moving.
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, step])

  return (
    <Section id="about" ref={ref}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        {/* ── The story ───────────────────────────────────────────────── */}
        <div>
          <Eyebrow>{ABOUT.eyebrow}</Eyebrow>
          <SectionTitle>{ABOUT.title}</SectionTitle>

          <div className="reveal mt-6 space-y-4">
            {ABOUT.body.map((para) => (
              <p key={para} className="max-w-xl text-[0.92rem] leading-[1.75] text-body">
                {para}
              </p>
            ))}
          </div>

          <dl className="reveal mt-9 grid max-w-xl grid-cols-3 gap-6 border-t border-line/60 pt-7">
            {ABOUT.figures.map((figure) => (
              <div key={figure.label}>
                <dt className="sr-only">{figure.label}</dt>
                <dd>
                  <span className="display-opsz block font-display text-[1.7rem] leading-none font-normal text-heading tabular-nums">
                    {figure.value}
                  </span>
                  <span className="tech-sm mt-2.5 block text-body/70">{figure.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <CtaLink href={whatsappHref()} external className="reveal mt-8">
            {ABOUT.cta}
          </CtaLink>
        </div>

        {/* ── The wall ────────────────────────────────────────────────── */}
        <div>
          <div className="reveal flex items-baseline justify-between gap-4 border-b border-line/60 pb-3">
            <p className="tech flex items-center gap-3 text-accent/85">
              <span className="h-px w-6 bg-accent/50" />
              {ABOUT.awardsEyebrow}
            </p>
            <p className="tech-sm text-body/60 tabular-nums">
              {ABOUT.awards.length} awards · 2018–2026
            </p>
          </div>

          <ul className="reveal mt-5 grid auto-rows-[7.5rem] grid-cols-4 gap-2.5 sm:auto-rows-[8.5rem] sm:grid-cols-6 sm:gap-3">
            {ABOUT.awards.map((award, i) => (
              <li key={award.id} className={TILE[i] ?? 'col-span-2 row-span-1'}>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`${award.title}, ${award.body}, ${award.date}. Open larger.`}
                  className="group relative block size-full overflow-hidden rounded-lg border border-line/50 bg-raised transition-colors duration-300 ease-micro hover:border-accent/60"
                >
                  {award.kind === 'video' ? (
                    <video
                      src={award.src}
                      muted
                      playsInline
                      preload="metadata"
                      aria-label={award.alt}
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-micro group-hover:scale-[1.05]"
                    />
                  ) : (
                    <img
                      src={award.src}
                      alt={award.alt}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-micro group-hover:scale-[1.05]"
                    />
                  )}

                  {/* Enough wash to carry the date at any exposure — these are
                      stage photographs and their corners are unpredictable. */}
                  <span className="absolute inset-0 bg-gradient-to-t from-ground/90 via-ground/15 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-75" />

                  <span className="absolute inset-x-0 bottom-0 p-2.5 text-left sm:p-3">
                    <span className="tech-sm block text-accent">{award.date}</span>
                    <span className="mt-1 block truncate text-[0.78rem] leading-tight font-medium text-heading">
                      {award.title}
                    </span>
                  </span>

                  {award.kind === 'video' ? (
                    <span
                      aria-hidden
                      className="absolute top-2 right-2 grid size-7 place-items-center rounded-full border border-heading/40 bg-ground/60 text-heading backdrop-blur-sm transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-ground"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="size-3 translate-x-px"
                        fill="currentColor"
                      >
                        <path d="M8 5.5v13l11-6.5z" />
                      </svg>
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {open !== null ? <Lightbox index={open} onClose={() => setOpen(null)} onStep={step} /> : null}
    </Section>
  )
}

/**
 * The full frame, uncropped.
 *
 * `object-contain` inside a viewport-bounded box, never `cover`: the whole
 * point of opening this is to see what the mosaic had to crop, and a portrait
 * certificate cropped a second time would be worse than the tile.
 */
function Lightbox({
  index,
  onClose,
  onStep,
}: {
  index: number
  onClose: () => void
  onStep: (by: number) => void
}) {
  const award = ABOUT.awards[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${award.title} — ${award.body}`}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ground/92 p-4 backdrop-blur-md sm:p-8"
      onClick={onClose}
    >
      {/* Stops a click on the media itself from closing behind it. */}
      <figure
        className="relative flex max-h-full w-full max-w-5xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {award.kind === 'video' ? (
          <video
            key={award.src}
            src={award.src}
            controls
            autoPlay
            playsInline
            aria-label={award.alt}
            className="max-h-[70svh] w-auto max-w-full rounded-lg border border-line/60"
          />
        ) : (
          <img
            key={award.src}
            src={award.src}
            alt={award.alt}
            className="max-h-[70svh] w-auto max-w-full rounded-lg border border-line/60 object-contain"
          />
        )}

        <figcaption className="mt-5 max-w-2xl text-center">
          <p className="tech-sm text-accent">{award.date}</p>
          <p className="display-opsz mt-2 font-display text-[1.35rem] leading-tight text-heading">
            {award.title}
          </p>
          <p className="mt-1.5 text-[0.85rem] leading-snug text-body">{award.body}</p>
        </figcaption>

        <div className="mt-6 flex items-center gap-3">
          <Step dir="prev" onClick={() => onStep(-1)} />
          <span className="tech-sm text-body/60 tabular-nums">
            {String(index + 1).padStart(2, '0')} / {String(ABOUT.awards.length).padStart(2, '0')}
          </span>
          <Step dir="next" onClick={() => onStep(1)} />
        </div>
      </figure>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        autoFocus
        className="tap-44 absolute top-4 right-4 grid size-10 place-items-center rounded-full border border-line text-heading/80 transition-colors duration-200 ease-micro hover:border-accent hover:text-accent sm:top-6 sm:right-6"
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
      aria-label={dir === 'prev' ? 'Previous award' : 'Next award'}
      className="tap-44 grid size-9 place-items-center rounded-full border border-line text-heading/80 transition-colors duration-200 ease-micro hover:border-accent hover:text-accent"
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
