import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

// Every GSAP plugin ships in the public npm package as of 3.13 — SplitText,
// DrawSVG, MorphSVG, Flip, ScrollSmoother, Inertia, CustomEase. No Club
// licence, no separate install. Register what the page actually uses; each
// import costs bundle size.
gsap.registerPlugin(ScrollTrigger, SplitText)

export { gsap, ScrollTrigger, SplitText }

/**
 * Read a staged travel distance off the root, so the CSS pre-state and the
 * GSAP tween share one number. Hardcoding it in both places is how a 24px
 * stage ends up animating from 26px — a 2px pop at the start of every reveal.
 */
export const stageDistance = (token: '--reveal-y' | '--entrance-y') =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token)) || 24

/**
 * Take an element out of its staged state, then drop the inline transform.
 *
 * Order matters and this is the whole bug it exists to prevent: `clearProps`
 * removes only the inline transform, so if the staged value is still matching
 * from a stylesheet rule it reasserts instantly and the element snaps back by
 * its full stage offset the moment the tween ends.
 *
 * An attribute rather than removing the class: React owns `className` and
 * would re-add `reveal` on its next render.
 */
const unstage = (el: Element) => {
  if (el instanceof HTMLElement) {
    el.dataset[el.hasAttribute('data-entrance') ? 'entered' : 'revealed'] = ''
  }
  // Clearing the transform matters for more than tidiness: a lingering
  // matrix() keeps the element on its own compositing layer, and Chrome then
  // skips repaints for images whose src changes inside it.
  gsap.set(el, { clearProps: 'transform' })
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Smooth scroll driven by Lenis, with ScrollTrigger on the same ticker. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // Anchor clicks ride the same easing as the wheel.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a[href^="#"]')
      if (!anchor) return
      const id = anchor.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target as HTMLElement, { offset: -72, duration: 1.4 })
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])
}

/**
 * The load choreography — the first ~1.2s, which is what separates a built
 * site from a template. Everything below the fold is `useReveal`; this is
 * only the first screen.
 *
 * Mark elements in the hero with `data-entrance`:
 *
 *   <p  data-entrance>            fade in place
 *   <p  data-entrance="rise">     fade + 22px rise
 *   <h1 data-entrance="lines">    split into lines, each swept up behind a mask
 *
 * They run in DOM order, each overlapping the one before. Override the spacing
 * on any element with `data-entrance-at="+=0.25"` (any GSAP position string).
 *
 * Rules this encodes:
 *   · nothing moves until fonts are in, or a line re-wraps mid-sweep
 *   · one direction of travel — everything rises, nothing arrives sideways
 *   · the 3D / hero media fades last, so type is readable before it competes
 *   · a 1.2s failsafe: a blocked font never leaves a blank page
 */
export function useEntrance<T extends HTMLElement>(delay = 0.15) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const targets = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-entrance]'))
    if (!targets.length) return

    if (prefersReducedMotion()) {
      targets.forEach(unstage)
      return
    }

    const splits: SplitText[] = []
    let ctx: gsap.Context | undefined
    let cancelled = false

    // Fonts change line-wrapping, so splitting before they land splits the
    // wrong text. The timeout is the failsafe, not the plan.
    const fontsReady = Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ])

    // A background tab has no rAF, so the timeline would sit frozen at frame
    // zero — with everything staged invisible. Wait for the visitor to
    // actually be looking, then play the whole sequence for them.
    const onScreen: Promise<unknown> = document.hidden
      ? new Promise((resolve) => {
          const onVisible = () => {
            if (document.hidden) return
            document.removeEventListener('visibilitychange', onVisible)
            resolve(undefined)
          }
          document.addEventListener('visibilitychange', onVisible)
        })
      : Promise.resolve()

    Promise.all([fontsReady, onScreen]).then(() => {
      if (cancelled) return

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ delay, defaults: { ease: 'expo.out' } })

        targets.forEach((el, i) => {
          // JSX renders a bare `data-entrance` as the string "true", so treat
          // that and the empty string as the default.
          const raw = el.dataset.entrance
          const kind = !raw || raw === 'true' ? 'fade' : raw
          // First element starts the timeline; the rest overlap the previous
          // one so the sequence reads as one gesture, not a queue.
          const at = el.dataset.entranceAt ?? (i === 0 ? 0 : '<0.09')

          if (kind === 'lines') {
            const split = SplitText.create(el, {
              type: 'lines',
              // `mask` wraps each line in its own overflow-hidden box, so the
              // line sweeps out from behind a matte instead of just sliding.
              mask: 'lines',
              linesClass: 'split-line',
              // Keeps the original text in the a11y tree — a screen reader
              // must not hear a headline one line at a time.
              aria: 'auto',
            })
            splits.push(split)

            gsap.set(el, { opacity: 1 })
            tl.fromTo(
              split.lines,
              { yPercent: 105 },
              {
                yPercent: 0,
                duration: 1.05,
                stagger: 0.08,
                clearProps: 'transform',
                onComplete: () => unstage(el),
              },
              at,
            )
          } else {
            tl.fromTo(
              el,
              { opacity: 0, y: kind === 'rise' ? stageDistance('--entrance-y') : 0 },
              {
                opacity: 1,
                y: 0,
                duration: 0.9,
                onComplete: () => unstage(el),
              },
              at,
            )
          }
        })
      }, root)

      // Split changes heights; anything already measured is now wrong.
      ScrollTrigger.refresh()
    })

    return () => {
      cancelled = true
      ctx?.revert()
      splits.forEach((s) => s.revert())
    }
  }, [delay])

  return ref
}

type RevealOptions = {
  selector?: string
  y?: number
  stagger?: number
  start?: string
  duration?: number
}

/**
 * Staggered scroll reveal. Attach the ref to a section, give children `.reveal`.
 * Reduced motion: children simply appear.
 */
export function useReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const ref = useRef<T>(null)
  const { selector = '.reveal', y, stagger = 0.08, start = 'top 82%', duration = 1 } = options

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const targets = root.querySelectorAll<HTMLElement>(selector)
    if (!targets.length) return

    if (prefersReducedMotion()) {
      targets.forEach(unstage)
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: y ?? stageDistance('--reveal-y') },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: 'expo.out',
          // Fires once the whole staggered set has finished. Un-staging an
          // element that is already at y:0 is visually a no-op, so doing them
          // together is safe and keeps one callback instead of N.
          onComplete: () => targets.forEach(unstage),
          scrollTrigger: { trigger: root, start },
        },
      )
    }, root)

    return () => ctx.revert()
  }, [selector, y, stagger, start, duration])

  return ref
}

/** Counts a number up when it scrolls into view. */
export function useCountUp(target: number, duration = 1.9, locale = 'en-IN') {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const format = (n: number) => Math.round(n).toLocaleString(locale)

    if (prefersReducedMotion()) {
      el.textContent = format(target)
      return
    }

    const state = { value: 0 }
    el.textContent = '0'

    const ctx = gsap.context(() => {
      gsap.to(state, {
        value: target,
        duration,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
        onUpdate: () => {
          el.textContent = format(state.value)
        },
      })
    }, el)

    return () => ctx.revert()
  }, [target, duration, locale])

  return ref
}

/** Scrubbed drift. Decorative layers only — never body copy. */
export function useParallax<T extends HTMLElement>(strength = 60) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: strength },
        {
          y: -strength,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [strength])

  return ref
}

/**
 * Pointer normalised to -1..1 around the viewport centre. Ref-based, so it
 * never re-renders the component that reads it.
 */
export function usePointer() {
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (prefersReducedMotion()) return

    const onMove = (e: PointerEvent) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return pointer
}

/**
 * True while the element is on screen, as STATE rather than a ref.
 *
 * `useOnScreen` below returns a ref, which is right for a `useFrame` callback
 * that reads it every frame but wrong for anything React has to re-render on —
 * a Canvas `frameloop`, for instance. Mirroring that ref into state with a
 * `setInterval` was the first attempt here, and it produced a genuinely stuck
 * stage: a page loaded in a background tab could latch `false` on one poll and
 * never be re-polled into `true`, leaving a mounted canvas that never rendered.
 *
 * Defaults to true so the first paint is never gated on the observer firing.
 */
export function useInView<T extends HTMLElement>(rootMargin = '200px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return [ref, inView] as const
}

/**
 * True while the element is on screen. Use it to stop 3D render loops and
 * anything else expensive when it cannot be seen.
 */
export function useOnScreen<T extends HTMLElement>(rootMargin = '120px') {
  const ref = useRef<T>(null)
  const visible = useRef(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting), {
      rootMargin,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return { ref, visible }
}
