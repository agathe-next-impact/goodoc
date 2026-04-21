import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { tenants } from './tenants'

export const media = pgTable('media', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(),
  width: integer('width'),
  height: integer('height'),
  url: varchar('url', { length: 500 }).notNull(),
  alt: varchar('alt', { length: 300 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert
