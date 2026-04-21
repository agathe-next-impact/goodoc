import { boolean, integer, pgTable, time, uuid } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { addresses } from './addresses'
import { tenants } from './tenants'

/**
 * Opening hours per address — `dayOfWeek` 0=monday … 6=sunday.
 */
export const openingHours = pgTable('opening_hours', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  addressId: uuid('address_id')
    .notNull()
    .references(() => addresses.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  openTime: time('open_time'),
  closeTime: time('close_time'),
  isClosed: boolean('is_closed').notNull().default(false),
})

export type OpeningHour = typeof openingHours.$inferSelect
export type NewOpeningHour = typeof openingHours.$inferInsert
