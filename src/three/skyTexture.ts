import * as THREE from 'three'
import { COLOR } from './layout'

/**
 * The sky behind the building.
 *
 * The stage used to sit on the CSS `.blueprint` grid, which was right when the
 * stage held an abstract drawing and wrong the moment it held a building on a
 * yard: graph paper behind a rendered shed reads as leftover scaffolding, and
 * the grid stopped dead at the yard's edge, which put a hard seam across the
 * middle of the frame.
 *
 * So: a real horizon. A vertical gradient on a back-faced sphere, plus fog in
 * BuildScene tuned to the horizon stop, so the 400 m yard dissolves into the sky
 * instead of ending somewhere.
 *
 * Why not a CSS gradient behind the transparent canvas — which would be free?
 * Because fog has ONE colour and CSS gradients vary down the frame, so the two
 * only agree at a single height and the mismatch shows exactly at the horizon,
 * the one place the eye is looking. Putting the sky inside the scene means the
 * fog colour and the sky colour are the same number by construction.
 *
 * The grid is kept where it still belongs: the PUF panel section, which IS a
 * drawing.
 */

/** 2px wide — it is a vertical ramp, so horizontal resolution is wasted. */
const W = 2
const H = 512

/**
 * The stop the fog is matched to. Exported so the two cannot drift apart.
 *
 * Daylight haze. On the navy page this was a near-black blue, because the sky
 * only had to read as a horizon; on white it has to do the opposite job and
 * give the building — which is white-clad — something to stand against.
 */
export const HORIZON = '#b9d6ef'

export function createSkyTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H

  const ctx = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  if (!ctx) return { texture, dispose: () => texture.dispose() }

  // Daylight, in the palette's own blues: the page white overhead, opening
  // into sky toward the horizon.
  /*
    STOPS ARE PLACED FOR A SPHERE, NOT A BACKDROP — this is the one thing to get
    right here, and it was wrong first time.

    On a sphere the texture's v runs zenith (0) → nadir (1), so the HORIZON is at
    v = 0.5, not v = 1. With the horizon colour at the bottom of the ramp, the
    sky met the fogged ground and left exactly the hard horizontal line this
    component exists to remove.

    Everything below 0.5 is under the yard and never seen; it is held at HORIZON
    so any glancing view stays consistent.
  */
  const ramp = ctx.createLinearGradient(0, 0, 0, H)
  /*
    The zenith is the PAGE's ground token, exactly — `--color-ground`. That is
    the whole trick for making the stage stop reading as a panel: at the top of
    the frame the sky and the page are the same colour, so there is no edge to
    see. Change --color-ground and this must change with it.

    The ramp then RUNS THE OTHER WAY from the navy version. There, the page was
    dark and the sky lifted toward a brighter horizon; here the page is white
    and the sky has to deepen, or a white-clad building on a white sky has no
    silhouette at all. The building sits in the middle band, which is why the
    blue arrives by v = 0.3 rather than waiting for the horizon.
  */
  ramp.addColorStop(0, COLOR.ground)
  ramp.addColorStop(0.3, '#e4eff9')
  ramp.addColorStop(0.44, '#cde1f3')
  ramp.addColorStop(0.5, HORIZON)
  ramp.addColorStop(1, HORIZON)
  ctx.fillStyle = ramp
  ctx.fillRect(0, 0, W, H)

  // A whisper of warmth just above the horizon — haze off the ground on a
  // bright day. At 3% it is a temperature rather than a colour, which is the
  // only way it earns its place; any more and a daylight sky starts to read
  // as a sunset, which is a different building on a different afternoon.
  const glowTop = H * 0.34
  const glowBottom = H * 0.5
  const glow = ctx.createLinearGradient(0, glowTop, 0, glowBottom)
  glow.addColorStop(0, 'rgba(0,0,0,0)')
  glow.addColorStop(1, '#ffd9a8')
  ctx.globalAlpha = 0.03
  ctx.fillStyle = glow
  ctx.fillRect(0, glowTop, W, glowBottom - glowTop)
  ctx.globalAlpha = 1

  texture.needsUpdate = true

  return { texture, dispose: () => texture.dispose() }
}
