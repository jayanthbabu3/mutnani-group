import * as THREE from 'three'
import { COLOR } from './layout'

/**
 * The building's fascia sign, drawn on a 2D canvas and used as a texture.
 *
 * Why a canvas rather than geometry: the sign has to READ — it says "Balaji
 * Prefab Solutions", which is the division whose product the hero is building,
 * and an abstract gold bar standing in for a wordmark told the visitor nothing.
 * The alternatives were worse:
 *
 *   · TextGeometry needs a font converted to JSON, ships another asset, and
 *     extrudes glyphs nobody sees the sides of
 *   · troika-three-text is a whole dependency for one line of type
 *   · a pre-rendered PNG would have to be re-exported every time the copy or
 *     the palette changes
 *
 * A canvas gets the page's own Manrope, the real logo mark, and the palette
 * tokens, at whatever resolution the sign needs, for nothing.
 *
 * Two details that matter and are easy to miss:
 *
 *   · `colorSpace = SRGBColorSpace`. Without it three.js treats the canvas as
 *     linear and every colour comes out washed and pale.
 *   · `anisotropy`. The sign is almost always seen at a steep angle, which is
 *     exactly the case a plain mipmap blurs into mud.
 */

/** 4:1, matching the fascia's proportions, at a size that survives a retina zoom. */
const W = 1536
const H = 384

type SignOptions = {
  /** The division whose building this is. */
  title: string
  /** The line under it. */
  subtitle: string
  /** Anisotropy cap from the renderer — pass gl.capabilities.getMaxAnisotropy(). */
  anisotropy?: number
}

/**
 * Draws the lockup and returns the texture.
 *
 * The mark is loaded from `/mark.png` — the same asset the header uses, itself
 * extracted from the client's supplied logo artwork rather than redrawn. It
 * arrives after the first draw, so the canvas is painted again and the texture
 * invalidated when it lands. Same for fonts: the first paint may fall back to
 * the system sans, and a second paint replaces it once Manrope is in.
 */
export function createSignTexture({ title, subtitle, anisotropy = 4 }: SignOptions) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H

  const ctx = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = anisotropy

  if (!ctx) return { texture, dispose: () => texture.dispose() }

  let mark: HTMLImageElement | null = null

  const draw = () => {
    // ── The plate ─────────────────────────────────────────────────────────
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = COLOR.ground
    ctx.fillRect(0, 0, W, H)

    // A gold hairline around it, which is what makes it read as a fabricated
    // sign panel rather than a painted rectangle.
    ctx.strokeStyle = COLOR.accent
    ctx.lineWidth = 8
    ctx.strokeRect(4, 4, W - 8, H - 8)

    // ── The mark ──────────────────────────────────────────────────────────
    const pad = 46
    const markBox = H - pad * 2
    if (mark) {
      // Contain, never stretch: the M/N monogram is not square and squashing a
      // client's mark is the one unforgivable thing to do to it.
      const scale = Math.min(markBox / mark.width, markBox / mark.height)
      const w = mark.width * scale
      const h = mark.height * scale
      ctx.drawImage(mark, pad + (markBox - w) / 2, pad + (markBox - h) / 2, w, h)
    }

    // Divider between the mark and the type.
    const dividerX = pad + markBox + 40
    ctx.strokeStyle = COLOR.accent
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(dividerX, pad + 8)
    ctx.lineTo(dividerX, H - pad - 8)
    ctx.stroke()
    ctx.globalAlpha = 1

    // ── The type ──────────────────────────────────────────────────────────
    // Manrope, tracked caps — the same treatment as the wordmark in the header,
    // because this is the same identity at a different size. Fraunces is not
    // used here: below its optical floor it loses the stroke contrast that
    // makes it itself, and a sign is exactly where the identity must not blur.
    const textX = dividerX + 46
    const sans = '"Manrope", ui-sans-serif, system-ui, sans-serif'

    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 118px ${sans}`
    ctx.letterSpacing = '10px'
    ctx.fillText(title.toUpperCase(), textX, 196)

    ctx.fillStyle = COLOR.accent
    ctx.font = `600 62px ${sans}`
    ctx.letterSpacing = '16px'
    ctx.fillText(subtitle.toUpperCase(), textX, 288)

    texture.needsUpdate = true
  }

  draw()

  // Fonts land after first paint; repaint so the sign is not left in fallback.
  document.fonts?.ready.then(draw)

  const img = new Image()
  img.onload = () => {
    mark = img
    draw()
  }
  img.src = '/mark.png'

  return {
    texture,
    dispose: () => texture.dispose(),
  }
}
