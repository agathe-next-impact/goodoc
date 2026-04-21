import type { MetadataRoute } from 'next'

import { getTenantOrNull } from '@/lib/tenant'
import { getPublishedBlogPosts, getPublishedServices } from '@/lib/queries'

const MARKETING_PATHS = ['/']

/**
 * Dynamic sitemap — per-hostname. On marketing hosts, returns the list
 * of public marketing pages. On tenant hosts, returns all tenant routes
 * including dynamic services and blog posts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await getTenantOrNull()
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3003'
  const now = new Date()

  if (!tenant) {
    return MARKETING_PATHS.map((path) => ({
      url: `${base}${path === '/' ? '' : path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : 0.8,
    }))
  }

  const tenantId = tenant.tenant.id
  const [servicesList, blogPosts] = await Promise.all([
    getPublishedServices(tenantId),
    getPublishedBlogPosts(tenantId, 100),
  ])

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/actes`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ...servicesList.map((s) => ({
      url: `${base}/actes/${s.slug}`,
      lastModified: s.updatedAt ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/rendez-vous`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...blogPosts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ]
}
