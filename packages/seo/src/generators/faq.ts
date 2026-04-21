import type { FaqItemSEOData, JsonLdGraph, TenantSEOData } from '../types'

export function generateFaqJsonLd(
  tenant: TenantSEOData,
  items: FaqItemSEOData[],
): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${tenant.siteUrl}/faq/#faq`,
    'mainEntity': items.map((item) => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer,
      },
    })),
  }
}
