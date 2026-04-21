import type Stripe from 'stripe'

import type { WebhookEvent } from './types'

/**
 * Parses and validates a Stripe webhook event.
 * Returns a simplified event object for the application to handle.
 */
export function createWebhookHandler(stripe: Stripe) {
  return {
    /**
     * Verifies the webhook signature and constructs the event.
     * Throws if the signature is invalid.
     */
    verifyEvent(
      payload: string | Buffer,
      signature: string,
      webhookSecret: string,
    ): Stripe.Event {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    },

    /**
     * Processes a verified Stripe event into a simplified application event.
     */
    parseEvent(event: Stripe.Event): WebhookEvent | null {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          return {
            type: 'checkout_completed',
            stripeCustomerId: session.customer as string,
            subscriptionId: session.subscription as string,
            tenantId: session.metadata?.tenantId,
          }
        }

        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice
          return {
            type: 'invoice_paid',
            stripeCustomerId: invoice.customer as string,
            subscriptionId: invoice.subscription as string,
            invoiceId: invoice.id,
            amountPaid: invoice.amount_paid,
          }
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice
          return {
            type: 'invoice_payment_failed',
            stripeCustomerId: invoice.customer as string,
            subscriptionId: invoice.subscription as string,
            invoiceId: invoice.id,
            failureCount: invoice.attempt_count,
          }
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription
          const item = subscription.items.data[0]
          return {
            type: 'subscription_updated',
            stripeCustomerId: subscription.customer as string,
            subscriptionId: subscription.id,
            newPriceId: item?.price.id,
          }
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          return {
            type: 'subscription_deleted',
            stripeCustomerId: subscription.customer as string,
            subscriptionId: subscription.id,
          }
        }

        default:
          return null
      }
    },
  }
}

export type WebhookHandler = ReturnType<typeof createWebhookHandler>
