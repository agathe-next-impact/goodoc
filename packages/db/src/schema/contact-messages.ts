import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { messageStatusEnum } from './enums'
import { tenants } from './tenants'

export const contactMessages = pgTable(
  'contact_messages',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    senderName: varchar('sender_name', { length: 200 }).notNull(),
    senderEmail: varchar('sender_email', { length: 255 }).notNull(),
    senderPhone: varchar('sender_phone', { length: 20 }),
    subject: varchar('subject', { length: 300 }),
    message: text('message').notNull(),
    motif: varchar('motif', { length: 100 }),
    status: messageStatusEnum('status').notNull().default('new'),
    repliedAt: timestamp('replied_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('contact_messages_tenant_idx').on(t.tenantId),
    index('contact_messages_status_idx').on(t.status),
    index('contact_messages_created_at_idx').on(t.createdAt.desc()),
  ],
)

export type ContactMessage = typeof contactMessages.$inferSelect
export type NewContactMessage = typeof contactMessages.$inferInsert
