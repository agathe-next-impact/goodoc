import { describe, expect, it } from 'vitest'

import { generateServiceJsonLd } from '../generators/service'
import {
  paramedicalTenant,
  serviceNoPrice,
  serviceWithPrice,
  specialistTenant,
} from './fixtures'

describe('generateServiceJsonLd', () => {
  it('generates MedicalProcedure + Service type', () => {
    const result = generateServiceJsonLd(specialistTenant, serviceWithPrice)

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toEqual(['MedicalProcedure', 'Service'])
    expect(result['@id']).toBe(
      'https://dr-martin.medsite.fr/actes/echocardiographie/#service',
    )
    expect(result['name']).toBe('Échocardiographie')
    expect(result['url']).toBe(
      'https://dr-martin.medsite.fr/actes/echocardiographie',
    )
  })

  it('links provider to practitioner via @id', () => {
    const result = generateServiceJsonLd(specialistTenant, serviceWithPrice)
    const provider = result['provider'] as Record<string, unknown>
    expect(provider['@id']).toBe('https://dr-martin.medsite.fr/#practitioner')
  })

  it('includes offers when price is shown', () => {
    const result = generateServiceJsonLd(specialistTenant, serviceWithPrice)
    const offers = result['offers'] as Record<string, unknown>

    expect(offers['@type']).toBe('Offer')
    expect(offers['priceCurrency']).toBe('EUR')
    expect(offers['price']).toBe('80')
    expect(offers['highPrice']).toBe('120')
    expect(offers['availability']).toBe('https://schema.org/InStock')
  })

  it('omits highPrice when priceMin equals priceMax', () => {
    const service = { ...serviceWithPrice, priceMax: '80' }
    const result = generateServiceJsonLd(specialistTenant, service)
    const offers = result['offers'] as Record<string, unknown>
    expect(offers['highPrice']).toBeUndefined()
  })

  it('omits offers when showPrice is false', () => {
    const result = generateServiceJsonLd(paramedicalTenant, serviceNoPrice)
    expect(result['offers']).toBeUndefined()
  })

  it('includes procedureType and bodyLocation when provided', () => {
    const result = generateServiceJsonLd(specialistTenant, serviceWithPrice)
    expect(result['procedureType']).toBe('DiagnosticProcedure')
  })

  it('omits procedureType and bodyLocation when not provided', () => {
    const result = generateServiceJsonLd(paramedicalTenant, serviceNoPrice)
    expect(result['procedureType']).toBeUndefined()
    expect(result['bodyLocation']).toBeUndefined()
  })

  it('includes timeRequired when duration provided', () => {
    const result = generateServiceJsonLd(specialistTenant, serviceWithPrice)
    expect(result['timeRequired']).toBe('PT30M')
  })

  it('does not include estimatedCost key', () => {
    const result = generateServiceJsonLd(specialistTenant, serviceWithPrice)
    expect(result).not.toHaveProperty('estimatedCost')
  })

  it('includes image when provided', () => {
    const result = generateServiceJsonLd(specialistTenant, serviceWithPrice)
    expect(result['image']).toBe('https://media.medsite.fr/dr-martin/echo.jpg')
  })

  it('omits image when not provided', () => {
    const result = generateServiceJsonLd(paramedicalTenant, serviceNoPrice)
    expect(result['image']).toBeUndefined()
  })
})
