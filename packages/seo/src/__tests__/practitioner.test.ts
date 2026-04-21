import { describe, expect, it } from 'vitest'

import { generatePractitionerJsonLd } from '../generators/practitioner'
import { paramedicalTenant, specialistTenant, wellnessTenant } from './fixtures'

describe('generatePractitionerJsonLd', () => {
  it('uses Physician type for medical specialists', () => {
    const result = generatePractitionerJsonLd(specialistTenant)

    expect(result['@type']).toBe('Physician')
    expect(result['@id']).toBe('https://dr-martin.medsite.fr/#practitioner')
    expect(result['name']).toBe('Jean Martin')
    expect(result['givenName']).toBe('Jean')
    expect(result['familyName']).toBe('Martin')
    expect(result['honorificPrefix']).toBe('Dr')
    expect(result['medicalSpecialty']).toBe('Cardiovascular')
  })

  it('uses Person type for non-physician practitioners', () => {
    const result = generatePractitionerJsonLd(paramedicalTenant)
    expect(result['@type']).toBe('Person')
  })

  it('uses Person type for wellness practitioners', () => {
    const result = generatePractitionerJsonLd(wellnessTenant)
    expect(result['@type']).toBe('Person')
  })

  it('links to organization via @id', () => {
    const result = generatePractitionerJsonLd(specialistTenant)
    const worksFor = result['worksFor'] as Record<string, unknown>
    expect(worksFor['@id']).toBe('https://dr-martin.medsite.fr/#organization')
  })

  it('includes credentials when provided', () => {
    const result = generatePractitionerJsonLd(specialistTenant)
    const credentials = result['hasCredential'] as Record<string, unknown>[]

    expect(credentials).toHaveLength(1)
    expect(credentials[0]!['@type']).toBe('EducationalOccupationalCredential')
    expect(credentials[0]!['credentialCategory']).toBe('Diplôme de Cardiologie')
    expect((credentials[0]!['recognizedBy'] as Record<string, unknown>)['name']).toBe(
      'Université Paris-Descartes',
    )
    expect(credentials[0]!['identifier']).toBe('ADELI-123456')
  })

  it('includes alumniOf when provided', () => {
    const result = generatePractitionerJsonLd(specialistTenant)
    const alumni = result['alumniOf'] as Record<string, unknown>[]

    expect(alumni).toHaveLength(1)
    expect(alumni[0]!['@type']).toBe('EducationalOrganization')
    expect(alumni[0]!['name']).toBe('Université Paris-Descartes')
  })

  it('includes knowsAbout when provided', () => {
    const result = generatePractitionerJsonLd(specialistTenant)
    const knows = result['knowsAbout'] as string[]

    expect(knows).toContain('Cardiologie interventionnelle')
    expect(knows).toContain('Échocardiographie')
  })

  it('includes memberOf when provided', () => {
    const result = generatePractitionerJsonLd(specialistTenant)
    const members = result['memberOf'] as Record<string, unknown>[]

    expect(members).toHaveLength(1)
    expect(members[0]!['name']).toBe('Société Française de Cardiologie')
  })

  it('omits optional fields when not provided', () => {
    const result = generatePractitionerJsonLd(wellnessTenant)

    expect(result['honorificPrefix']).toBeUndefined()
    expect(result['medicalSpecialty']).toBeUndefined()
    expect(result['description']).toBeUndefined()
    expect(result['image']).toBeUndefined()
    expect(result['hasCredential']).toBeUndefined()
    expect(result['alumniOf']).toBeUndefined()
    expect(result['knowsAbout']).toBeUndefined()
    expect(result['memberOf']).toBeUndefined()
  })

  it('sets URL to the about page', () => {
    const result = generatePractitionerJsonLd(specialistTenant)
    expect(result['url']).toBe('https://dr-martin.medsite.fr/a-propos')
  })

  it('@id is consistent between practitioner and service provider', () => {
    const practitioner = generatePractitionerJsonLd(specialistTenant)
    expect(practitioner['@id']).toBe('https://dr-martin.medsite.fr/#practitioner')
  })
})
