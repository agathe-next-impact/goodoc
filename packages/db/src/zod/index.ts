import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import {
  addresses,
  blogPosts,
  contactMessages,
  faqItems,
  media,
  openingHours,
  pages,
  plans,
  practitioners,
  services,
  siteSettings,
  tenants,
  testimonials,
} from '../schema'

/**
 * Auto-derived Zod schemas for every table.
 *
 * Pattern per table:
 *   - `xxxSelectSchema` — shape of rows returned by SELECT (API responses)
 *   - `xxxInsertSchema` — shape required to INSERT (omits server-managed
 *     defaults like id/createdAt/updatedAt)
 *   - `xxxUpdateSchema` — partial of insert (omits timestamps) for PATCH
 *
 * These are re-exported from `@medsite/types` for public consumption.
 */

// ── tenants ───────────────────────────────────────────────────────
export const tenantSelectSchema = createSelectSchema(tenants)
export const tenantInsertSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const tenantUpdateSchema = tenantInsertSchema.partial()

// ── plans ─────────────────────────────────────────────────────────
export const planSelectSchema = createSelectSchema(plans)
export const planInsertSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const planUpdateSchema = planInsertSchema.partial()

// ── practitioners ─────────────────────────────────────────────────
export const practitionerSelectSchema = createSelectSchema(practitioners)
export const practitionerInsertSchema = createInsertSchema(practitioners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const practitionerUpdateSchema = practitionerInsertSchema.partial()

// ── addresses ─────────────────────────────────────────────────────
export const addressSelectSchema = createSelectSchema(addresses)
export const addressInsertSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const addressUpdateSchema = addressInsertSchema.partial()

// ── opening hours ─────────────────────────────────────────────────
export const openingHourSelectSchema = createSelectSchema(openingHours)
export const openingHourInsertSchema = createInsertSchema(openingHours).omit({
  id: true,
})
export const openingHourUpdateSchema = openingHourInsertSchema.partial()

// ── services ──────────────────────────────────────────────────────
export const serviceSelectSchema = createSelectSchema(services)
export const serviceInsertSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const serviceUpdateSchema = serviceInsertSchema.partial()

// ── pages ─────────────────────────────────────────────────────────
export const pageSelectSchema = createSelectSchema(pages)
export const pageInsertSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const pageUpdateSchema = pageInsertSchema.partial()

// ── blog posts ────────────────────────────────────────────────────
export const blogPostSelectSchema = createSelectSchema(blogPosts)
export const blogPostInsertSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const blogPostUpdateSchema = blogPostInsertSchema.partial()

// ── faq items ─────────────────────────────────────────────────────
export const faqItemSelectSchema = createSelectSchema(faqItems)
export const faqItemInsertSchema = createInsertSchema(faqItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const faqItemUpdateSchema = faqItemInsertSchema.partial()

// ── testimonials ──────────────────────────────────────────────────
export const testimonialSelectSchema = createSelectSchema(testimonials)
export const testimonialInsertSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const testimonialUpdateSchema = testimonialInsertSchema.partial()

// ── contact messages ──────────────────────────────────────────────
export const contactMessageSelectSchema = createSelectSchema(contactMessages)
export const contactMessageInsertSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
})
export const contactMessageUpdateSchema = contactMessageInsertSchema.partial()

// ── site settings ─────────────────────────────────────────────────
export const siteSettingsSelectSchema = createSelectSchema(siteSettings)
export const siteSettingsInsertSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const siteSettingsUpdateSchema = siteSettingsInsertSchema.partial()

// ── media ─────────────────────────────────────────────────────────
export const mediaSelectSchema = createSelectSchema(media)
export const mediaInsertSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
})
export const mediaUpdateSchema = mediaInsertSchema.partial()
