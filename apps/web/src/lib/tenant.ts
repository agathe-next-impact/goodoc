import 'server-only'

import { headers } from 'next/headers'

import { classifyHost } from './tenant-hostname'
import { resolveByCustomDomain, resolveBySlug, fetchFullTenant } from './tenant-resolver'
import type { Tenant } from './tenant-types'
import { TenantNotFoundError } from './tenant-types'

/**
 * Reads the tenant context set by middleware and joins the full
 * tenant view from the database.
 *
 * - **Throws** `TenantNotFoundError` if the hostname doesn't resolve
 *   to an active tenant — use this in layouts/pages that REQUIRE a
 *   tenant (they should then call `notFound()` or render a fallback).
 */
export async function getTenant(): Promise<Tenant> {
  const tenant = await getTenantOrNull()
  if (!tenant) throw new TenantNotFoundError()
  return tenant
}

/**
 * Same as `getTenant()` but returns `null` instead of throwing — use in
 * shared routes (e.g. `sitemap.ts`) that also run on the marketing host.
 */
export async function getTenantOrNull(): Promise<Tenant | null> {
  const h = await headers()
  const host = h.get('x-tenant-host') ?? h.get('host') ?? ''
  const override = h.get('x-tenant-override')

  const resolution = classifyHost(host, override)
  if (resolution.kind === 'marketing') return null
  if (resolution.kind === 'reserved-subdomain') return null

  const cached =
    resolution.kind === 'tenant-subdomain'
      ? await resolveBySlug(host, resolution.slug)
      : await resolveByCustomDomain(host)

  if (!cached) return null
  if (cached.status === 'cancelled') return null

  return fetchFullTenant(cached.tenantId)
}

export { TenantNotFoundError } from './tenant-types'
export type {
  BookingMode,
  Tenant,
  TenantAddress,
  TenantCore,
  TenantOpeningHour,
  TenantPractitioner,
  TenantSiteSettings,
  TenantStatus,
} from './tenant-types'
