import { useEffect, useRef, useState } from 'react'
import { VIDEOS } from '../data/site'
import { useReveal } from '../lib/motion'
import { Eyebrow, Lede, Section, SectionTitle } from './ui'

/**
 * Site videos — one player, a playlist grouped by site.
 *
 * Thirteen clips across seven sites. A grid of thirteen embeds is a wall of
 * identical red buttons and, on load, thirteen YouTube players nobody asked
 * for. One large stage with a site-by-site list beside it does the job of a
 * grid — every clip is one tap away — while reading as a single piece of
 * evidence: this is the group's work, at these places.
 *
 * Nothing is fetched from YouTube until play is pressed. The stage paints
 * the clip's own thumbnail; the iframe (youtube-nocookie) is mounted only on
 * the first press and swapped in place for every clip after — so the visitor
 * pays for one player, once. Thumbnails in the list are `mqdefault`, the
 * 320px size, which is all a 90px tile needs.
 *
 * Grouping is by SITE, not by clip, because that is the claim: not "we have
 * videos" but "we were at Belgaum, Kodangal, Sileru, Shimla". Site names and
 * places are content — a wrong label is fixed in site.json.
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

  const index = CLIPS.findIndex((c) => c.youtubeId === active.youtubeId)
  const listRef = useRef<HTMLOListElement>(null)

  // Stepping with the arrows can land on a clip that is scrolled out of the
  // playlist; bring it into view so the gold ring is always visible.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[aria-current]')
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [active])

  const pick = (clip: Clip) => {
    setActive(clip)
    setArmed(true)
  }
  // Wraps at both ends — thirteen clips is a loop, not a line.
  const step = (by: 1 | -1) => pick(CLIPS[(index + by + CLIPS.length) % CLIPS.length])

  return (
    <Section id="videos" ref={ref}>
      <Eyebrow>{VIDEOS.eyebrow}</Eyebrow>
      <SectionTitle>{VIDEOS.title}</SectionTitle>
      <Lede>{VIDEOS.lede}</Lede>
      <p className="reveal tech-sm mt-5 text-accent/85">
        {CLIPS.length} clips · {VIDEOS.sites.length} sites
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-10">
        {/* The stage. */}
        <div className="reveal">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-line/70 bg-ground shadow-[0_32px_64px_-28px_rgba(0,0,0,0.7)]">
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
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-entrance group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ground/70 to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-[4.5rem] items-center justify-center rounded-full border border-heading/40 bg-ground/45 text-heading backdrop-blur-sm transition-all duration-300 ease-micro group-hover:border-accent group-hover:bg-accent group-hover:text-ground">
                    <PlayIcon />
                  </span>
                </span>
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div>
              <p className="display-opsz font-display text-[1.35rem] leading-tight text-heading">
                {active.siteName}
              </p>
              <p className="tech-sm mt-1.5 text-body/70">
                {active.place ? `${active.place} · ` : ''}
                video {active.n} of {active.total}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="tech-sm mr-2 text-body/60 tabular-nums">
                {String(index + 1).padStart(2, '0')} / {String(CLIPS.length).padStart(2, '0')}
              </span>
              <StepButton dir="prev" onClick={() => step(-1)} />
              <StepButton dir="next" onClick={() => step(1)} />
            </div>
          </div>
        </div>

        {/* The playlist, grouped by site. Its own scroll on desktop so the
            list never pushes the stage off the screen. */}
        <div className="relative lg:min-h-0">
          <ol
            ref={listRef}
            className="playlist-scroll reveal max-h-[34rem] space-y-6 overflow-y-auto pr-4 pb-12 lg:absolute lg:inset-0 lg:max-h-none"
          >
            {VIDEOS.sites.map((site) => (
              <li key={site.id}>
                <div className="flex items-baseline justify-between gap-4 border-b border-line/60 pb-2">
                  <p className="text-[0.95rem] font-medium text-heading">{site.name}</p>
                  <p className="tech-sm text-body/60">
                    {site.place || `${site.videos.length} clip${site.videos.length > 1 ? 's' : ''}`}
                  </p>
                </div>
                <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-3">
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
                          className={`group relative block aspect-video w-full overflow-hidden rounded-lg border bg-ground transition-all duration-300 ease-micro ${
                            isActive
                              ? 'border-accent shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-accent)_25%,transparent)]'
                              : 'border-line/60 hover:border-heading/40'
                          }`}
                        >
                          <img
                            src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
                              isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                            }`}
                          />
                          <span className="absolute bottom-1 left-1.5 rounded bg-ground/75 px-1.5 py-0.5 text-[0.6rem] font-medium tracking-[0.12em] text-heading/85 tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {isActive && armed ? (
                            <span
                              className="absolute top-1.5 right-1.5 flex items-end gap-[2px]"
                              aria-hidden
                            >
                              <span className="eq-bar h-2 w-[2px] bg-accent" />
                              <span className="eq-bar h-3 w-[2px] bg-accent [animation-delay:120ms]" />
                              <span className="eq-bar h-1.5 w-[2px] bg-accent [animation-delay:240ms]" />
                            </span>
                          ) : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  )
}

function StepButton({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous video' : 'Next video'}
      className="tap-44 flex size-9 items-center justify-center rounded-full border border-line text-heading/80 transition-colors duration-200 ease-micro hover:border-accent hover:text-accent"
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
