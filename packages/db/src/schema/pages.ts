import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { pageTypeEnum } from './enums'
import { tenants } from './tenants'

export const pages = pgTable(
  'pages',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull(),
    pageType: pageTypeEnum('page_type').notNull().default('custom'),
    // Payload CMS blocks — jsonb for flexible schema evolution.
    content: jsonb('content').$type<unknown[]>(),
    isPublished: boolean('is_published').notNull().default(false),
    isDraft: boolean('is_draft').notNull().default(true),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    metaTitle: varchar('meta_title', { length: 200 }),
    metaDescription: varchar('meta_description', { length: 300 }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('pages_tenant_idx').on(t.tenantId),
    index('pages_slug_idx').on(t.slug),
    index('pages_type_idx').on(t.pageType),
  ],
)

export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert
