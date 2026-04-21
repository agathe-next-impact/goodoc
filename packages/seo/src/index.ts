/**
 * @medsite/seo — JSON-LD generators, meta helpers, schema.org specialty mapping.
 * Pure functions only — no Next.js dependency.
 */

// Types
export type {
  AddressSEOData,
  BlogPostSEOData,
  BreadcrumbItem,
  CredentialSEOData,
  FaqItemSEOData,
  JsonLdGraph,
  OpeningHourSEOData,
  PractitionerSEOData,
  ReviewStatsSEOData,
  ServiceSEOData,
  SocialLinksSEOData,
  TenantSEOData,
} from './types'

export type { PageMetadata } from './meta'
export type { SpecialtySchema } from './specialty-map'

// Specialty mapping
export { getSpecialtySchema, specialtySchemaMap } from './specialty-map'

// JSON-LD generators
export { generateHomeJsonLd } from './generators/home'
export { generatePractitionerJsonLd } from './generators/practitioner'
export { generateServiceJsonLd } from './generators/service'
export { generateFaqJsonLd } from './generators/faq'
export { generateArticleJsonLd } from './generators/article'
export { buildBreadcrumbItems, generateBreadcrumbJsonLd } from './generators/breadcrumb'
export { generateWebSiteJsonLd } from './generators/website'

// Meta helpers
export { generatePageMetadata } from './meta'

// React component
export { JsonLd } from './components/json-ld'
