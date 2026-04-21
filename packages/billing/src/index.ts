import Stripe from 'stripe'

/**
 * Creates a Stripe client.
 */
export function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' })
}

// Billing service
export { createBillingService } from './billing-service'
export type { BillingService } from './billing-service'

// Webhook handler
export { createWebhookHandler } from './webhook-handler'
export type { WebhookHandler } from './webhook-handler'

// Types
export type {
  CheckoutParams,
  PlanConfig,
  SubscriptionStatus,
  WebhookEvent,
} from './types'
export { PLANS } from './types'

// CRON tasks
export { processTrialExpiry } from './cron/trial-expiry'
export type { TrialExpiryDeps, TrialExpiryResult } from './cron/trial-expiry'
export { processPaymentRetries } from './cron/payment-retry'
export type { PaymentRetryDeps, PaymentRetryResult } from './cron/payment-retry'
