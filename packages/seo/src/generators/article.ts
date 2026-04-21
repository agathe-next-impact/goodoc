import type { BlogPostSEOData, JsonLdGraph, TenantSEOData } from '../types'

export function generateArticleJsonLd(
  tenant: TenantSEOData,
  post: BlogPostSEOData,
): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${tenant.siteUrl}/blog/${post.slug}/#article`,
    'headline': post.title,
    ...(post.excerpt && { 'description': post.excerpt }),
    ...(post.coverImageUrl && { 'image': post.coverImageUrl }),
    'datePublished': post.publishedAt,
    ...(post.modifiedAt && { 'dateModified': post.modifiedAt }),
    'author': {
      '@id': `${tenant.siteUrl}/#practitioner`,
    },
    'publisher': {
      '@id': `${tenant.siteUrl}/#organization`,
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${tenant.siteUrl}/blog/${post.slug}`,
    },
    ...(post.category && {
      'articleSection': post.category,
    }),
    ...(post.tags && post.tags.length > 0 && {
      'keywords': post.tags.join(', '),
    }),
    'inLanguage': 'fr-FR',
  }
}
