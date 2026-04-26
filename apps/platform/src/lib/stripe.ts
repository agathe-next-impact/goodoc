import 'server-only'

import { createStripeClient } from '@medsite/billing'
import type Stripe from 'stripe'

/**
 * Lazy Stripe client. Returns `null` in dev when no key is set so the
 * abonnement page can render a degraded mode instead of crashing.
 */
let cached: Stripe | null = null

export function stripe(): Stripe | null {
  if (cached) return cached
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  cached = createStripeClient(key)
  return cached
}
