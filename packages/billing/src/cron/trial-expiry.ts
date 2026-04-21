/**
 * CRON: Daily check for expiring trials.
 * - Tenants with trials ending in 3 days → send warning email
 * - Tenants with expired trials → suspend
 *
 * Designed to be called from a Vercel Cron route.
 */
export interface TrialExpiryResult {
  warned: string[]
  suspended: string[]
}

export interface TrialExpiryDeps {
  getTrialsExpiringIn(days: number): Promise<
    { tenantId: string; email: string; name: string; trialEndsAt: Date }[]
  >
  getExpiredTrials(): Promise<{ tenantId: string; email: string; name: string }[]>
  suspendTenant(tenantId: string): Promise<void>
  sendTrialWarningEmail(email: string, name: string, daysLeft: number): Promise<void>
  sendSiteSuspendedEmail(email: string, name: string): Promise<void>
}

export async function processTrialExpiry(
  deps: TrialExpiryDeps,
): Promise<TrialExpiryResult> {
  const result: TrialExpiryResult = { warned: [], suspended: [] }

  // Warn tenants expiring in 3 days
  const expiring = await deps.getTrialsExpiringIn(3)
  for (const tenant of expiring) {
    await deps.sendTrialWarningEmail(tenant.email, tenant.name, 3)
    result.warned.push(tenant.tenantId)
  }

  // Suspend expired trials
  const expired = await deps.getExpiredTrials()
  for (const tenant of expired) {
    await deps.suspendTenant(tenant.tenantId)
    await deps.sendSiteSuspendedEmail(tenant.email, tenant.name)
    result.suspended.push(tenant.tenantId)
  }

  return result
}
