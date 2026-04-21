import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { tenants } from './tenants'

export const testimonials = pgTable('testimonials', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  authorInitials: varchar('author_initials', { length: 5 }),
  content: text('content').notNull(),
  rating: integer('rating'),
  source: varchar('source', { length: 50 }).notNull().default('manual'),
  googleReviewId: varchar('google_review_id', { length: 255 }),
  consentGiven: boolean('consent_given').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(true),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Testimonial = typeof testimonials.$inferSelect
export type NewTestimonial = typeof testimonials.$inferInsert
