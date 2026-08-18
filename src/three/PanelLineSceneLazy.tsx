import { Suspense, lazy, useEffect, useState } from 'react'

/**
 * Same arming discipline as BuildSceneLazy: nothing 3D is fetched until after
 * first paint, and nothing at all on a device with no WebGL.
 *
 * This is a SECOND canvas on the page, so it arms on its own `active` flag —
 * which is driven by the section's own IntersectionObserver — rather than on
 * page load. The hero is a full section above it, so in practice the two are
 * never rendering at the same time.
 */

const PanelLineScene = lazy(() => import('./PanelLineScene'))

type Props = { active: boolean; onStation: (i: number) => void }

const canRender3D = () => {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export default function PanelLineSceneLazy(props: Props) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    // Only fetch once the section has actually been approached. The hero's
    // canvas has first call on the GPU; there is no reason to build this one
    // while the visitor is still reading the top of the page.
    if (!props.active || armed || !canRender3D()) return
    let idle: number | undefined
    const schedule = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200))
    idle = schedule(() => setArmed(true), { timeout: 1200 }) as unknown as number
    return () => {
      if (idle !== undefined) {
        window.cancelIdleCallback?.(idle)
        clearTimeout(idle)
      }
    }
  }, [props.active, armed])

  if (!armed) return <StillFrame />

  return (
    <Suspense fallback={<StillFrame />}>
      <PanelLineScene {...props} />
    </Suspense>
  )
}

/** The line as a flat elevation, for no-WebGL and for the first moment. */
function StillFrame() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 640 200" className="w-[92%]" fill="none" aria-hidden>
        <line x1="20" y1="140" x2="620" y2="140" stroke="var(--color-line)" strokeWidth="1.4" />
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx={30 + i * 27} cy="150" r="4" stroke="var(--color-line)" />
        ))}
        <circle cx="60" cy="100" r="22" stroke="var(--color-body)" strokeWidth="1.4" />
        <rect x="180" y="96" width="70" height="40" stroke="var(--color-body)" strokeWidth="1.4" />
        <rect x="300" y="90" width="120" height="46" stroke="var(--color-body)" strokeWidth="1.4" />
        <path d="M470 78v46" stroke="var(--color-accent)" strokeWidth="2" />
        <rect x="520" y="112" width="90" height="26" stroke="var(--color-accent)" strokeWidth="1.6" />
      </svg>
    </div>
  )
}
