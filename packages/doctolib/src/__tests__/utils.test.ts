import { describe, expect, it } from 'vitest'

import {
  buildDoctolibMotifUrl,
  buildDoctolibWidgetUrl,
  extractDoctolibSlug,
  resolveBookingMode,
} from '../utils'

// ── extractDoctolibSlug ─────────────────────────────────────────

describe('extractDoctolibSlug', () => {
  it('extracts slug from standard URL', () => {
    expect(
      extractDoctolibSlug(
        'https://www.doctolib.fr/osteopathe/aurillac/jean-dupont',
      ),
    ).toBe('jean-dupont')
  })

  it('extracts slug from URL without www', () => {
    expect(
      extractDoctolibSlug(
        'https://doctolib.fr/osteopathe/aurillac/jean-dupont',
      ),
    ).toBe('jean-dupont')
  })

  it('extracts slug from URL with query params', () => {
    expect(
      extractDoctolibSlug(
        'https://www.doctolib.fr/osteopathe/aurillac/jean-dupont?pid=practice-12345',
      ),
    ).toBe('jean-dupont')
  })

  it('extracts slug from URL with multiple query params', () => {
    expect(
      extractDoctolibSlug(
        'https://www.doctolib.fr/cardiologue/paris/dr-martin?pid=practice-999&highlight=true',
      ),
    ).toBe('dr-martin')
  })

  it('extracts slug from URL with trailing slash', () => {
    expect(
      extractDoctolibSlug(
        'https://www.doctolib.fr/dentiste/lyon/sophie-dupont/',
      ),
    ).toBe('sophie-dupont')
  })

  it('extracts slug from URL with hash', () => {
    expect(
      extractDoctolibSlug(
        'https://www.doctolib.fr/gynecologue/bordeaux/marie-leroy#booking',
      ),
    ).toBe('marie-leroy')
  })

  it('returns null for non-doctolib URL', () => {
    expect(extractDoctolibSlug('https://www.google.com/search?q=medecin')).toBeNull()
  })

  it('returns null for doctolib homepage', () => {
    expect(extractDoctolibSlug('https://www.doctolib.fr')).toBeNull()
  })

  it('returns null for doctolib with only specialty', () => {
    expect(extractDoctolibSlug('https://www.doctolib.fr/osteopathe')).toBeNull()
  })

  it('returns null for doctolib with specialty and city only', () => {
    expect(
      extractDoctolibSlug('https://www.doctolib.fr/osteopathe/aurillac'),
    ).toBeNull()
  })

  it('returns null for invalid URL', () => {
    expect(extractDoctolibSlug('not-a-url')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(extractDoctolibSlug('')).toBeNull()
  })

  it('handles subdomain of doctolib.fr', () => {
    expect(
      extractDoctolibSlug(
        'https://partners.doctolib.fr/osteopathe/aurillac/jean-dupont',
      ),
    ).toBe('jean-dupont')
  })
})

// ── buildDoctolibWidgetUrl ──────────────────────────────────────

describe('buildDoctolibWidgetUrl', () => {
  it('builds iframe URL from slug', () => {
    expect(buildDoctolibWidgetUrl('jean-dupont')).toBe(
      'https://www.doctolib.fr/iframe/jean-dupont',
    )
  })

  it('encodes special characters in slug', () => {
    expect(buildDoctolibWidgetUrl('dr martin')).toBe(
      'https://www.doctolib.fr/iframe/dr%20martin',
    )
  })
})

// ── buildDoctolibMotifUrl ───────────────────────────────────────

describe('buildDoctolibMotifUrl', () => {
  const baseUrl = 'https://www.doctolib.fr/osteopathe/aurillac/jean-dupont'

  it('returns base URL when no motif provided', () => {
    expect(buildDoctolibMotifUrl(baseUrl)).toBe(baseUrl)
  })

  it('appends motif as query param', () => {
    expect(buildDoctolibMotifUrl(baseUrl, 'consultation')).toBe(
      `${baseUrl}?motif=consultation`,
    )
  })

  it('uses & separator when URL already has query params', () => {
    const urlWithParams = `${baseUrl}?pid=practice-123`
    expect(buildDoctolibMotifUrl(urlWithParams, 'consultation')).toBe(
      `${urlWithParams}&motif=consultation`,
    )
  })

  it('encodes special characters in motif', () => {
    expect(buildDoctolibMotifUrl(baseUrl, 'bilan postural')).toBe(
      `${baseUrl}?motif=bilan%20postural`,
    )
  })
})

// ── resolveBookingMode ──────────────────────────────────────────

describe('resolveBookingMode', () => {
  it('returns doctolib when doctolibUrl is set', () => {
    expect(
      resolveBookingMode({
        doctolibUrl: 'https://www.doctolib.fr/osteopathe/aurillac/jean-dupont',
        alternativeBookingUrl: 'https://cal.com/jean-dupont',
      }),
    ).toBe('doctolib')
  })

  it('returns alternative when only alternativeBookingUrl is set', () => {
    expect(
      resolveBookingMode({
        alternativeBookingUrl: 'https://cal.com/jean-dupont',
      }),
    ).toBe('alternative')
  })

  it('returns contact when no URL is set', () => {
    expect(resolveBookingMode({})).toBe('contact')
  })

  it('returns contact when both are null', () => {
    expect(
      resolveBookingMode({ doctolibUrl: null, alternativeBookingUrl: null }),
    ).toBe('contact')
  })

  it('returns contact when both are undefined', () => {
    expect(
      resolveBookingMode({
        doctolibUrl: undefined,
        alternativeBookingUrl: undefined,
      }),
    ).toBe('contact')
  })

  it('prefers doctolib over alternative', () => {
    expect(
      resolveBookingMode({
        doctolibUrl: 'https://doctolib.fr/a/b/c',
        alternativeBookingUrl: 'https://cal.com/c',
      }),
    ).toBe('doctolib')
  })

  it('returns alternative when doctolibUrl is empty string', () => {
    expect(
      resolveBookingMode({
        doctolibUrl: '',
        alternativeBookingUrl: 'https://cal.com/c',
      }),
    ).toBe('alternative')
  })

  it('returns contact when both are empty strings', () => {
    expect(
      resolveBookingMode({ doctolibUrl: '', alternativeBookingUrl: '' }),
    ).toBe('contact')
  })
})
