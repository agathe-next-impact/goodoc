import 'server-only'

import {
  addresses,
  openingHours,
  practitioners,
  siteSettings,
  tenants,
} from '@medsite/db'
import { eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

import { db } from './db'
import { tenantCache, type CachedTenant } from './tenant-cache'
import type {
  Tenant,
  TenantAddress,
  TenantCore,
  TenantOpeningHour,
  TenantPractitioner,
  TenantSiteSettings,
} from './tenant-types'

// ─────────────────────────────────────────────────────────────────
// Minimal lookup — used by the tenant layout to decide "is this
// hostname valid, suspended, or unknown?" before rendering anything.
// Results flow through the in-process TenantCache (60s TTL).
// ─────────────────────────────────────────────────────────────────

async function lookupBySlugRaw(slug: string): Promise<CachedTenant | null> {
  const rows = await db()
    .select({
      tenantId: tenants.id,
      slug: tenants.slug,
      status: tenants.status,
      templateId: siteSettings.templateId,
    })
    .from(tenants)
    .leftJoin(siteSettings, eq(siteSettings.tenantId, tenants.id))
    .where(eq(tenants.slug, slug))
    .limit(1)

  const row = rows[0]
  if (!row) return null
  return {
    tenantId: row.tenantId,
    slug: row.slug,
    status: row.status,
    templateId: row.templateId ?? 'specialist',
  }
}

async function lookupByCustomDomainRaw(
  domain: string,
): Promise<CachedTenant | null> {
  const rows = await db()
    .select({
      tenantId: tenants.id,
      slug: tenants.slug,
      status: tenants.status,
      templateId: siteSettings.templateId,
    })
    .from(tenants)
    .leftJoin(siteSettings, eq(siteSettings.tenantId, tenants.id))
    .where(eq(tenants.customDomain, domain))
    .limit(1)

  const row = rows[0]
  if (!row) return null
  return {
    tenantId: row.tenantId,
    slug: row.slug,
    status: row.status,
    templateId: row.templateId ?? 'specialist',
  }
}

export async function resolveBySlug(
  host: string,
  slug: string,
): Promise<CachedTenant | null> {
  const hit = tenantCache.get(host)
  if (hit !== undefined) return hit
  const value = await lookupBySlugRaw(slug)
  tenantCache.set(host, value)
  return value
}

export async function resolveByCustomDomain(
  host: string,
): Promise<CachedTenant | null> {
  const hit = tenantCache.get(host)
  if (hit !== undefined) return hit
  const value = await lookupByCustomDomainRaw(host)
  tenantCache.set(host, value)
  return value
}

// ─────────────────────────────────────────────────────────────────
// Full tenant fetch — the joined shape used by Server Components.
// Wrapped in `unstable_cache` so React Server Components share a
// deduplicated request-scoped + 60s network cache, tagged by tenant id.
// ─────────────────────────────────────────────────────────────────

async function fetchFullTenantRaw(tenantId: string): Promise<Tenant | null> {
  const client = db()

  const tenantRow = await client.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  })
  if (!tenantRow) return null

  const practitionerRow = await client.query.practitioners.findFirst({
    where: eq(practitioners.tenantId, tenantId),
  })
  if (!practitionerRow) return null

  const addressRow = await client.query.addresses.findFirst({
    where: eq(addresses.tenantId, tenantId),
  })

  const settingsRow = await client.query.siteSettings.findFirst({
    where: eq(siteSettings.tenantId, tenantId),
  })

  const hoursRows = addressRow
    ? await client
        .select({
          dayOfWeek: openingHours.dayOfWeek,
          openTime: openingHours.openTime,
          closeTime: openingHours.closeTime,
          isClosed: openingHours.isClosed,
        })
        .from(openingHours)
        .where(eq(openingHours.addressId, addressRow.id))
    : []

  const core: TenantCore = {
    id: tenantRow.id,
    slug: tenantRow.slug,
    name: tenantRow.name,
    status: tenantRow.status,
    planId: tenantRow.planId,
  }

  const practitioner: TenantPractitioner = {
    id: practitionerRow.id,
    firstName: practitionerRow.firstName,
    lastName: practitionerRow.lastName,
    title: practitionerRow.title,
    specialty: practitionerRow.specialty,
    specialtySlug: practitionerRow.specialtySlug,
    schemaOrgType: practitionerRow.schemaOrgType,
    adeliRpps: practitionerRow.adeliRpps,
    bio: practitionerRow.bio,
    photoUrl: practitionerRow.photoUrl,
    phoneNumber: practitionerRow.phoneNumber,
    email: practitionerRow.email,
    doctolibUrl: practitionerRow.doctolibUrl,
    doctolibSlug: practitionerRow.doctolibSlug,
    alternativeBookingUrl: practitionerRow.alternativeBookingUrl,
    bookingMode: practitionerRow.bookingMode,
    ctaLabel: practitionerRow.ctaLabel,
    showDoctolibWidget: practitionerRow.showDoctolibWidget,
  }

  const primaryAddress: TenantAddress | null = addressRow
    ? {
        id: addressRow.id,
        label: addressRow.label,
        streetAddress: addressRow.streetAddress,
        postalCode: addressRow.postalCode,
        city: addressRow.city,
        country: addressRow.country,
        latitude: addressRow.latitude,
        longitude: addressRow.longitude,
        isPrimary: addressRow.isPrimary,
      }
    : null

  const siteSettingsView: TenantSiteSettings | null = settingsRow
    ? {
        templateId: settingsRow.templateId,
        primaryColor: settingsRow.primaryColor,
        secondaryColor: settingsRow.secondaryColor,
        fontHeading: settingsRow.fontHeading,
        fontBody: settingsRow.fontBody,
        logoUrl: settingsRow.logoUrl,
        faviconUrl: settingsRow.faviconUrl,
        googleBusinessUrl: settingsRow.googleBusinessUrl,
        facebookUrl: settingsRow.facebookUrl,
        instagramUrl: settingsRow.instagramUrl,
        linkedinUrl: settingsRow.linkedinUrl,
        plausibleSiteId: settingsRow.plausibleSiteId,
        googleAnalyticsId: settingsRow.googleAnalyticsId,
        legalMentions: settingsRow.legalMentions,
        privacyPolicy: settingsRow.privacyPolicy,
        cookieConsent: settingsRow.cookieConsent,
      }
    : null

  const tenantOpeningHours: TenantOpeningHour[] = hoursRows.map((h) => ({
    dayOfWeek: h.dayOfWeek,
    openTime: h.openTime,
    closeTime: h.closeTime,
    isClosed: h.isClosed,
  }))

  return {
    tenant: core,
    practitioner,
    primaryAddress,
    openingHours: tenantOpeningHours,
    siteSettings: siteSettingsView,
  }
}

/**
 * Fetches the full tenant view with React Server Component cache:
 * - Deduplicated per-request
 * - Network-cached for 60s across requests
 * - Tagged `tenant:<id>` for `revalidateTag()` invalidation
 */
export function fetchFullTenant(tenantId: string): Promise<Tenant | null> {
  const cached = unstable_cache(
    async () => fetchFullTenantRaw(tenantId),
    ['tenant-full', tenantId],
    {
      tags: [`tenant:${tenantId}`],
      revalidate: 60,
    },
  )
  return cached()
}
