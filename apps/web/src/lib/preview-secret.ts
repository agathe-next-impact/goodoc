/**
 * Constant-time-ish string equality for preview-token comparison.
 *
 * Returns false immediately on length mismatch (the only safe shortcut),
 * then accumulates per-character XOR diffs across the full string so the
 * runtime is independent of which character first diverges. Not a
 * substitute for `crypto.timingSafeEqual` in security-critical paths, but
 * sufficient for a single shared secret used to gate preview mode.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}
