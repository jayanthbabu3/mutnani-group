import { useCallback, useEffect, useState } from 'react'
import { VIDEOS } from '../data/site'
import { useReveal } from '../lib/motion'
import { Eyebrow, Section, SectionTitle } from './ui'

/**
 * One company's footage, as a grid, on that company's own page.
 *
 * The home page has the player with a filmstrip under it, because there it is
 * one band inside a long scroll. A company's page is already about that
 * company, so every clip it has can be on screen at once: a tile each, and a
 * modal for the one being watched.
 *
 * Nothing is fetched from YouTube until a tile is pressed — the grid is
 * thumbnails, and only the open clip mounts a player.
 */

type Clip = { youtubeId: string; siteName: string; place: string }

const clipsIn = (group: string): Clip[] =>
  VIDEOS.sites
    .filter((site) => site.group === group)
    .flatMap((site) =>
      site.videos.map((v) => ({
        youtubeId: v.youtubeId,
        siteName: site.name,
        place: site.place,
      })),
    )

export default function VideoGrid({ group }: { group: string }) {
  const meta = VIDEOS.groups.find((g) => g.id === group)
  const [clips] = useState(() => clipsIn(group))
  const [open, setOpen] = useState<number | null>(null)
  const ref = useReveal<HTMLElement>({ stagger: 0.05 })

  const step = useCallback(
    (by: number) => setOpen((i) => (i === null ? i : (i + by + clips.length) % clips.length)),
    [clips.length],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
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
  }, [open, step])

  // A company with no footage yet shows nothing at all, rather than a heading
  // over an empty grid.
  if (!meta || clips.length === 0) return null

  return (
    <Section className="!min-h-0 !py-14 md:!block lg:!py-16" ref={ref}>
      <Eyebrow>{VIDEOS.eyebrow}</Eyebrow>
      <SectionTitle>{meta.heading}</SectionTitle>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clips.map((clip, i) => (
          <li key={clip.youtubeId}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Play ${clip.siteName}${clip.place ? `, ${clip.place}` : ''}`}
              className="group/tile reveal block w-full text-left"
            >
              <span className="relative block aspect-video overflow-hidden rounded-xl bg-heading ring-1 ring-line transition-all duration-300 ease-micro group-hover/tile:ring-2 group-hover/tile:ring-accent/60">
                <img
                  src={`https://i.ytimg.com/vi/${clip.youtubeId}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-entrance group-hover/tile:scale-[1.03]"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-12 place-items-center rounded-full border-2 border-white bg-accent text-white transition-transform duration-300 ease-micro group-hover/tile:scale-105">
                    <PlayIcon />
                  </span>
                </span>
              </span>
              <span className="mt-3 block text-[0.9rem] font-medium text-heading">
                {clip.siteName}
              </span>
              {clip.place ? (
                <span className="tech-sm mt-1 block text-body">{clip.place}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {open !== null ? (
        <Player
          clip={clips[open]}
          onClose={() => setOpen(null)}
          onStep={step}
          many={clips.length > 1}
        />
      ) : null}
    </Section>
  )
}

function Player({
  clip,
  onClose,
  onStep,
  many,
}: {
  clip: Clip
  onClose: () => void
  onStep: (by: number) => void
  many: boolean
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${clip.siteName} video`}
      onClick={onClose}
      className="fixed inset-0 z-[90] grid place-items-center bg-heading/92 p-4 backdrop-blur-sm sm:p-8"
    >
      {/* Capped by the viewport as well as by width: at 64rem the player is
          576px tall, which on a short laptop window pushed its own caption
          and controls off the bottom of the screen. */}
      <div className="w-full max-w-[min(64rem,135svh)]" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
          <iframe
            key={clip.youtubeId}
            src={`https://www.youtube-nocookie.com/embed/${clip.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={clip.siteName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-[0.9rem] text-white">
            {clip.siteName}
            {clip.place ? <span className="ml-2 text-white/60">{clip.place}</span> : null}
          </p>
          <div className="flex items-center gap-2">
            {many ? (
              <>
                <RoundButton label="Previous video" onClick={() => onStep(-1)} flip />
                <RoundButton label="Next video" onClick={() => onStep(1)} />
              </>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/35 px-4 py-2 text-[0.78rem] font-medium text-white transition-colors duration-200 ease-micro hover:border-white hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoundButton({
  label,
  onClick,
  flip,
}: {
  label: string
  onClick: () => void
  flip?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full border border-white/35 text-white transition-colors duration-200 ease-micro hover:border-white hover:bg-white/10"
    >
      <svg
        viewBox="0 0 24 24"
        className={`size-3.5 ${flip ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        aria-hidden
      >
        <path d="M4 12h15m0 0-6-6m6 6-6 6" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 translate-x-px" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  )
}
