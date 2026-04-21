import { buildAddress, fullName } from '../helpers'
import { getSpecialtySchema } from '../specialty-map'
import type { JsonLdGraph, TenantSEOData } from '../types'

export function generatePractitionerJsonLd(tenant: TenantSEOData): JsonLdGraph {
  const spec = getSpecialtySchema(tenant.practitioner.specialtySlug)
  const name = fullName(tenant.practitioner)
  const personType = spec.isPhysician ? 'Physician' : 'Person'

  return {
    '@context': 'https://schema.org',
    '@type': personType,
    '@id': `${tenant.siteUrl}/#practitioner`,
    'name': name,
    'givenName': tenant.practitioner.firstName,
    'familyName': tenant.practitioner.lastName,
    ...(tenant.practitioner.title && {
      'honorificPrefix': tenant.practitioner.title,
    }),
    ...(spec.medicalSpecialty && {
      'medicalSpecialty': spec.medicalSpecialty,
    }),
    ...(tenant.practitioner.bio && {
      'description': tenant.practitioner.bio.substring(0, 300),
    }),
    ...(tenant.practitioner.photoUrl && {
      'image': tenant.practitioner.photoUrl,
    }),
    'url': `${tenant.siteUrl}/a-propos`,
    'address': buildAddress(tenant.address),
    'worksFor': {
      '@id': `${tenant.siteUrl}/#organization`,
    },
    ...(tenant.practitioner.alumniOf &&
      tenant.practitioner.alumniOf.length > 0 && {
        'alumniOf': tenant.practitioner.alumniOf.map((school) => ({
          '@type': 'EducationalOrganization',
          'name': school,
        })),
      }),
    ...(tenant.practitioner.credentials &&
      tenant.practitioner.credentials.length > 0 && {
        'hasCredential': tenant.practitioner.credentials.map((cred) => ({
          '@type': 'EducationalOccupationalCredential',
          'credentialCategory': cred.name,
          ...(cred.issuedBy && {
            'recognizedBy': {
              '@type': 'Organization',
              'name': cred.issuedBy,
            },
          }),
          ...(cred.identifier && { 'identifier': cred.identifier }),
        })),
      }),
    ...(tenant.practitioner.knowsAbout &&
      tenant.practitioner.knowsAbout.length > 0 && {
        'knowsAbout': tenant.practitioner.knowsAbout,
      }),
    ...(tenant.practitioner.memberOf &&
      tenant.practitioner.memberOf.length > 0 && {
        'memberOf': tenant.practitioner.memberOf.map((org) => ({
          '@type': 'Organization',
          'name': org,
        })),
      }),
  }
}
