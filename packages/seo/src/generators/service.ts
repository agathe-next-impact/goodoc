import type { JsonLdGraph, ServiceSEOData, TenantSEOData } from '../types'

export function generateServiceJsonLd(
  tenant: TenantSEOData,
  service: ServiceSEOData,
): JsonLdGraph {
  const hasPrice = service.showPrice && service.priceMin

  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalProcedure', 'Service'],
    '@id': `${tenant.siteUrl}/actes/${service.slug}/#service`,
    'name': service.title,
    ...(service.shortDescription && {
      'description': service.shortDescription,
    }),
    ...(service.procedureType && {
      'procedureType': service.procedureType,
    }),
    ...(service.bodyLocation && {
      'bodyLocation': service.bodyLocation,
    }),
    ...(service.imageUrl && {
      'image': service.imageUrl,
    }),
    'provider': {
      '@id': `${tenant.siteUrl}/#practitioner`,
    },
    ...(hasPrice && {
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'EUR',
        'price': service.priceMin,
        ...(service.priceMax &&
          service.priceMax !== service.priceMin && {
            'highPrice': service.priceMax,
          }),
        'availability': 'https://schema.org/InStock',
      },
    }),
    ...(service.duration && {
      'timeRequired': `PT${service.duration}M`,
    }),
    'url': `${tenant.siteUrl}/actes/${service.slug}`,
  }
}
