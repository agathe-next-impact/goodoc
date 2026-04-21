import type { OpeningHourSEOData, TenantSEOData } from './types'

const DAY_MAP = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export function formatOpeningHours(
  hours: OpeningHourSEOData[],
): Record<string, unknown>[] {
  return hours
    .filter((h) => !h.isClosed && h.openTime && h.closeTime)
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': DAY_MAP[h.dayOfWeek],
      'opens': h.openTime,
      'closes': h.closeTime,
    }))
}

export function buildSameAs(tenant: TenantSEOData): string[] {
  const links: string[] = []
  const { socialLinks, practitioner } = tenant

  if (practitioner.doctolibUrl) links.push(practitioner.doctolibUrl)
  if (socialLinks.googleBusinessUrl) links.push(socialLinks.googleBusinessUrl)
  if (socialLinks.facebookUrl) links.push(socialLinks.facebookUrl)
  if (socialLinks.instagramUrl) links.push(socialLinks.instagramUrl)
  if (socialLinks.linkedinUrl) links.push(socialLinks.linkedinUrl)

  return links
}

export function fullName(practitioner: { firstName: string; lastName: string }): string {
  return `${practitioner.firstName} ${practitioner.lastName}`
}

export function buildAddress(address: TenantSEOData['address']): Record<string, unknown> {
  return {
    '@type': 'PostalAddress',
    'streetAddress': address.streetAddress,
    'addressLocality': address.city,
    'postalCode': address.postalCode,
    'addressCountry': address.country,
  }
}

export function buildGeo(
  address: TenantSEOData['address'],
): Record<string, unknown> | undefined {
  if (!address.latitude || !address.longitude) return undefined
  return {
    '@type': 'GeoCoordinates',
    'latitude': address.latitude,
    'longitude': address.longitude,
  }
}
