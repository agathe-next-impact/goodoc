import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { tenants } from './tenants'

export const userRoleEnum = pgEnum('enum_users_role', [
  'super-admin',
  'practitioner',
  'collaborator',
])

/**
 * Payload CMS auth collection — back-office users.
 *
 * Column layout matches what `@payloadcms/db-postgres` expects for a
 * collection with `auth: true`, so Payload reads/writes to this table
 * directly (we run with `push: false` — no Payload-side migrations).
 *
 * Unlike app tables, `users` is NOT strictly tenant-scoped: super admins
 * have `tenantId = null`; practitioners/collaborators belong to one tenant.
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    // Custom fields (from apps/admin/src/collections/Users.ts)
    name: varchar('name', { length: 255 }),
    role: userRoleEnum('role').notNull().default('practitioner'),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'cascade',
    }),

    // Payload auth fields (auto-added when `auth: true`).
    // `hash` and `salt` are `text` because Payload's pbkdf2 output runs ~1024
    // characters — varchar(255) overflows with the `22001` Postgres error.
    email: varchar('email', { length: 255 }).notNull().unique(),
    hash: text('hash'),
    salt: text('salt'),
    resetPasswordToken: text('reset_password_token'),
    resetPasswordExpiration: timestamp('reset_password_expiration', {
      withTimezone: true,
    }),
    loginAttempts: integer('login_attempts').notNull().default(0),
    lockUntil: timestamp('lock_until', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('users_email_idx').on(t.email),
    index('users_tenant_idx').on(t.tenantId),
  ],
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
