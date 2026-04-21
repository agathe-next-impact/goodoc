import type { BreadcrumbItem, JsonLdGraph } from '../types'

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  }
}

/**
 * Convenience builder: always starts with "Accueil" and the site URL.
 */
export function buildBreadcrumbItems(
  siteUrl: string,
  ...segments: { name: string; path: string }[]
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ name: 'Accueil', url: siteUrl }]

  for (const segment of segments) {
    items.push({
      name: segment.name,
      url: `${siteUrl}${segment.path}`,
    })
  }

  return items
}
