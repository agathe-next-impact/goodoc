import {
  boolean,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { tenantStatusEnum } from './enums'
import { plans } from './plans'

/**
 * Root multi-tenant entity — one tenant per practitioner or practice.
 */
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    customDomain: varchar('custom_domain', { length: 255 }).unique(),
    domainVerified: boolean('domain_verified').notNull().default(false),
    planId: uuid('plan_id').references(() => plans.id),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
    status: tenantStatusEnum('status').notNull().default('trial'),
    trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
    onboardingStep: integer('onboarding_step').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('tenants_slug_idx').on(t.slug),
    index('tenants_custom_domain_idx').on(t.customDomain),
    index('tenants_status_idx').on(t.status),
  ],
)

export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert
