import type { BookingMode } from '@medsite/types'

const DOCTOLIB_HOSTNAME = 'doctolib.fr'
const DOCTOLIB_IFRAME_BASE = 'https://www.doctolib.fr/iframe'

/**
 * Extracts the practitioner slug from a Doctolib profile URL.
 * Returns null if the URL is not a valid Doctolib URL.
 *
 * Supported formats:
 *   https://www.doctolib.fr/osteopathe/aurillac/jean-dupont
 *   https://www.doctolib.fr/osteopathe/aurillac/jean-dupont?pid=practice-12345
 *   https://doctolib.fr/osteopathe/aurillac/jean-dupont
 *   https://www.doctolib.fr/osteopathe/aurillac/jean-dupont/
 */
export function extractDoctolibSlug(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.endsWith(DOCTOLIB_HOSTNAME)) return null
    const parts = parsed.pathname.split('/').filter(Boolean)
    // Expect at least 3 segments: specialty/city/slug
    if (parts.length < 3) return null
    return parts.at(-1) ?? null
  } catch {
    return null
  }
}

/**
 * Builds the Doctolib iframe widget URL from a practitioner slug.
 */
export function buildDoctolibWidgetUrl(slug: string): string {
  return `${DOCTOLIB_IFRAME_BASE}/${encodeURIComponent(slug)}`
}

/**
 * Builds a deep link to a specific consultation motif on Doctolib.
 * Appends the motif slug as a hash fragment if provided.
 */
export function buildDoctolibMotifUrl(
  baseUrl: string,
  motifSlug?: string,
): string {
  if (!motifSlug) return baseUrl
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}motif=${encodeURIComponent(motifSlug)}`
}

/**
 * Resolves the booking mode from available URLs — ordered fallback chain:
 *   Doctolib URL → alternative booking URL → contact form.
 */
export function resolveBookingMode(input: {
  doctolibUrl?: string | null
  alternativeBookingUrl?: string | null
}): BookingMode {
  if (input.doctolibUrl) return 'doctolib'
  if (input.alternativeBookingUrl) return 'alternative'
  return 'contact'
}
