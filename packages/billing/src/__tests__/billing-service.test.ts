import type Stripe from 'stripe'
import { describe, expect, it, vi } from 'vitest'

import { createBillingService } from '../billing-service'

function mockStripe() {
  return {
    customers: {
      create: vi.fn().mockResolvedValue({ id: 'cus_new' }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          url: 'https://checkout.stripe.com/session_123',
        }),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          url: 'https://billing.stripe.com/portal_123',
        }),
      },
    },
    subscriptions: {
      retrieve: vi.fn().mockResolvedValue({
        id: 'sub_123',
        status: 'active',
        current_period_end: 1700000000,
        cancel_at_period_end: false,
        items: { data: [{ id: 'si_123', price: { id: 'price_pro' } }] },
      }),
      update: vi.fn().mockResolvedValue({}),
    },
  }
}

describe('BillingService', () => {
  describe('createCustomer', () => {
    it('creates a Stripe customer with metadata', async () => {
      const stripe = mockStripe()
      const service = createBillingService(stripe as unknown as Stripe)

      const customerId = await service.createCustomer(
        'dr@test.com',
        'Dr Test',
        'tenant_123',
      )

      expect(customerId).toBe('cus_new')
      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: 'dr@test.com',
        name: 'Dr Test',
        metadata: { tenantId: 'tenant_123' },
      })
    })
  })

  describe('createCheckoutSession', () => {
    it('creates a checkout session with subscription', async () => {
      const stripe = mockStripe()
      const service = createBillingService(stripe as unknown as Stripe)

      const url = await service.createCheckoutSession({
        customerId: 'cus_123',
        priceId: 'price_pro',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
      })

      expect(url).toBe('https://checkout.stripe.com/session_123')
      const callArgs = stripe.checkout.sessions.create.mock.calls[0]![0]
      expect(callArgs.customer).toBe('cus_123')
      expect(callArgs.mode).toBe('subscription')
      expect(callArgs.line_items).toHaveLength(1)
      expect(callArgs.locale).toBe('fr')
    })

    it('adds setup fee as second line item', async () => {
      const stripe = mockStripe()
      const service = createBillingService(stripe as unknown as Stripe)

      await service.createCheckoutSession({
        customerId: 'cus_123',
        priceId: 'price_pro',
        setupPriceId: 'price_setup',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
      })

      const callArgs = stripe.checkout.sessions.create.mock.calls[0]![0]
      expect(callArgs.line_items).toHaveLength(2)
      expect(callArgs.line_items[1].price).toBe('price_setup')
    })

    it('adds trial period', async () => {
      const stripe = mockStripe()
      const service = createBillingService(stripe as unknown as Stripe)

      await service.createCheckoutSession({
        customerId: 'cus_123',
        priceId: 'price_pro',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
        trialDays: 14,
      })

      const callArgs = stripe.checkout.sessions.create.mock.calls[0]![0]
      expect(callArgs.subscription_data.trial_period_days).toBe(14)
    })
  })

  describe('createBillingPortalSession', () => {
    it('returns the portal URL', async () => {
      const stripe = mockStripe()
      const service = createBillingService(stripe as unknown as Stripe)

      const url = await service.createBillingPortalSession(
        'cus_123',
        'https://app.com/dashboard',
      )

      expect(url).toBe('https://billing.stripe.com/portal_123')
    })
  })

  describe('changePlan', () => {
    it('updates subscription with new price', async () => {
      const stripe = mockStripe()
      const service = createBillingService(stripe as unknown as Stripe)

      await service.changePlan('sub_123', 'price_premium')

      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        items: [{ id: 'si_123', price: 'price_premium' }],
        proration_behavior: 'create_prorations',
      })
    })
  })

  describe('cancelSubscription', () => {
    it('sets cancel_at_period_end', async () => {
      const stripe = mockStripe()
      const service = createBillingService(stripe as unknown as Stripe)

      await service.cancelSubscription('sub_123')

      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: true,
      })
    })
  })

  describe('getSubscription', () => {
    it('returns normalized subscription status', async () => {
      const stripe = mockStripe()
      const service = createBillingService(stripe as unknown as Stripe)

      const status = await service.getSubscription('sub_123')

      expect(status.id).toBe('sub_123')
      expect(status.status).toBe('active')
      expect(status.cancelAtPeriodEnd).toBe(false)
      expect(status.priceId).toBe('price_pro')
      expect(status.currentPeriodEnd).toBeInstanceOf(Date)
    })
  })
})
