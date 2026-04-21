import { and, eq, gte, lte } from 'drizzle-orm'
import { tenants, practitioners } from '@medsite/db'
import { processTrialExpiry } from '@medsite/billing'
import { createEmailClient, createEmailService } from '@medsite/email'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = db()
  const emailService = createEmailService(
    createEmailClient(process.env.RESEND_API_KEY ?? ''),
  )

  const result = await processTrialExpiry({
    async getTrialsExpiringIn(days) {
      const now = new Date()
      const target = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      const dayStart = new Date(target.toISOString().split('T')[0]!)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const rows = await client
        .select({
          tenantId: tenants.id,
          name: tenants.name,
          trialEndsAt: tenants.trialEndsAt,
          email: practitioners.email,
        })
        .from(tenants)
        .leftJoin(practitioners, eq(practitioners.tenantId, tenants.id))
        .where(
          and(
            eq(tenants.status, 'trial'),
            gte(tenants.trialEndsAt, dayStart),
            lte(tenants.trialEndsAt, dayEnd),
          ),
        )

      return rows
        .filter((r) => r.email && r.trialEndsAt)
        .map((r) => ({
          tenantId: r.tenantId,
          email: r.email!,
          name: r.name,
          trialEndsAt: r.trialEndsAt!,
        }))
    },

    async getExpiredTrials() {
      const now = new Date()
      const rows = await client
        .select({
          tenantId: tenants.id,
          name: tenants.name,
          email: practitioners.email,
        })
        .from(tenants)
        .leftJoin(practitioners, eq(practitioners.tenantId, tenants.id))
        .where(
          and(eq(tenants.status, 'trial'), lte(tenants.trialEndsAt, now)),
        )

      return rows
        .filter((r) => r.email)
        .map((r) => ({
          tenantId: r.tenantId,
          email: r.email!,
          name: r.name,
        }))
    },

    async suspendTenant(tenantId) {
      await client
        .update(tenants)
        .set({ status: 'suspended', updatedAt: new Date() })
        .where(eq(tenants.id, tenantId))
    },

    async sendTrialWarningEmail(email, name, daysLeft) {
      const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/admin`
      await emailService.sendTrialExpiring(email, name, daysLeft, upgradeUrl)
    },

    async sendSiteSuspendedEmail(email, name) {
      const reactivateUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/admin`
      await emailService.sendSiteSuspended(email, name, reactivateUrl)
    },
  })

  return NextResponse.json(result)
}
