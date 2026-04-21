import { describe, expect, it, vi } from 'vitest'

import { processPaymentRetries } from '../cron/payment-retry'
import { processTrialExpiry } from '../cron/trial-expiry'

describe('processTrialExpiry', () => {
  it('warns tenants expiring soon', async () => {
    const deps = {
      getTrialsExpiringIn: vi.fn().mockResolvedValue([
        {
          tenantId: 't1',
          email: 'a@test.com',
          name: 'Dr A',
          trialEndsAt: new Date(),
        },
      ]),
      getExpiredTrials: vi.fn().mockResolvedValue([]),
      suspendTenant: vi.fn(),
      sendTrialWarningEmail: vi.fn(),
      sendSiteSuspendedEmail: vi.fn(),
    }

    const result = await processTrialExpiry(deps)

    expect(result.warned).toEqual(['t1'])
    expect(result.suspended).toEqual([])
    expect(deps.sendTrialWarningEmail).toHaveBeenCalledWith('a@test.com', 'Dr A', 3)
  })

  it('suspends expired trials', async () => {
    const deps = {
      getTrialsExpiringIn: vi.fn().mockResolvedValue([]),
      getExpiredTrials: vi.fn().mockResolvedValue([
        { tenantId: 't2', email: 'b@test.com', name: 'Dr B' },
      ]),
      suspendTenant: vi.fn(),
      sendTrialWarningEmail: vi.fn(),
      sendSiteSuspendedEmail: vi.fn(),
    }

    const result = await processTrialExpiry(deps)

    expect(result.warned).toEqual([])
    expect(result.suspended).toEqual(['t2'])
    expect(deps.suspendTenant).toHaveBeenCalledWith('t2')
    expect(deps.sendSiteSuspendedEmail).toHaveBeenCalledWith('b@test.com', 'Dr B')
  })

  it('handles both warnings and suspensions', async () => {
    const deps = {
      getTrialsExpiringIn: vi.fn().mockResolvedValue([
        { tenantId: 't1', email: 'a@test.com', name: 'Dr A', trialEndsAt: new Date() },
      ]),
      getExpiredTrials: vi.fn().mockResolvedValue([
        { tenantId: 't2', email: 'b@test.com', name: 'Dr B' },
      ]),
      suspendTenant: vi.fn(),
      sendTrialWarningEmail: vi.fn(),
      sendSiteSuspendedEmail: vi.fn(),
    }

    const result = await processTrialExpiry(deps)

    expect(result.warned).toEqual(['t1'])
    expect(result.suspended).toEqual(['t2'])
  })
})

describe('processPaymentRetries', () => {
  it('sends gentle reminder on first failure', async () => {
    const deps = {
      getTenantsWithFailedPayments: vi.fn().mockResolvedValue([
        { tenantId: 't1', email: 'a@test.com', name: 'Dr A', failureCount: 1 },
      ]),
      suspendTenant: vi.fn(),
      sendPaymentFailedEmail: vi.fn(),
      sendSiteSuspendedEmail: vi.fn(),
    }

    const result = await processPaymentRetries(deps)

    expect(result.reminded).toEqual(['t1'])
    expect(deps.sendPaymentFailedEmail).toHaveBeenCalledWith(
      'a@test.com',
      'Dr A',
      'gentle',
    )
  })

  it('sends urgent reminder on second failure', async () => {
    const deps = {
      getTenantsWithFailedPayments: vi.fn().mockResolvedValue([
        { tenantId: 't1', email: 'a@test.com', name: 'Dr A', failureCount: 2 },
      ]),
      suspendTenant: vi.fn(),
      sendPaymentFailedEmail: vi.fn(),
      sendSiteSuspendedEmail: vi.fn(),
    }

    const result = await processPaymentRetries(deps)

    expect(result.reminded).toEqual(['t1'])
    expect(deps.sendPaymentFailedEmail).toHaveBeenCalledWith(
      'a@test.com',
      'Dr A',
      'urgent',
    )
  })

  it('suspends on third failure', async () => {
    const deps = {
      getTenantsWithFailedPayments: vi.fn().mockResolvedValue([
        { tenantId: 't1', email: 'a@test.com', name: 'Dr A', failureCount: 3 },
      ]),
      suspendTenant: vi.fn(),
      sendPaymentFailedEmail: vi.fn(),
      sendSiteSuspendedEmail: vi.fn(),
    }

    const result = await processPaymentRetries(deps)

    expect(result.suspended).toEqual(['t1'])
    expect(deps.suspendTenant).toHaveBeenCalledWith('t1')
    expect(deps.sendSiteSuspendedEmail).toHaveBeenCalledWith('a@test.com', 'Dr A')
    expect(deps.sendPaymentFailedEmail).not.toHaveBeenCalled()
  })

  it('handles mixed failure counts', async () => {
    const deps = {
      getTenantsWithFailedPayments: vi.fn().mockResolvedValue([
        { tenantId: 't1', email: 'a@test.com', name: 'A', failureCount: 1 },
        { tenantId: 't2', email: 'b@test.com', name: 'B', failureCount: 3 },
        { tenantId: 't3', email: 'c@test.com', name: 'C', failureCount: 2 },
      ]),
      suspendTenant: vi.fn(),
      sendPaymentFailedEmail: vi.fn(),
      sendSiteSuspendedEmail: vi.fn(),
    }

    const result = await processPaymentRetries(deps)

    expect(result.reminded).toEqual(['t1', 't3'])
    expect(result.suspended).toEqual(['t2'])
  })
})
