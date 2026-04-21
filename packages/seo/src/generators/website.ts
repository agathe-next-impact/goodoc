import type { JsonLdGraph, TenantSEOData } from '../types'

export function generateWebSiteJsonLd(
  tenant: TenantSEOData,
  options?: { hasBlog: boolean },
): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${tenant.siteUrl}/#website`,
    'name': tenant.practitioner.businessName,
    'url': tenant.siteUrl,
    'publisher': {
      '@id': `${tenant.siteUrl}/#organization`,
    },
    'inLanguage': 'fr-FR',
    ...(options?.hasBlog && {
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${tenant.siteUrl}/blog?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  }
}
