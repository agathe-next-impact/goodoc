import { practitioners, siteSettings, tenants } from '@medsite/db/schema'
import { eq } from 'drizzle-orm'
import config from '@payload-config'
import { getPayload } from 'payload'

import { db } from './db'

export type SignupInput = {
  email: string
  password: string
  name: string
  slug: string
  firstName: string
  lastName: string
  specialty: string
}

export type SignupResult = {
  userId: string
  tenantId: string
  practitionerId: string
}

/**
 * Provisions a new tenant and binds a Payload `practitioner` user to it.
 *
 * Creates, in order:
 *   1. tenant   (status: 'trial', onboardingStep: 1)
 *   2. practitioner stub  (just enough fields to satisfy NOT NULL constraints)
 *   3. siteSettings       (default templateId 'medical-classic')
 *   4. payload user       (via Local API → pbkdf2 hash → tenantId set)
 *
 * Drizzle transaction ensures rollback if any step fails. The Payload user
 * creation runs OUTSIDE the transaction because Payload manages its own
 * connection pool; if it fails we explicitly delete the tenant we just
 * created (cascade deletes the rest).
 */
export async function signup(input: SignupInput): Promise<SignupResult> {
  const client = db()

  // Pre-flight: slug + email uniqueness checks (cheap, before transaction).
  const existingTenant = await client
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, input.slug))
    .limit(1)
  if (existingTenant.length > 0) {
    throw new SignupError('SLUG_TAKEN', `Slug '${input.slug}' is already used`)
  }

  const payload = await getPayload({ config })
  const existingUser = await payload.find({
    collection: 'users',
    where: { email: { equals: input.email } },
    limit: 1,
  })
  if (existingUser.totalDocs > 0) {
    throw new SignupError('EMAIL_TAKEN', 'Email already registered')
  }

  // Provision tenant + related rows in a single transaction.
  const provisioned = await client.transaction(async (tx) => {
    const [tenantRow] = await tx
      .insert(tenants)
      .values({
        name: input.name,
        slug: input.slug,
        status: 'trial',
        onboardingStep: 1,
      })
      .returning({ id: tenants.id })

    if (!tenantRow) throw new Error('Tenant insert returned no row')

    const [practitionerRow] = await tx
      .insert(practitioners)
      .values({
        tenantId: tenantRow.id,
        firstName: input.firstName,
        lastName: input.lastName,
        specialty: input.specialty,
        specialtySlug: slugify(input.specialty),
        schemaOrgType: 'Person',
      })
      .returning({ id: practitioners.id })

    if (!practitionerRow) throw new Error('Practitioner insert returned no row')

    await tx.insert(siteSettings).values({
      tenantId: tenantRow.id,
      templateId: 'medical-classic',
    })

    return { tenantId: tenantRow.id, practitionerId: practitionerRow.id }
  })

  // Create the Payload user. If this fails, roll back the tenant manually
  // (tenant cascade deletes practitioner + siteSettings via FK).
  try {
    const created = await payload.create({
      collection: 'users',
      data: {
        email: input.email,
        password: input.password,
        name: input.name,
        role: 'practitioner',
        tenantId: provisioned.tenantId,
      },
    })
    return {
      userId: String(created.id),
      tenantId: provisioned.tenantId,
      practitionerId: provisioned.practitionerId,
    }
  } catch (err) {
    await client.delete(tenants).where(eq(tenants.id, provisioned.tenantId))
    throw err
  }
}

export class SignupError extends Error {
  constructor(
    public readonly code: 'SLUG_TAKEN' | 'EMAIL_TAKEN',
    message: string,
  ) {
    super(message)
    this.name = 'SignupError'
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
