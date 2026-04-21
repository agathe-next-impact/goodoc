/**
 * Re-exports the drizzle-zod-derived schemas from `@medsite/db/zod`
 * and the TypeScript row types from `@medsite/db`.
 *
 * Apps should import from `@medsite/types` — never directly from
 * `@medsite/db/zod` — so that non-DB types (Result, UUID, BookingMode)
 * and DB types live behind a single import surface.
 */

// Row types
export type {
  Address,
  BlogPost,
  ContactMessage,
  FaqItem,
  Media,
  NewAddress,
  NewBlogPost,
  NewContactMessage,
  NewFaqItem,
  NewMedia,
  NewOpeningHour,
  NewPage,
  NewPlan,
  NewPractitioner,
  NewService,
  NewSiteSettings,
  NewTenant,
  NewTestimonial,
  OpeningHour,
  Page,
  Plan,
  Practitioner,
  Service,
  SiteSettings,
  Tenant,
  Testimonial,
} from '@medsite/db'

// Zod schemas
export {
  addressInsertSchema,
  addressSelectSchema,
  addressUpdateSchema,
  blogPostInsertSchema,
  blogPostSelectSchema,
  blogPostUpdateSchema,
  contactMessageInsertSchema,
  contactMessageSelectSchema,
  contactMessageUpdateSchema,
  faqItemInsertSchema,
  faqItemSelectSchema,
  faqItemUpdateSchema,
  mediaInsertSchema,
  mediaSelectSchema,
  mediaUpdateSchema,
  openingHourInsertSchema,
  openingHourSelectSchema,
  openingHourUpdateSchema,
  pageInsertSchema,
  pageSelectSchema,
  pageUpdateSchema,
  planInsertSchema,
  planSelectSchema,
  planUpdateSchema,
  practitionerInsertSchema,
  practitionerSelectSchema,
  practitionerUpdateSchema,
  serviceInsertSchema,
  serviceSelectSchema,
  serviceUpdateSchema,
  siteSettingsInsertSchema,
  siteSettingsSelectSchema,
  siteSettingsUpdateSchema,
  tenantInsertSchema,
  tenantSelectSchema,
  tenantUpdateSchema,
  testimonialInsertSchema,
  testimonialSelectSchema,
  testimonialUpdateSchema,
} from '@medsite/db/zod'
