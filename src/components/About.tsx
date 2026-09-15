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
 * ── Why a justified gallery, and not a grid ─────────────────────────────
 * The six files are wildly different shapes — two 3:2 landscapes off a DSLR,
 * two phone portraits, a 16:9 video. Any layout with fixed tile heights has
 * to `object-cover` them, and on photographs whose entire subject is WHO is
 * standing on the stage, cover cut people's faces in half. A mosaic of
 * hand-chosen spans was the first attempt and it cropped just as badly, only
 * less predictably.
 *
 * So nothing is cropped here at all. Items are packed into rows whose widths
 * are proportional to each item's own aspect ratio — the newspaper/Flickr
 * trick: give every child `flex-grow: aspect` off a zero basis and set
 * `aspect-ratio` on the media, and the arithmetic falls out so that every
 * item in a row lands on exactly the same height while keeping its true
 * proportions. Rows are then full-bleed to the column with no ragged edge.
 *
 * Row breaks are computed, not hand-placed, so the client can add or remove
 * an award in the CMS without anyone re-composing a grid.
 *
 * ── The lightbox ─────────────────────────────────────────────────────────
 * Nothing is cropped in the gallery, but the certificate in `excellence` is
 * still only legible at full size, and the video has to play somewhere. Escape and the arrow keys work, the backdrop closes it, and focus is
 * put on the dialog so a keyboard is never stranded behind it.
 */

/**
 * Target aspect-sum for one row — effectively "how many landscape photos wide
 * a row should be". The container is ~950px in this column, so 3.9 puts rows
 * near 240px tall, which is enough to recognise a face and small enough that
 * six awards still sit inside one screen.
 */
const ROW_ASPECT = 3.9

type Award = (typeof ABOUT.awards)[number]

/**
 * Greedy row packer.
 *
 * Walks the list in order and closes a row when adding the next item would
 * take it further from ROW_ASPECT than stopping would. Order is preserved —
 * these are dated awards and reordering them to pack tighter would put 2018
 * before 2026.
 */
function packRows(items: readonly Award[]) {
  const rows: Award[][] = []
  let row: Award[] = []
  let sum = 0

  for (const item of items) {
    const aspect = item.width / item.height
    if (row.length && Math.abs(sum + aspect - ROW_ASPECT) > Math.abs(sum - ROW_ASPECT)) {
      rows.push(row)
      row = []
      sum = 0
    }
    row.push(item)
    sum += aspect
  }
  if (row.length) rows.push(row)
  return rows
}

const ROWS = packRows(ABOUT.awards)

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
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
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
                  <span className="block font-display text-[1.7rem] leading-none font-semibold text-heading tabular-nums">
                    {figure.value}
                  </span>
                  <span className="tech-sm mt-2.5 block text-body">{figure.label}</span>
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
            <p className="tech-sm text-body tabular-nums">
              {ABOUT.awards.length} awards · 2018–2026
            </p>
          </div>

          <div className="reveal mt-5 flex flex-col gap-3 sm:gap-4">
            {ROWS.map((row, r) => (
              <div key={r} className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                {row.map((award) => {
                  const i = ABOUT.awards.indexOf(award)
                  const aspect = award.width / award.height
                  return (
                    <button
                      key={award.id}
                      type="button"
                      onClick={() => setOpen(i)}
                      aria-label={`${award.title}, ${award.body}, ${award.date}. Open larger.`}
                      // The two arbitrary properties are what justify the row:
                      // width proportional to aspect off a zero basis, which
                      // lands every item in the row on one height.
                      style={{ ['--aspect' as string]: aspect }}
                      className="group relative block w-full overflow-hidden rounded-lg border border-line/50 bg-raised transition-colors duration-300 ease-micro hover:border-accent/60 sm:w-auto sm:[flex-basis:0] sm:[flex-grow:var(--aspect)]"
                    >
                      {award.kind === 'video' ? (
                        <video
                          src={award.src}
                          muted
                          playsInline
                          preload="metadata"
                          aria-label={award.alt}
                          style={{ aspectRatio: aspect }}
                          className="block w-full object-cover"
                        />
                      ) : (
                        <img
                          src={award.src}
                          alt={award.alt}
                          width={award.width}
                          height={award.height}
                          loading="lazy"
                          decoding="async"
                          style={{ aspectRatio: aspect }}
                          className="block w-full object-cover brightness-[0.92] transition-[filter] duration-500 ease-micro group-hover:brightness-100"
                        />
                      )}

                      {/* Shallow, and only over the bottom third: a full-height
                          wash on an uncropped photograph hides the faces the
                          crop was removed to protect. */}
                      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b1c30]/88 via-[#0b1c30]/35 to-transparent" />

                      <span className="absolute inset-x-0 bottom-0 p-2.5 text-left sm:p-3">
                        <span className="tech-sm block text-brand-lime">{award.date}</span>
                        <span className="mt-1 line-clamp-2 block text-[0.78rem] leading-tight font-medium text-white">
                          {award.title}
                        </span>
                      </span>

                      {award.kind === 'video' ? (
                        <span
                          aria-hidden
                          className="absolute top-2 right-2 grid size-7 place-items-center rounded-full border border-white/50 bg-[#0b1c30]/55 text-white backdrop-blur-sm transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white"
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
                  )
                })}
              </div>
            ))}
          </div>
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
          <span className="tech-sm text-body tabular-nums">
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
      aria-label={dir === 'prev' ? 'Previous award' : 'Next award'}
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
