import 'server-only'

import { plans, tenants, users, type Plan, type Tenant, type User } from '@medsite/db'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { db } from './db'

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export interface PractitionerSession {
  user: User
  tenant: Tenant
  plan: Plan | null
}

/**
 * Returns the currently logged-in practitioner with their tenant and plan.
 *
 * Reads `x-user-id` set by the middleware (never trusts client-supplied
 * headers — middleware regenerates the request headers). Triggers
 * `redirect('/login')` if the user is unknown or has no tenant attached
 * (super-admins land here too — they belong in `apps/admin`, not here).
 *
 * Onboarding gate: practitioners whose `tenants.onboardingStep` is below
 * the completion threshold are bounced to the admin onboarding wizard
 * (chantier #05). Until that wizard exists we send them to the admin
 * home — non-blocking so dev seed data still works.
 */
export const ONBOARDING_COMPLETE_STEP = 6

export async function getPractitionerSession(): Promise<PractitionerSession> {
  const h = await headers()
  const userId = h.get('x-user-id')
  if (!userId) throw new UnauthorizedError()

  const userRows = await db()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  const user = userRows[0]
  if (!user) redirect('/login')

  if (user.role === 'super-admin') {
    // Super-admins use apps/admin, not the practitioner platform.
    redirect(adminOnboardingUrl(null))
  }

  if (!user.tenantId) {
    throw new UnauthorizedError()
  }

  const tenantRows = await db()
    .select()
    .from(tenants)
    .where(eq(tenants.id, user.tenantId))
    .limit(1)
  const tenant = tenantRows[0]
  if (!tenant) throw new UnauthorizedError()

  if (tenant.onboardingStep < ONBOARDING_COMPLETE_STEP) {
    redirect(adminOnboardingUrl(tenant.onboardingStep))
  }

  let plan: Plan | null = null
  if (tenant.planId) {
    const planRows = await db()
      .select()
      .from(plans)
      .where(eq(plans.id, tenant.planId))
      .limit(1)
    plan = planRows[0] ?? null
  }

  return { user, tenant, plan }
}

function adminOnboardingUrl(step: number | null): string {
  const base =
    process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'
  // Until chantier #05 lands, we don't have /onboarding/<step> — send
  // to the admin root so the practitioner can at least pick up there.
  return step === null ? `${base}/admin` : `${base}/admin`
}
