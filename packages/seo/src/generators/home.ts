import { buildAddress, buildGeo, buildSameAs, formatOpeningHours } from '../helpers'
import { getSpecialtySchema } from '../specialty-map'
import type { JsonLdGraph, TenantSEOData } from '../types'

export function generateHomeJsonLd(tenant: TenantSEOData): JsonLdGraph {
  const spec = getSpecialtySchema(tenant.practitioner.specialtySlug)
  const geo = buildGeo(tenant.address)

  return {
    '@context': 'https://schema.org',
    '@type': [spec.schemaType, 'LocalBusiness'],
    '@id': `${tenant.siteUrl}/#organization`,
    'name': tenant.practitioner.businessName,
    ...(tenant.practitioner.bio && {
      'description': tenant.practitioner.bio.substring(0, 300),
    }),
    'url': tenant.siteUrl,
    ...(tenant.practitioner.phoneNumber && {
      'telephone': tenant.practitioner.phoneNumber,
    }),
    ...(tenant.practitioner.email && {
      'email': tenant.practitioner.email,
    }),
    ...(tenant.practitioner.photoUrl && {
      'image': tenant.practitioner.photoUrl,
    }),
    'address': buildAddress(tenant.address),
    ...(geo && { 'geo': geo }),
    'openingHoursSpecification': formatOpeningHours(tenant.openingHours),
    ...(spec.medicalSpecialty && {
      'medicalSpecialty': spec.medicalSpecialty,
    }),
    'sameAs': buildSameAs(tenant),
    ...(tenant.reviewStats && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': tenant.reviewStats.average,
        'reviewCount': tenant.reviewStats.count,
        'bestRating': 5,
      },
    }),
  }
}
