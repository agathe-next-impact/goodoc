import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { tenants } from './tenants'

export const services = pgTable(
  'services',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull(),
    // Rich text stored as Payload blocks JSON — jsonb for query flexibility.
    description: jsonb('description').$type<unknown[]>(),
    shortDescription: varchar('short_description', { length: 500 }),
    duration: integer('duration'),
    priceMin: decimal('price_min', { precision: 8, scale: 2 }),
    priceMax: decimal('price_max', { precision: 8, scale: 2 }),
    showPrice: boolean('show_price').notNull().default(false),
    category: varchar('category', { length: 100 }),
    imageUrl: varchar('image_url', { length: 500 }),
    doctolibMotifSlug: varchar('doctolib_motif_slug', { length: 200 }),
    sortOrder: integer('sort_order').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(true),
    // SEO
    metaTitle: varchar('meta_title', { length: 200 }),
    metaDescription: varchar('meta_description', { length: 300 }),
    schemaOrgData: jsonb('schema_org_data').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('services_tenant_idx').on(t.tenantId),
    index('services_slug_idx').on(t.slug),
    index('services_published_idx').on(t.isPublished),
  ],
)

export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert
