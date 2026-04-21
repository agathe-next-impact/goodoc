/**
 * SEO data types — pure inputs for JSON-LD generators.
 * These are NOT database types; they represent the pre-fetched data
 * a page passes into a generator function.
 */

export interface TenantSEOData {
  siteUrl: string
  practitioner: PractitionerSEOData
  address: AddressSEOData
  openingHours: OpeningHourSEOData[]
  socialLinks: SocialLinksSEOData
  reviewStats?: ReviewStatsSEOData
}

export interface PractitionerSEOData {
  firstName: string
  lastName: string
  title?: string
  specialty: string
  specialtySlug: string
  businessName: string
  bio?: string
  photoUrl?: string
  phoneNumber?: string
  email?: string
  doctolibUrl?: string
  credentials?: CredentialSEOData[]
  alumniOf?: string[]
  knowsAbout?: string[]
  memberOf?: string[]
}

export interface CredentialSEOData {
  name: string
  issuedBy?: string
  identifier?: string
}

export interface AddressSEOData {
  streetAddress: string
  city: string
  postalCode: string
  country: string
  latitude?: string
  longitude?: string
}

export interface OpeningHourSEOData {
  dayOfWeek: number
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
}

export interface SocialLinksSEOData {
  googleBusinessUrl?: string
  facebookUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
}

export interface ReviewStatsSEOData {
  average: number
  count: number
}

export interface ServiceSEOData {
  title: string
  slug: string
  shortDescription?: string
  procedureType?: string
  bodyLocation?: string
  priceMin?: string
  priceMax?: string
  showPrice: boolean
  duration?: number
  imageUrl?: string
  metaTitle?: string
  metaDescription?: string
}

export interface BlogPostSEOData {
  title: string
  slug: string
  excerpt?: string
  coverImageUrl?: string
  category?: string
  tags?: string[]
  publishedAt: string
  modifiedAt?: string
  metaTitle?: string
  metaDescription?: string
}

export interface FaqItemSEOData {
  question: string
  answer: string
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export type JsonLdGraph = Record<string, unknown>
