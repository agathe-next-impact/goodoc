/**
 * CRON: Daily check for failed payments.
 * Sends graduated reminder emails:
 * - 1 failure (J+1): gentle reminder
 * - 2 failures (J+7): urgent reminder
 * - 3+ failures (J+14): final notice, suspend
 *
 * Designed to be called from a Vercel Cron route.
 */
export interface PaymentRetryResult {
  reminded: string[]
  suspended: string[]
}

export interface PaymentRetryDeps {
  getTenantsWithFailedPayments(): Promise<
    { tenantId: string; email: string; name: string; failureCount: number }[]
  >
  suspendTenant(tenantId: string): Promise<void>
  sendPaymentFailedEmail(
    email: string,
    name: string,
    level: 'gentle' | 'urgent' | 'final',
  ): Promise<void>
  sendSiteSuspendedEmail(email: string, name: string): Promise<void>
}

export async function processPaymentRetries(
  deps: PaymentRetryDeps,
): Promise<PaymentRetryResult> {
  const result: PaymentRetryResult = { reminded: [], suspended: [] }

  const tenants = await deps.getTenantsWithFailedPayments()

  for (const tenant of tenants) {
    if (tenant.failureCount >= 3) {
      await deps.suspendTenant(tenant.tenantId)
      await deps.sendSiteSuspendedEmail(tenant.email, tenant.name)
      result.suspended.push(tenant.tenantId)
    } else if (tenant.failureCount === 2) {
      await deps.sendPaymentFailedEmail(tenant.email, tenant.name, 'urgent')
      result.reminded.push(tenant.tenantId)
    } else {
      await deps.sendPaymentFailedEmail(tenant.email, tenant.name, 'gentle')
      result.reminded.push(tenant.tenantId)
    }
  }

  return result
}
