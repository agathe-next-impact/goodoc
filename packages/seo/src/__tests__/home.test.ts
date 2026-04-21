import { describe, expect, it } from 'vitest'

import { generateHomeJsonLd } from '../generators/home'
import { paramedicalTenant, specialistTenant, wellnessTenant } from './fixtures'

describe('generateHomeJsonLd', () => {
  it('generates correct JSON-LD for a specialist (cardiologue)', () => {
    const result = generateHomeJsonLd(specialistTenant)

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toEqual(['Physician', 'LocalBusiness'])
    expect(result['@id']).toBe('https://dr-martin.medsite.fr/#organization')
    expect(result['name']).toBe('Cabinet de Cardiologie Dr Martin')
    expect(result['url']).toBe('https://dr-martin.medsite.fr')
    expect(result['telephone']).toBe('01 42 00 00 00')
    expect(result['email']).toBe('contact@dr-martin.fr')
    expect(result['image']).toBe('https://media.medsite.fr/dr-martin/photo.jpg')
    expect(result['medicalSpecialty']).toBe('Cardiovascular')
  })

  it('includes address and geo', () => {
    const result = generateHomeJsonLd(specialistTenant)
    const address = result['address'] as Record<string, unknown>

    expect(address['@type']).toBe('PostalAddress')
    expect(address['streetAddress']).toBe('15 Rue de la Santé')
    expect(address['addressLocality']).toBe('Paris')
    expect(address['postalCode']).toBe('75013')
    expect(address['addressCountry']).toBe('FR')

    const geo = result['geo'] as Record<string, unknown>
    expect(geo['@type']).toBe('GeoCoordinates')
    expect(geo['latitude']).toBe('48.8356')
  })

  it('includes aggregateRating when reviewStats provided', () => {
    const result = generateHomeJsonLd(specialistTenant)
    const rating = result['aggregateRating'] as Record<string, unknown>

    expect(rating['@type']).toBe('AggregateRating')
    expect(rating['ratingValue']).toBe(4.8)
    expect(rating['reviewCount']).toBe(127)
    expect(rating['bestRating']).toBe(5)
  })

  it('omits aggregateRating when no reviewStats', () => {
    const result = generateHomeJsonLd(paramedicalTenant)
    expect(result['aggregateRating']).toBeUndefined()
  })

  it('includes openingHoursSpecification for open days only', () => {
    const result = generateHomeJsonLd(specialistTenant)
    const hours = result['openingHoursSpecification'] as Record<string, unknown>[]

    // 5 open days, 2 closed
    expect(hours).toHaveLength(5)
    expect(hours[0]!['@type']).toBe('OpeningHoursSpecification')
    expect(hours[0]!['dayOfWeek']).toBe('Monday')
  })

  it('builds sameAs from social links and doctolib', () => {
    const result = generateHomeJsonLd(specialistTenant)
    const sameAs = result['sameAs'] as string[]

    expect(sameAs).toContain('https://www.doctolib.fr/cardiologue/paris/jean-martin')
    expect(sameAs).toContain('https://g.page/dr-martin-cardio')
    expect(sameAs).toContain('https://linkedin.com/in/dr-jean-martin')
  })

  it('omits optional fields when not provided', () => {
    const result = generateHomeJsonLd(wellnessTenant)

    expect(result['description']).toBeUndefined()
    expect(result['image']).toBeUndefined()
    expect(result['email']).toBeUndefined()
    expect(result['medicalSpecialty']).toBeUndefined()
  })

  it('uses HealthAndBeautyBusiness for wellness practitioners', () => {
    const result = generateHomeJsonLd(wellnessTenant)
    expect(result['@type']).toEqual(['HealthAndBeautyBusiness', 'LocalBusiness'])
  })

  it('uses Physiotherapy for kinésithérapeute', () => {
    const result = generateHomeJsonLd(paramedicalTenant)
    expect(result['@type']).toEqual(['Physiotherapy', 'LocalBusiness'])
  })

  it('truncates bio to 300 characters for description', () => {
    const longBio = 'A'.repeat(500)
    const tenant = {
      ...specialistTenant,
      practitioner: { ...specialistTenant.practitioner, bio: longBio },
    }
    const result = generateHomeJsonLd(tenant)
    expect((result['description'] as string).length).toBe(300)
  })
})
