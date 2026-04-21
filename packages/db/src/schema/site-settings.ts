import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { tenants } from './tenants'

/**
 * 1:1 with tenant — site-level settings: theming, social links, legal text.
 */
export const siteSettings = pgTable('site_settings', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  tenantId: uuid('tenant_id')
    .notNull()
    .unique()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  templateId: varchar('template_id', { length: 50 }).notNull().default('specialist'),
  primaryColor: varchar('primary_color', { length: 7 }),
  secondaryColor: varchar('secondary_color', { length: 7 }),
  fontHeading: varchar('font_heading', { length: 100 }),
  fontBody: varchar('font_body', { length: 100 }),
  logoUrl: varchar('logo_url', { length: 500 }),
  faviconUrl: varchar('favicon_url', { length: 500 }),
  // Social links
  googleBusinessUrl: varchar('google_business_url', { length: 500 }),
  facebookUrl: varchar('facebook_url', { length: 500 }),
  instagramUrl: varchar('instagram_url', { length: 500 }),
  linkedinUrl: varchar('linkedin_url', { length: 500 }),
  // Analytics
  plausibleSiteId: varchar('plausible_site_id', { length: 100 }),
  googleAnalyticsId: varchar('google_analytics_id', { length: 20 }),
  // Legal
  legalMentions: text('legal_mentions'),
  privacyPolicy: text('privacy_policy'),
  cookieConsent: boolean('cookie_consent').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SiteSettings = typeof siteSettings.$inferSelect
export type NewSiteSettings = typeof siteSettings.$inferInsert
