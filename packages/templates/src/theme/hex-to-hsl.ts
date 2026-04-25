import type { HslTriplet } from '../types'

/**
 * Converts `#RRGGBB` (or `#RGB`) to the HSL triplet format used by our CSS
 * tokens: `'H S% L%'` — **without** the `hsl()` wrapper, so it can be composed
 * with alpha via `hsl(var(--primary) / <alpha-value>)`.
 *
 * Returns `null` on invalid input so callers can fall back to the template
 * default rather than injecting broken CSS.
 */
export function hexToHsl(hex: string): HslTriplet | null {
  const normalized = hex.trim().replace(/^#/, '')
  let r: number
  let g: number
  let b: number

  if (normalized.length === 3) {
    const chars = [...normalized]
    const parsed = chars.map((c) => parseInt(c + c, 16))
    if (parsed.some(Number.isNaN) || parsed.length !== 3) return null
    ;[r, g, b] = parsed as [number, number, number]
  } else if (normalized.length === 6) {
    const rr = parseInt(normalized.slice(0, 2), 16)
    const gg = parseInt(normalized.slice(2, 4), 16)
    const bb = parseInt(normalized.slice(4, 6), 16)
    if ([rr, gg, bb].some(Number.isNaN)) return null
    r = rr
    g = gg
    b = bb
  } else {
    return null
  }

  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const delta = max - min
  const l = (max + min) / 2

  let h = 0
  let s = 0
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60
        break
      case gNorm:
        h = ((bNorm - rNorm) / delta + 2) * 60
        break
      default:
        h = ((rNorm - gNorm) / delta + 4) * 60
    }
  }

  const hRound = Math.round(h)
  const sRound = Math.round(s * 100)
  const lRound = Math.round(l * 100)
  return `${hRound} ${sRound}% ${lRound}%`
}
