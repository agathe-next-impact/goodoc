import { describe, expect, it } from 'vitest'

import {
  buildAddress,
  buildGeo,
  buildSameAs,
  formatOpeningHours,
  fullName,
} from '../helpers'
import { paramedicalTenant, specialistTenant, wellnessTenant } from './fixtures'

describe('formatOpeningHours', () => {
  it('filters out closed days', () => {
    const hours = formatOpeningHours(specialistTenant.openingHours)
    expect(hours).toHaveLength(5)
  })

  it('maps day index to English day name', () => {
    const hours = formatOpeningHours(specialistTenant.openingHours)
    expect(hours[0]!['dayOfWeek']).toBe('Monday')
    expect(hours[4]!['dayOfWeek']).toBe('Friday')
  })

  it('includes open and close times', () => {
    const hours = formatOpeningHours(specialistTenant.openingHours)
    expect(hours[0]!['opens']).toBe('09:00')
    expect(hours[0]!['closes']).toBe('18:00')
  })

  it('sets @type to OpeningHoursSpecification', () => {
    const hours = formatOpeningHours(specialistTenant.openingHours)
    expect(hours[0]!['@type']).toBe('OpeningHoursSpecification')
  })
})

describe('buildSameAs', () => {
  it('includes all social links and doctolib', () => {
    const sameAs = buildSameAs(specialistTenant)
    expect(sameAs).toEqual([
      'https://www.doctolib.fr/cardiologue/paris/jean-martin',
      'https://g.page/dr-martin-cardio',
      'https://linkedin.com/in/dr-jean-martin',
    ])
  })

  it('returns empty array when no links', () => {
    const sameAs = buildSameAs(wellnessTenant)
    expect(sameAs).toEqual([])
  })

  it('includes only available links', () => {
    const sameAs = buildSameAs(paramedicalTenant)
    expect(sameAs).toEqual(['https://instagram.com/kine_dupont'])
  })
})

describe('fullName', () => {
  it('joins first and last name', () => {
    expect(fullName({ firstName: 'Jean', lastName: 'Martin' })).toBe(
      'Jean Martin',
    )
  })
})

describe('buildAddress', () => {
  it('returns PostalAddress type', () => {
    const address = buildAddress(specialistTenant.address)
    expect(address['@type']).toBe('PostalAddress')
    expect(address['streetAddress']).toBe('15 Rue de la Santé')
    expect(address['addressLocality']).toBe('Paris')
    expect(address['postalCode']).toBe('75013')
    expect(address['addressCountry']).toBe('FR')
  })
})

describe('buildGeo', () => {
  it('returns GeoCoordinates when lat/lng available', () => {
    const geo = buildGeo(specialistTenant.address)
    expect(geo).toBeDefined()
    expect(geo!['@type']).toBe('GeoCoordinates')
    expect(geo!['latitude']).toBe('48.8356')
    expect(geo!['longitude']).toBe('2.3411')
  })

  it('returns undefined when no coordinates', () => {
    const geo = buildGeo(paramedicalTenant.address)
    expect(geo).toBeUndefined()
  })
})
