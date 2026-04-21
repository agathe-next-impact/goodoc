import type Stripe from 'stripe'
import { describe, expect, it, vi } from 'vitest'

import { createWebhookHandler } from '../webhook-handler'

function mockStripe() {
  return {
    webhooks: {
      constructEvent: vi.fn(),
    },
  }
}

describe('WebhookHandler', () => {
  describe('verifyEvent', () => {
    it('delegates to stripe.webhooks.constructEvent', () => {
      const stripe = mockStripe()
      const handler = createWebhookHandler(stripe as unknown as Stripe)

      stripe.webhooks.constructEvent.mockReturnValue({ type: 'test' })

      handler.verifyEvent('payload', 'sig', 'secret')
      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        'payload',
        'sig',
        'secret',
      )
    })

    it('throws on invalid signature', () => {
      const stripe = mockStripe()
      const handler = createWebhookHandler(stripe as unknown as Stripe)

      stripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      expect(() => handler.verifyEvent('payload', 'bad-sig', 'secret')).toThrow(
        'Invalid signature',
      )
    })
  })

  describe('parseEvent', () => {
    const stripe = mockStripe()
    const handler = createWebhookHandler(stripe as unknown as Stripe)

    it('parses checkout.session.completed', () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_123',
            subscription: 'sub_456',
            metadata: { tenantId: 'tenant_789' },
          },
        },
      }

      const result = handler.parseEvent(event as unknown as Stripe.Event)
      expect(result).toEqual({
        type: 'checkout_completed',
        stripeCustomerId: 'cus_123',
        subscriptionId: 'sub_456',
        tenantId: 'tenant_789',
      })
    })

    it('parses invoice.paid', () => {
      const event = {
        type: 'invoice.paid',
        data: {
          object: {
            customer: 'cus_123',
            subscription: 'sub_456',
            id: 'inv_789',
            amount_paid: 5900,
          },
        },
      }

      const result = handler.parseEvent(event as unknown as Stripe.Event)
      expect(result).toEqual({
        type: 'invoice_paid',
        stripeCustomerId: 'cus_123',
        subscriptionId: 'sub_456',
        invoiceId: 'inv_789',
        amountPaid: 5900,
      })
    })

    it('parses invoice.payment_failed', () => {
      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            customer: 'cus_123',
            subscription: 'sub_456',
            id: 'inv_789',
            attempt_count: 2,
          },
        },
      }

      const result = handler.parseEvent(event as unknown as Stripe.Event)
      expect(result).toEqual({
        type: 'invoice_payment_failed',
        stripeCustomerId: 'cus_123',
        subscriptionId: 'sub_456',
        invoiceId: 'inv_789',
        failureCount: 2,
      })
    })

    it('parses customer.subscription.updated', () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: 'cus_123',
            id: 'sub_456',
            items: { data: [{ price: { id: 'price_new' } }] },
          },
        },
      }

      const result = handler.parseEvent(event as unknown as Stripe.Event)
      expect(result).toEqual({
        type: 'subscription_updated',
        stripeCustomerId: 'cus_123',
        subscriptionId: 'sub_456',
        newPriceId: 'price_new',
      })
    })

    it('parses customer.subscription.deleted', () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: 'cus_123',
            id: 'sub_456',
          },
        },
      }

      const result = handler.parseEvent(event as unknown as Stripe.Event)
      expect(result).toEqual({
        type: 'subscription_deleted',
        stripeCustomerId: 'cus_123',
        subscriptionId: 'sub_456',
      })
    })

    it('returns null for unhandled events', () => {
      const event = {
        type: 'payment_intent.created',
        data: { object: {} },
      }

      const result = handler.parseEvent(event as unknown as Stripe.Event)
      expect(result).toBeNull()
    })
  })
})
