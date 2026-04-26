import type Stripe from 'stripe'

/**
 * Creates a Stripe Billing Portal session for self-service management
 * (update card, view invoices, cancel). Thin wrapper kept separate from
 * `BillingService` so callers that only need the portal can import it
 * without pulling the full subscription-management surface.
 */
export interface CustomerPortalParams {
  stripeCustomerId: string
  returnUrl: string
}

export async function createCustomerPortalSession(
  stripe: Stripe,
  params: CustomerPortalParams,
): Promise<{ url: string }> {
  const session = await stripe.billingPortal.sessions.create({
    customer: params.stripeCustomerId,
    return_url: params.returnUrl,
  })
  return { url: session.url }
}
