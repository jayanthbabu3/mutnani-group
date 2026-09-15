import { useEffect, useRef, useState } from 'react'
import { VIDEOS } from '../data/site'
import { useReveal } from '../lib/motion'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

/**
 * Site videos — one player, and a filmstrip of every clip under it.
 *
 * Thirteen clips across seven sites. A grid of thirteen embeds is a wall of
 * identical red buttons and, on load, thirteen YouTube players nobody asked
 * for. One stage with every clip one tap away does the same job.
 *
 * ── Why a filmstrip, not a sidebar ───────────────────────────────────────
 * The sidebar playlist was tried twice. As per-site thumbnail grids it was
 * ragged — one clip beside two empty cells. As a list of rows it repeated
 * "Belgaum · Karnataka" on three consecutive lines inside a tinted box
 * inside a bordered card, which is a lot of chrome for a list of pictures.
 *
 * A strip under the stage says each site's name ONCE, above its own clips,
 * and lets the thumbnails be the content. The stage gets the full width of
 * the block, which is what footage of a site actually wants.
 *
 * Nothing is fetched from YouTube until play is pressed. The stage paints the
 * clip's own thumbnail; the iframe (youtube-nocookie) is mounted on the first
 * press and swapped in place after that — one player, once.
 */
type Clip = { youtubeId: string; siteName: string; place: string; n: number; total: number }

const CLIPS: Clip[] = VIDEOS.sites.flatMap((site) =>
  site.videos.map((v, i) => ({
    youtubeId: v.youtubeId,
    siteName: site.name,
    place: site.place,
    n: i + 1,
    total: site.videos.length,
  })),
)

export default function SiteVideos() {
  const ref = useReveal<HTMLElement>({ stagger: 0.08 })
  const [active, setActive] = useState<Clip>(CLIPS[0])
  // Set once, on the first play, and never cleared: from then on picking a
  // clip swaps the iframe src instead of going back to a poster.
  const [armed, setArmed] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)

  const index = CLIPS.findIndex((c) => c.youtubeId === active.youtubeId)

  // Which way the strip can still scroll. An arrow that does nothing reads as
  // broken, so each one only shows while there is something beyond it.
  const [edges, setEdges] = useState({ left: false, right: false })
  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const update = () =>
      setEdges({
        left: strip.scrollLeft > 4,
        right: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 4,
      })
    update()
    strip.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      strip.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  // A page of thumbnails at a time, leaving a sliver of the last one in view
  // so the eye keeps its place.
  const scrollStrip = (dir: 1 | -1) =>
    stripRef.current?.scrollBy({
      left: dir * stripRef.current.clientWidth * 0.8,
      behavior: 'smooth',
    })

  // Keep the active thumbnail in view when the arrows step past the edge of
  // the strip. Scrolls the strip only — `scrollIntoView` would also drag the
  // whole page vertically to the section.
  useEffect(() => {
    const strip = stripRef.current
    const tile = strip?.querySelector<HTMLElement>('[aria-current]')
    if (!strip || !tile) return
    const left = tile.offsetLeft - strip.clientWidth / 2 + tile.clientWidth / 2
    strip.scrollTo({ left, behavior: 'smooth' })
  }, [active])

  const pick = (clip: Clip) => {
    setActive(clip)
    setArmed(true)
  }
  // Wraps at both ends — thirteen clips is a loop, not a line.
  const step = (by: 1 | -1) => pick(CLIPS[(index + by + CLIPS.length) % CLIPS.length])

  return (
    <Section id="videos" ref={ref}>
      <div className="mx-auto max-w-3xl text-center">
        <div className="flex justify-center">
          <Eyebrow>{VIDEOS.eyebrow}</Eyebrow>
        </div>
        <SectionTitle className="mx-auto">{VIDEOS.title}</SectionTitle>
        <Lede className="mx-auto">{VIDEOS.lede}</Lede>
      </div>

      <div className="mx-auto mt-12 max-w-[64rem]">
        {/* ── The stage ─────────────────────────────────────────────────── */}
        <div className="reveal relative aspect-video overflow-hidden rounded-2xl bg-heading">
          {armed ? (
            <iframe
              key={active.youtubeId}
              className="absolute inset-0 size-full"
              src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={`${active.siteName} — video ${active.n}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => pick(active)}
              className="group relative size-full"
              aria-label={`Play ${active.siteName}, video ${active.n} of ${active.total}`}
            >
              <img
                key={active.youtubeId}
                src={`https://i.ytimg.com/vi/${active.youtubeId}/maxresdefault.jpg`}
                onError={(e) => {
                  // Not every upload has a 1280px poster; fall back to the
                  // 480px one YouTube always generates rather than a grey box.
                  const img = e.currentTarget
                  if (!img.src.endsWith('hqdefault.jpg')) {
                    img.src = `https://i.ytimg.com/vi/${active.youtubeId}/hqdefault.jpg`
                  }
                }}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-entrance group-hover:scale-[1.02]"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-[4.5rem] items-center justify-center rounded-full border-[3px] border-white bg-accent text-white transition-transform duration-300 ease-micro group-hover:scale-105">
                  <PlayIcon />
                </span>
              </span>
            </button>
          )}
        </div>

        {/* ── Now playing ───────────────────────────────────────────────── */}
        <div className="reveal mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div>
            <p className="display-opsz font-display text-[1.35rem] leading-tight text-heading">
              {active.siteName}
            </p>
            <p className="tech-sm mt-1.5 text-body">
              {active.place ? `${active.place} · ` : ''}
              video {active.n} of {active.total}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="tech-sm mr-2 text-body tabular-nums">
              {String(index + 1).padStart(2, '0')} / {String(CLIPS.length).padStart(2, '0')}
            </span>
            <StepButton dir="prev" onClick={() => step(-1)} />
            <StepButton dir="next" onClick={() => step(1)} />
          </div>
        </div>

        {/* ── The filmstrip ─────────────────────────────────────────────── */}
        <div className="relative">
          <div
            ref={stripRef}
            className="reveal mt-8 flex snap-x gap-8 overflow-x-auto border-t border-line pt-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {VIDEOS.sites.map((site) => (
              <div key={site.id} className="shrink-0 snap-start">
                <p className="flex items-baseline gap-2">
                  <span className="text-[0.95rem] font-semibold text-heading">{site.name}</span>
                  {site.place ? (
                    <span className="text-[0.8rem] text-body">{site.place}</span>
                  ) : null}
                </p>
                <ul className="mt-3 flex gap-2.5">
                  {site.videos.map((v, i) => {
                    const clip = CLIPS.find((c) => c.youtubeId === v.youtubeId)!
                    const isActive = active.youtubeId === v.youtubeId
                    return (
                      <li key={v.youtubeId}>
                        <button
                          type="button"
                          onClick={() => pick(clip)}
                          aria-current={isActive ? 'true' : undefined}
                          aria-label={`Play ${site.name}, video ${i + 1} of ${site.videos.length}`}
                          className="group/tile block w-40 text-left sm:w-44"
                        >
                          <span
                            className={`relative block aspect-video overflow-hidden rounded-lg transition-all duration-300 ease-micro ${
                              isActive
                                ? 'ring-2 ring-accent ring-offset-2 ring-offset-ground'
                                : 'ring-1 ring-line group-hover/tile:ring-2 group-hover/tile:ring-accent/60'
                            }`}
                          >
                            <img
                              src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 size-full object-cover"
                            />
                            {isActive && armed ? (
                              <span
                                className="absolute right-1.5 bottom-1.5 flex items-end gap-[2px] rounded bg-accent px-1 py-0.5"
                                aria-hidden
                              >
                                <span className="eq-bar h-2 w-[2px] bg-white" />
                                <span className="eq-bar h-3 w-[2px] bg-white [animation-delay:120ms]" />
                                <span className="eq-bar h-1.5 w-[2px] bg-white [animation-delay:240ms]" />
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <StripArrow dir="prev" visible={edges.left} onClick={() => scrollStrip(-1)} />
          <StripArrow dir="next" visible={edges.right} onClick={() => scrollStrip(1)} />
        </div>
      </div>
    </Section>
  )
}

function StripArrow({
  dir,
  visible,
  onClick,
}: {
  dir: 'prev' | 'next'
  visible: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label={dir === 'prev' ? 'Scroll clips left' : 'Scroll clips right'}
      // Centred on the thumbnail row (below the site label), and nudged just
      // outside the strip on wide screens so it never sits on a thumbnail.
      className={`absolute top-[60%] z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-ground text-heading shadow-[0_6px_18px_-8px_rgba(13,33,54,0.35)] transition-all duration-200 ease-micro hover:border-accent hover:text-accent ${
        dir === 'prev' ? 'left-2 lg:-left-6' : 'right-2 lg:-right-6'
      } ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" aria-hidden>
        <path
          d={dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function StepButton({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous video' : 'Next video'}
      className="tap-44 flex size-9 items-center justify-center rounded-full border border-line text-heading transition-colors duration-200 ease-micro hover:border-accent hover:text-accent"
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

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 translate-x-0.5" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  )
}
