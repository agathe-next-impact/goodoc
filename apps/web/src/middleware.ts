import { NextResponse, type NextRequest } from 'next/server'

import { classifyHost, normalizeHost } from './lib/tenant-hostname'

/**
 * Multi-tenant middleware — runs on every request.
 *
 * Design constraints:
 *   • Edge-safe: NO database, NO `@medsite/db`, NO Node-only APIs.
 *     The actual tenant lookup happens later in Server Components via
 *     `getTenant()` (which uses the in-process `TenantCache`).
 *   • Fast: pure string parsing, no async work apart from the rewrite.
 *
 * Responsibilities:
 *   1. Classify the incoming hostname (marketing / reserved / tenant subdomain
 *      / tenant custom domain).
 *   2. On marketing hostnames, rewrite `/<path>` → `/marketing/<path>`
 *      so the marketing pages serve without colliding with the tenant
 *      routes at `/`.
 *   3. On tenant hostnames, forward a handful of headers so downstream
 *      Server Components know which tenant to resolve:
 *        - `x-tenant-host` (normalised host, cache key)
 *        - `x-tenant-slug-candidate` (subdomain slug, when applicable)
 *        - `x-tenant-custom-domain` (host, when custom domain)
 *        - `x-tenant-override` (pass-through from incoming request — E2E)
 *   4. Block `/marketing/*` on tenant hostnames (should never be accessed).
 */
export function middleware(request: NextRequest): NextResponse {
  const rawHost = request.headers.get('host') ?? ''
  const host = normalizeHost(rawHost)
  const override = request.headers.get('x-tenant-override')
  const resolution = classifyHost(rawHost, override)
  const pathname = request.nextUrl.pathname

  // Headers forwarded to Server Components via NextResponse.next({ request })
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-host', host)
  if (override) requestHeaders.set('x-tenant-override', override)

  switch (resolution.kind) {
    case 'reserved-subdomain':
      // admin / platform / api etc. — let their own app routes handle it.
      // (In production, these usually hit different deployments entirely.)
      return NextResponse.next({ request: { headers: requestHeaders } })

    case 'marketing': {
      // Rewrite `/<path>` → `/marketing/<path>`.
      // Already-prefixed paths pass through unchanged to avoid a loop.
      if (pathname.startsWith('/marketing')) {
        return NextResponse.next({ request: { headers: requestHeaders } })
      }
      const url = request.nextUrl.clone()
      url.pathname = `/marketing${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    }

    case 'tenant-subdomain': {
      // Block `/marketing/*` on tenant hosts → 404 via app/not-found.tsx
      if (pathname.startsWith('/marketing')) {
        const url = request.nextUrl.clone()
        url.pathname = '/not-found'
        return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
      }
      requestHeaders.set('x-tenant-slug-candidate', resolution.slug)
      return NextResponse.next({ request: { headers: requestHeaders } })
    }

    case 'tenant-custom-domain': {
      if (pathname.startsWith('/marketing')) {
        const url = request.nextUrl.clone()
        url.pathname = '/not-found'
        return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
      }
      requestHeaders.set('x-tenant-custom-domain', resolution.domain)
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
  }
}

export const config = {
  matcher: [
    // Run on everything except Next.js internals and common static assets.
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|map)).*)',
  ],
}
