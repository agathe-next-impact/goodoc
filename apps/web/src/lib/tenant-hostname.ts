/**
 * Pure hostname parsing — no I/O, no DB. Safe to import from edge runtime
 * (middleware). All decisions about *how* to resolve a tenant are made here;
 * the actual DB lookup happens later in tenant-resolver.ts (Node runtime).
 */

/**
 * The root marketing host (with and without www). Anything else under
 * `medsite.fr` is either a reserved subdomain or a tenant subdomain.
 */
export const ROOT_HOST = 'medsite.fr'
export const MARKETING_HOSTS = new Set(['medsite.fr', 'www.medsite.fr'])

/**
 * Subdomains that are reserved by the platform and must pass through
 * the middleware unchanged (no tenant resolution).
 */
export const RESERVED_SUBDOMAINS = new Set([
  'admin',
  'platform',
  'api',
  'www',
  'static',
  'cdn',
])

/**
 * Local dev roots. Any subdomain of these is treated like a
 * `{slug}.medsite.fr` subdomain. Browsers resolve `*.localhost`
 * to 127.0.0.1 out of the box.
 */
const DEV_ROOTS = new Set(['localhost', '127.0.0.1'])

export type HostResolution =
  | { kind: 'marketing' }
  | { kind: 'reserved-subdomain'; subdomain: string }
  | { kind: 'tenant-subdomain'; slug: string }
  | { kind: 'tenant-custom-domain'; domain: string }

/**
 * Strips the port and lowercases the hostname.
 */
export function normalizeHost(rawHost: string): string {
  return rawHost.split(':')[0]?.toLowerCase() ?? ''
}

/**
 * Classifies a hostname into a resolution strategy.
 *
 * @param rawHost   the raw `Host` header value (may include a port)
 * @param override  optional tenant slug forced via `x-tenant-override` (E2E)
 */
export function classifyHost(
  rawHost: string,
  override?: string | null,
): HostResolution {
  if (override) {
    return { kind: 'tenant-subdomain', slug: override.toLowerCase() }
  }

  const host = normalizeHost(rawHost)
  if (!host) return { kind: 'marketing' }

  // Dev bare root: localhost / 127.0.0.1 without subdomain.
  if (DEV_ROOTS.has(host)) return { kind: 'marketing' }

  // Production marketing root.
  if (MARKETING_HOSTS.has(host)) return { kind: 'marketing' }

  // Dev subdomain: {slug}.localhost
  for (const devRoot of DEV_ROOTS) {
    if (host.endsWith('.' + devRoot)) {
      const slug = host.slice(0, -(devRoot.length + 1))
      if (RESERVED_SUBDOMAINS.has(slug)) {
        return { kind: 'reserved-subdomain', subdomain: slug }
      }
      return { kind: 'tenant-subdomain', slug }
    }
  }

  // Production subdomain: {slug}.medsite.fr
  if (host.endsWith('.' + ROOT_HOST)) {
    const slug = host.slice(0, -(ROOT_HOST.length + 1))
    if (RESERVED_SUBDOMAINS.has(slug)) {
      return { kind: 'reserved-subdomain', subdomain: slug }
    }
    // Guard against multi-level subdomains like a.b.medsite.fr
    if (slug.includes('.')) {
      return { kind: 'tenant-custom-domain', domain: host }
    }
    return { kind: 'tenant-subdomain', slug }
  }

  // Everything else: custom domain.
  return { kind: 'tenant-custom-domain', domain: host }
}
