import { Suspense, lazy, useEffect, useState } from 'react'
import { COLOR } from './layout'

/**
 * Same arming discipline as the other two scenes: nothing 3D is fetched until
 * the section has been approached, and nothing at all on a device with no
 * WebGL. three.js is already in the page's shared lazy chunk, so the marginal
 * cost of this scene is the scene file, not another copy of the library.
 */

const TradeYardScene = lazy(() => import('./TradeYardScene'))

type Mode = 'out' | 'in'
type Props = { mode: Mode; active: boolean }

const canRender3D = () => {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export default function TradeYardSceneLazy(props: Props) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
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

  if (!armed) return <StillFrame mode={props.mode} />

  return (
    <Suspense fallback={<StillFrame mode={props.mode} />}>
      <TradeYardScene {...props} />
    </Suspense>
  )
}

/**
 * The yard as a flat elevation, for no-WebGL and for the first moment.
 *
 * It is the same scene read side-on — works, road, truck, containers, ship —
 * and it faces the way the mode says, so even the fallback tells you which
 * direction the goods are moving.
 */
function StillFrame({ mode }: { mode: Mode }) {
  const out = mode === 'out'
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 640 240" className="w-[94%]" fill="none" aria-hidden>
        <line x1="10" y1="196" x2="630" y2="196" stroke={COLOR.kerb} strokeWidth="2" />
        {/* Works. */}
        <rect x="18" y="96" width="132" height="100" stroke={COLOR.steel} strokeWidth="1.4" />
        <path d="M12 96 L84 68 L156 96" stroke={COLOR.steel} strokeWidth="1.4" />
        <rect x="118" y="136" width="32" height="60" stroke={COLOR.accent} strokeWidth="1.6" />
        {/* Truck, pointing whichever way the traffic runs. */}
        <g transform={out ? 'translate(300 0)' : 'translate(300 0) scale(-1 1) translate(-180 0)'}>
          <rect x="4" y="150" width="120" height="10" stroke={COLOR.steel} strokeWidth="1.4" />
          <rect x="112" y="122" width="38" height="38" stroke={COLOR.steel} strokeWidth="1.4" />
          <rect x="16" y="126" width="92" height="24" stroke={COLOR.accent} strokeWidth="1.6" />
          <circle cx="34" cy="172" r="12" stroke={COLOR.steel} strokeWidth="1.4" />
          <circle cx="126" cy="172" r="12" stroke={COLOR.steel} strokeWidth="1.4" />
        </g>
        {/* Port. */}
        <rect x="498" y="150" width="120" height="22" stroke={COLOR.steel} strokeWidth="1.2" />
        <rect x="498" y="128" width="120" height="22" stroke={COLOR.steel} strokeWidth="1.2" />
        <path d="M470 196 h170 l-16 22 h-138 Z" stroke={COLOR.steel} strokeWidth="1.4" />
      </svg>
    </div>
  )
}
