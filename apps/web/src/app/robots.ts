import type { MetadataRoute } from 'next'

import { getTenantOrNull } from '@/lib/tenant'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const tenant = await getTenantOrNull()
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3003'

  // Suspended / cancelled tenants: disallow indexing.
  if (tenant && tenant.tenant.status !== 'active' && tenant.tenant.status !== 'trial') {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] }],
    sitemap: `${base}/sitemap.xml`,
  }
}
