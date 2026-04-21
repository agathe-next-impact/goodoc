import { describe, expect, it } from 'vitest'

import { getSpecialtySchema, specialtySchemaMap } from '../specialty-map'

describe('specialtySchemaMap', () => {
  it('maps all known specialties', () => {
    const knownSlugs = Object.keys(specialtySchemaMap).filter((k) => k !== 'default')
    expect(knownSlugs.length).toBeGreaterThanOrEqual(16)

    for (const slug of knownSlugs) {
      const entry = specialtySchemaMap[slug]!
      expect(entry.schemaType).toBeTruthy()
      expect(entry.parentType).toBeTruthy()
      expect(typeof entry.isPhysician).toBe('boolean')
    }
  })

  it('marks physicians correctly', () => {
    const physicians = ['dermatologue', 'dentiste', 'cardiologue', 'gynecologue', 'pediatre', 'psychiatre', 'ophtalmologue', 'orl']
    const nonPhysicians = ['kinesitherapeute', 'osteopathe', 'infirmier', 'orthophoniste', 'sage-femme', 'sophrologue', 'naturopathe', 'hypnotherapeute']

    for (const slug of physicians) {
      expect(specialtySchemaMap[slug]!.isPhysician).toBe(true)
    }
    for (const slug of nonPhysicians) {
      expect(specialtySchemaMap[slug]!.isPhysician).toBe(false)
    }
  })

  it('has medicalSpecialty only where appropriate', () => {
    expect(specialtySchemaMap['cardiologue']!.medicalSpecialty).toBe('Cardiovascular')
    expect(specialtySchemaMap['dermatologue']!.medicalSpecialty).toBeUndefined()
  })
})

describe('getSpecialtySchema', () => {
  it('returns the correct entry for a known slug', () => {
    const result = getSpecialtySchema('dentiste')
    expect(result.schemaType).toBe('Dentist')
    expect(result.parentType).toBe('MedicalBusiness')
  })

  it('falls back to default for unknown slugs', () => {
    const result = getSpecialtySchema('acupuncteur')
    expect(result.schemaType).toBe('MedicalBusiness')
    expect(result.parentType).toBe('LocalBusiness')
    expect(result.isPhysician).toBe(false)
  })
})
