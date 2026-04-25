import { describe, expect, it } from 'vitest'

import { hexToHsl } from '../theme/hex-to-hsl'

describe('hexToHsl', () => {
  it('converts a 6-digit hex to an HSL triplet', () => {
    expect(hexToHsl('#ffffff')).toBe('0 0% 100%')
    expect(hexToHsl('#000000')).toBe('0 0% 0%')
    expect(hexToHsl('#ff0000')).toBe('0 100% 50%')
    expect(hexToHsl('#00ff00')).toBe('120 100% 50%')
    expect(hexToHsl('#0066cc')).toBe('210 100% 40%')
  })

  it('converts a 3-digit hex', () => {
    expect(hexToHsl('#fff')).toBe('0 0% 100%')
    expect(hexToHsl('#f00')).toBe('0 100% 50%')
  })

  it('accepts hex without leading #', () => {
    expect(hexToHsl('ff0000')).toBe('0 100% 50%')
  })

  it('returns null for invalid input', () => {
    expect(hexToHsl('')).toBeNull()
    expect(hexToHsl('#xyz')).toBeNull()
    expect(hexToHsl('#12345')).toBeNull()
    expect(hexToHsl('not-a-color')).toBeNull()
  })
})
