import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

/**
 * System table — no tenantId. Lists the available subscription plans.
 */
export const plans = pgTable('plans', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: varchar('name', { length: 50 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  priceMonthly: decimal('price_monthly', { precision: 8, scale: 2 }).notNull(),
  setupFee: decimal('setup_fee', { precision: 8, scale: 2 }).notNull().default('0'),
  maxPages: integer('max_pages').notNull(),
  features: jsonb('features').$type<Record<string, boolean>>().notNull().default({}),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Plan = typeof plans.$inferSelect
export type NewPlan = typeof plans.$inferInsert
