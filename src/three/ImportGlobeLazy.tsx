import { Suspense, lazy, useEffect, useState } from 'react'
import type { ComponentProps } from 'react'

/**
 * Same arming discipline as the other scenes: nothing 3D is fetched until the
 * section has been approached, and nothing at all on a device with no WebGL.
 * Until then — and for good on those devices — a flat drawing of the same
 * idea holds the space, so the layout never jumps.
 */

const ImportGlobe = lazy(() => import('./ImportGlobe'))

type Props = ComponentProps<typeof ImportGlobe>

const canRender3D = () => {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export default function ImportGlobeLazy(props: Props) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!props.active || armed || !canRender3D()) return
    const schedule = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200))
    const idle = schedule(() => setArmed(true), { timeout: 1200 }) as unknown as number
    return () => {
      window.cancelIdleCallback?.(idle)
      clearTimeout(idle)
    }
  }, [props.active, armed])

  if (!armed) return <StillFrame />

  return (
    <Suspense fallback={<StillFrame />}>
      <ImportGlobe {...props} />
    </Suspense>
  )
}

/** A globe outline with lines converging on one point: the scene, flattened. */
function StillFrame() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 200 200" className="h-[82%]" fill="none" aria-hidden>
        <circle cx="100" cy="100" r="80" fill="#f6f9fc" stroke="#d3e0ee" strokeWidth="1" />
        <g stroke="#0054a8" strokeOpacity="0.35" strokeWidth="1">
          <path d="M40 60 Q70 50 92 104" />
          <path d="M60 150 Q70 110 92 104" />
          <path d="M160 70 Q130 60 92 104" />
          <path d="M150 140 Q120 120 92 104" />
        </g>
        <circle cx="92" cy="104" r="3" fill="#0054a8" />
      </svg>
    </div>
  )
}
