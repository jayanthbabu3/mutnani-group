/**
 * The logo preloader: a white screen, the mark revealed like a title card with
 * the tagline and a brand line under it, then the whole screen fades away.
 *
 * The markup and its CSS live in index.html, not in React. That is the point
 * of a preloader: it has to paint before this bundle has even downloaded, and
 * anything rendered by React appears only after the thing it was meant to
 * cover. This module only decides WHEN it clears.
 *
 *   · never before MIN — a flash of logo reads as a glitch, not an entrance
 *   · never after MAX — whatever the network does, nobody waits on a logo
 *   · not at all under prefers-reduced-motion (index.html CSS hides it too)
 *   · index.html carries its own 4s failsafe, so a bundle that never loads
 *     cannot leave the visitor stuck behind the logo
 */

/** Long enough for the title card (mark, sheen, tagline, line) to finish. */
const MIN = 1700
const MAX = 3000
/** The title card blurs away for this long before the screen fades. */
const CLEAR_MS = 350
/** Screen fade in index.html is 0.6s; remove the node just after. */
const REMOVE_AFTER = 700

let resolveOpen!: () => void
const opened = new Promise<void>((resolve) => {
  resolveOpen = resolve
})

/**
 * Resolves the moment the screen starts to fade. The hero's entrance waits on
 * this so its headline sweep plays in front of the visitor, not behind the logo.
 */
export const whenPreloaderOpen = () => opened

export function startPreloader() {
  const pre = document.getElementById('preloader')
  const root = document.documentElement
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!pre || reduced) {
    root.classList.remove('is-loading')
    pre?.remove()
    resolveOpen()
    return
  }

  let done = false
  const open = () => {
    if (done) return
    done = true
    // Two beats: the title card clears, then the white screen fades out.
    pre.classList.add('is-opening')
    window.setTimeout(() => {
      pre.classList.add('is-open')
      root.classList.remove('is-loading')
      resolveOpen()
      window.setTimeout(() => pre.remove(), REMOVE_AFTER)
    }, CLEAR_MS)
  }

  // performance.now() counts from navigation start, which is when the logo
  // first painted — so MIN is measured from what the visitor actually saw.
  const ready = () => window.setTimeout(open, Math.max(0, MIN - performance.now()))

  if (document.readyState === 'complete') ready()
  else window.addEventListener('load', ready, { once: true })
  window.setTimeout(open, MAX)
}
