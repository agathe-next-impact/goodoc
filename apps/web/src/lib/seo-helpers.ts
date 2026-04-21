import 'server-only'

import type { TenantSEOData } from '@medsite/seo'

import type { Tenant } from './tenant-types'

/**
 * Builds the canonical site URL for a tenant.
 */
export function buildSiteUrl(_tenant: Tenant): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3003'
  // In production we'd use custom domain or subdomain URL.
  // For now, fall back to base.
  return base
}

/**
 * Converts the runtime Tenant shape into TenantSEOData for the seo package.
 */
export function toTenantSEOData(tenant: Tenant): TenantSEOData {
  const { practitioner, primaryAddress, openingHours, siteSettings } = tenant
  const siteUrl = buildSiteUrl(tenant)

  return {
    siteUrl,
    practitioner: {
      firstName: practitioner.firstName,
      lastName: practitioner.lastName,
      title: practitioner.title ?? undefined,
      specialty: practitioner.specialty,
      specialtySlug: practitioner.specialtySlug,
      businessName: tenant.tenant.name,
      bio: practitioner.bio ?? undefined,
      photoUrl: practitioner.photoUrl ?? undefined,
      phoneNumber: practitioner.phoneNumber ?? undefined,
      email: practitioner.email ?? undefined,
      doctolibUrl: practitioner.doctolibUrl ?? undefined,
    },
    address: primaryAddress
      ? {
          streetAddress: primaryAddress.streetAddress,
          city: primaryAddress.city,
          postalCode: primaryAddress.postalCode,
          country: primaryAddress.country,
          latitude: primaryAddress.latitude ?? undefined,
          longitude: primaryAddress.longitude ?? undefined,
        }
      : {
          streetAddress: '',
          city: '',
          postalCode: '',
          country: 'FR',
        },
    openingHours: openingHours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
      isClosed: h.isClosed,
    })),
    socialLinks: {
      googleBusinessUrl: siteSettings?.googleBusinessUrl ?? undefined,
      facebookUrl: siteSettings?.facebookUrl ?? undefined,
      instagramUrl: siteSettings?.instagramUrl ?? undefined,
      linkedinUrl: siteSettings?.linkedinUrl ?? undefined,
    },
  }
}
