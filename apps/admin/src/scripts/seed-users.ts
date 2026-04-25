/**
 * Seeds Payload auth users for local development.
 *
 * Run AFTER `pnpm db:seed` (which creates tenants), via:
 *   pnpm --filter @medsite/admin seed:users
 *
 * Idempotent: skips users that already exist by email. Uses the Payload
 * Local API so passwords are hashed via Payload's built-in pbkdf2 (matches
 * the `users.hash` / `users.salt` columns expected by the auth flow). Direct
 * SQL inserts would produce unloggable accounts.
 */

import { createDbClient } from '@medsite/db'
import { tenants } from '@medsite/db/schema'
import { eq } from 'drizzle-orm'
import { getPayload } from 'payload'

import config from '../payload.config'

if (process.env.NODE_ENV === 'production') {
  throw new Error('Refusing to seed users in production')
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed users')
}

type SeedUser = {
  email: string
  password: string
  name: string
  role: 'super-admin' | 'practitioner'
  tenantSlug: string | null
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@medsite.fr',
    password: 'Admin1234!',
    name: 'Admin MedSite',
    role: 'super-admin',
    tenantSlug: null,
  },
  {
    email: 'dr.martin@medsite.fr',
    password: 'Test1234!',
    name: 'Dr. Sophie Martin',
    role: 'practitioner',
    tenantSlug: 'dr-sophie-martin',
  },
  {
    email: 'dr.dupont@medsite.fr',
    password: 'Test1234!',
    name: 'Julien Dupont',
    role: 'practitioner',
    tenantSlug: 'cabinet-dupont',
  },
  {
    email: 'emilie.rousseau@medsite.fr',
    password: 'Test1234!',
    name: 'Émilie Rousseau',
    role: 'practitioner',
    tenantSlug: 'emilie-rousseau',
  },
]

async function main() {
  const db = createDbClient(databaseUrl!)
  const payload = await getPayload({ config })

  let created = 0
  let skipped = 0

  for (const user of SEED_USERS) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      console.warn(`  ↷ ${user.email} already exists — skipping`)
      skipped++
      continue
    }

    let tenantId: string | null = null
    if (user.tenantSlug) {
      const found = await db
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.slug, user.tenantSlug))
        .limit(1)
      const row = found[0]
      if (!row) {
        throw new Error(
          `Tenant '${user.tenantSlug}' not found. Run \`pnpm db:seed\` first.`,
        )
      }
      tenantId = row.id
    }

    await payload.create({
      collection: 'users',
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role,
        tenantId,
      },
    })

    console.warn(
      `  ✓ ${user.email} (${user.role}${tenantId ? ` → ${user.tenantSlug}` : ''})`,
    )
    created++
  }

  console.warn(`\nSeeded ${created} user(s), skipped ${skipped}.`)
  console.warn('\nDev login credentials:')
  for (const u of SEED_USERS) {
    console.warn(`  ${u.email}  /  ${u.password}`)
  }
  console.warn('\nAdmin URL: http://localhost:3001/admin')

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
