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
 * Pulled well down from its first value (#123f6c): the sky only has to read as
 * a horizon, and any brighter than this it reads as a lit panel sitting on the
 * page — which, inside a bordered container, is exactly a box.
 */
export const HORIZON = '#073054'

export function createSkyTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H

  const ctx = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  if (!ctx) return { texture, dispose: () => texture.dispose() }

  // Dusk, in the palette's own blues: deep overhead, opening up toward the
  // horizon. Every stop is a tint of the ground token, so the sky belongs to
  // the same page as everything above it.
  /*
    STOPS ARE PLACED FOR A SPHERE, NOT A BACKDROP — this is the one thing to get
    right here, and it was wrong first time.

    On a sphere the texture's v runs zenith (0) → nadir (1), so the HORIZON is at
    v = 0.5, not v = 1. With the horizon colour at the bottom of the ramp, the
    sky met the fogged ground at roughly #04203f against #123f6c and left exactly
    the hard horizontal line this component exists to remove.

    Everything below 0.5 is under the yard and never seen; it is held at HORIZON
    so any glancing view stays consistent.
  */
  const ramp = ctx.createLinearGradient(0, 0, 0, H)
  /*
    The zenith is the PAGE's ground token, exactly — `--color-ground`, #011d3f.
    That is the whole trick for making the stage stop reading as a panel: at the
    top of the frame the sky and the page are the same colour, so there is no
    edge to see, and the gradient only lifts lower down where the horizon and
    the yard justify it. Change --color-ground and this must change with it.
  */
  ramp.addColorStop(0, COLOR.ground)
  ramp.addColorStop(0.3, '#022349')
  ramp.addColorStop(0.44, '#052b4e')
  ramp.addColorStop(0.5, HORIZON)
  ramp.addColorStop(1, HORIZON)
  ctx.fillStyle = ramp
  ctx.fillRect(0, 0, W, H)

  // A whisper of warmth just above the horizon — the last of the light. At 3%
  // it is a temperature rather than a colour, which is the only way this earns
  // its place: the gold in this hero is already spent on the sign, the CTA and
  // the crew, and a warm sky on top of those tips the whole frame gold.
  const glowTop = H * 0.34
  const glowBottom = H * 0.5
  const glow = ctx.createLinearGradient(0, glowTop, 0, glowBottom)
  glow.addColorStop(0, 'rgba(0,0,0,0)')
  glow.addColorStop(1, COLOR.accent)
  ctx.globalAlpha = 0.03
  ctx.fillStyle = glow
  ctx.fillRect(0, glowTop, W, glowBottom - glowTop)
  ctx.globalAlpha = 1

  texture.needsUpdate = true

  return { texture, dispose: () => texture.dispose() }
}
