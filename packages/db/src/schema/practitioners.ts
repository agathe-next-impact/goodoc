import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { bookingModeEnum } from './enums'
import { tenants } from './tenants'

/**
 * One practitioner per tenant (extensible to multi-practitioner cabinets later).
 */
export const practitioners = pgTable(
  'practitioners',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    title: varchar('title', { length: 50 }),
    specialty: varchar('specialty', { length: 100 }).notNull(),
    specialtySlug: varchar('specialty_slug', { length: 100 }).notNull(),
    schemaOrgType: varchar('schema_org_type', { length: 100 }).notNull(),
    adeliRpps: varchar('adeli_rpps', { length: 20 }),
    bio: text('bio'),
    photoUrl: varchar('photo_url', { length: 500 }),
    phoneNumber: varchar('phone_number', { length: 20 }),
    email: varchar('email', { length: 255 }),
    // Doctolib integration
    doctolibUrl: varchar('doctolib_url', { length: 500 }),
    doctolibSlug: varchar('doctolib_slug', { length: 200 }),
    alternativeBookingUrl: varchar('alternative_booking_url', { length: 500 }),
    bookingMode: bookingModeEnum('booking_mode').notNull().default('contact'),
    ctaLabel: varchar('cta_label', { length: 100 }),
    showDoctolibWidget: boolean('show_doctolib_widget').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('practitioners_tenant_idx').on(t.tenantId),
    index('practitioners_specialty_slug_idx').on(t.specialtySlug),
  ],
)

export type Practitioner = typeof practitioners.$inferSelect
export type NewPractitioner = typeof practitioners.$inferInsert
