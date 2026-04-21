/**
 * Runtime tenant types — the fully-joined view returned by `getTenant()`.
 * Kept in their own file so it can be imported from edge-safe modules
 * (like `tenant-cache.ts`) without pulling in `@medsite/db` (postgres).
 */

export type TenantStatus = 'trial' | 'active' | 'suspended' | 'cancelled'
export type BookingMode = 'doctolib' | 'alternative' | 'contact'

/** Minimal shape used to theme the site and route between apps. */
export interface TenantCore {
  id: string
  slug: string
  name: string
  status: TenantStatus
  planId: string | null
}

export interface TenantPractitioner {
  id: string
  firstName: string
  lastName: string
  title: string | null
  specialty: string
  specialtySlug: string
  schemaOrgType: string
  adeliRpps: string | null
  bio: string | null
  photoUrl: string | null
  phoneNumber: string | null
  email: string | null
  doctolibUrl: string | null
  doctolibSlug: string | null
  alternativeBookingUrl: string | null
  bookingMode: BookingMode
  ctaLabel: string | null
  showDoctolibWidget: boolean
}

export interface TenantAddress {
  id: string
  label: string | null
  streetAddress: string
  postalCode: string
  city: string
  country: string
  latitude: string | null
  longitude: string | null
  isPrimary: boolean
}

export interface TenantOpeningHour {
  dayOfWeek: number
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
}

export interface TenantSiteSettings {
  templateId: string
  primaryColor: string | null
  secondaryColor: string | null
  fontHeading: string | null
  fontBody: string | null
  logoUrl: string | null
  faviconUrl: string | null
  googleBusinessUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
  plausibleSiteId: string | null
  googleAnalyticsId: string | null
  legalMentions: string | null
  privacyPolicy: string | null
  cookieConsent: boolean
}

/**
 * The joined, app-ready view of a tenant — what `getTenant()` returns.
 */
export interface Tenant {
  tenant: TenantCore
  practitioner: TenantPractitioner
  primaryAddress: TenantAddress | null
  openingHours: TenantOpeningHour[]
  siteSettings: TenantSiteSettings | null
}

export class TenantNotFoundError extends Error {
  constructor(message = 'Tenant not found for this request') {
    super(message)
    this.name = 'TenantNotFoundError'
  }
}
