import { Suspense, lazy, useEffect, useState } from 'react'

/**
 * Three.js and R3F are the largest thing on the page by a wide margin, so the
 * hero's type, CTAs and stats must be interactive before any of it is fetched.
 *
 * Two gates, both deliberate:
 *   · the chunk is only imported after first paint, via rAF + idle
 *   · nothing is imported at all on a device that has told us it does not
 *     want animation, or that has no WebGL
 *
 * The fallback is a still frame drawn in CSS, not a spinner — a spinner in a
 * hero says the site is broken.
 */

const BuildScene = lazy(() => import('./BuildScene'))

type Props = {
  progress: { current: number }
  seq: number
  active: boolean
}

const canRender3D = () => {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export default function BuildSceneLazy(props: Props) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!canRender3D()) return

    let raf = 0
    let idle: number | undefined
    // rAF first so we are past the entrance choreography, then idle so the
    // fetch does not compete with the fonts landing.
    raf = requestAnimationFrame(() => {
      const schedule =
        window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 260))
      // The `timeout` is not optional politeness — a bare requestIdleCallback
      // has no deadline, so on a page that never goes idle the hero would keep
      // the still frame indefinitely and the 3D would simply never arrive.
      // With a deadline the browser runs it late rather than never.
      idle = schedule(() => setArmed(true), { timeout: 1200 }) as unknown as number
    })

    return () => {
      cancelAnimationFrame(raf)
      if (idle !== undefined) {
        window.cancelIdleCallback?.(idle)
        clearTimeout(idle)
      }
    }
  }, [])

  if (!armed) return <StillFrame />

  return (
    <Suspense fallback={<StillFrame />}>
      <BuildScene {...props} />
    </Suspense>
  )
}

/**
 * The composed still: a blueprint field with the shed's silhouette drawn on
 * it. It is what a visitor sees on a no-WebGL device or a slow first second,
 * and it is a finished-looking frame in its own right.
 */
function StillFrame() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 480 300" className="w-[86%] max-w-[34rem]" fill="none" aria-hidden>
        <g stroke="var(--color-line)" strokeWidth="1">
          <path d="M20 250h440M60 250V120M420 250V120M240 78 60 120M240 78l180 42" />
        </g>
        <g stroke="var(--color-body)" strokeWidth="1.4" opacity="0.55">
          <path d="M110 250V128M170 250V142M310 250V142M370 250V128" />
        </g>
        <path
          d="M60 120 240 78l180 42"
          stroke="var(--color-accent)"
          strokeWidth="2"
          opacity="0.85"
        />
      </svg>
    </div>
  )
}
