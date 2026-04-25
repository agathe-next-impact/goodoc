import { describe, expect, it } from 'vitest'

import { timingSafeEqual } from './preview-secret'

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('abc123', 'abc123')).toBe(true)
  })

  it('returns false for different content of same length', () => {
    expect(timingSafeEqual('abc123', 'abc124')).toBe(false)
  })

  it('returns false for different lengths', () => {
    expect(timingSafeEqual('abc', 'abcd')).toBe(false)
  })

  it('returns false for empty vs non-empty', () => {
    expect(timingSafeEqual('', 'a')).toBe(false)
  })

  it('returns true for two empty strings', () => {
    expect(timingSafeEqual('', '')).toBe(true)
  })

  it('handles unicode characters consistently', () => {
    expect(timingSafeEqual('café', 'café')).toBe(true)
    expect(timingSafeEqual('café', 'cafe')).toBe(false)
  })
})
