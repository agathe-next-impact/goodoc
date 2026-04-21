import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Maps French specialty names → schema.org types.
 * Aligns with @medsite/seo specialtySchemaMap.
 */
const SPECIALTY_SLUG_MAP: Record<string, { slug: string; schemaOrgType: string }> = {
  'dermatologue': { slug: 'dermatologue', schemaOrgType: 'Dermatology' },
  'dentiste': { slug: 'dentiste', schemaOrgType: 'Dentist' },
  'ophtalmologue': { slug: 'ophtalmologue', schemaOrgType: 'Optometric' },
  'orl': { slug: 'orl', schemaOrgType: 'Otolaryngologic' },
  'cardiologue': { slug: 'cardiologue', schemaOrgType: 'Physician' },
  'gynécologue': { slug: 'gynecologue', schemaOrgType: 'Gynecologic' },
  'gynecologue': { slug: 'gynecologue', schemaOrgType: 'Gynecologic' },
  'pédiatre': { slug: 'pediatre', schemaOrgType: 'Pediatric' },
  'pediatre': { slug: 'pediatre', schemaOrgType: 'Pediatric' },
  'psychiatre': { slug: 'psychiatre', schemaOrgType: 'Psychiatric' },
  'kinésithérapeute': { slug: 'kinesitherapeute', schemaOrgType: 'Physiotherapy' },
  'kinesitherapeute': { slug: 'kinesitherapeute', schemaOrgType: 'Physiotherapy' },
  'ostéopathe': { slug: 'osteopathe', schemaOrgType: 'MedicalBusiness' },
  'osteopathe': { slug: 'osteopathe', schemaOrgType: 'MedicalBusiness' },
  'infirmier': { slug: 'infirmier', schemaOrgType: 'Nursing' },
  'infirmière': { slug: 'infirmier', schemaOrgType: 'Nursing' },
  'orthophoniste': { slug: 'orthophoniste', schemaOrgType: 'MedicalBusiness' },
  'sage-femme': { slug: 'sage-femme', schemaOrgType: 'Midwifery' },
  'sophrologue': { slug: 'sophrologue', schemaOrgType: 'HealthAndBeautyBusiness' },
  'naturopathe': { slug: 'naturopathe', schemaOrgType: 'HealthAndBeautyBusiness' },
  'hypnothérapeute': { slug: 'hypnotherapeute', schemaOrgType: 'HealthAndBeautyBusiness' },
  'hypnotherapeute': { slug: 'hypnotherapeute', schemaOrgType: 'HealthAndBeautyBusiness' },
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Auto-generates specialtySlug from the specialty text.
 */
export const generateSpecialtySlugHook: CollectionBeforeChangeHook = ({
  data,
}) => {
  if (!data?.specialty) return data

  const normalized = data.specialty.toLowerCase().trim()
  const mapped = SPECIALTY_SLUG_MAP[normalized]

  data.specialtySlug = mapped?.slug ?? slugify(data.specialty)

  return data
}

/**
 * Auto-maps the schemaOrgType from the specialty.
 */
export const mapSchemaOrgTypeHook: CollectionBeforeChangeHook = ({
  data,
}) => {
  if (!data?.specialty) return data

  const normalized = data.specialty.toLowerCase().trim()
  const mapped = SPECIALTY_SLUG_MAP[normalized]

  data.schemaOrgType = mapped?.schemaOrgType ?? 'MedicalBusiness'

  return data
}
