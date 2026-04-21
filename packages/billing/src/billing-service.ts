import type Stripe from 'stripe'

import type { CheckoutParams, SubscriptionStatus } from './types'

export function createBillingService(stripe: Stripe) {
  return {
    /**
     * Creates a Stripe customer linked to a tenant.
     */
    async createCustomer(
      email: string,
      name: string,
      tenantId: string,
    ): Promise<string> {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { tenantId },
      })
      return customer.id
    },

    /**
     * Creates a Checkout session for subscription + optional setup fee.
     * Returns the checkout URL.
     */
    async createCheckoutSession(params: CheckoutParams): Promise<string> {
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        { price: params.priceId, quantity: 1 },
      ]

      if (params.setupPriceId) {
        lineItems.push({ price: params.setupPriceId, quantity: 1 })
      }

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: params.customerId,
        mode: 'subscription',
        line_items: lineItems,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        locale: 'fr',
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        payment_method_types: ['card'],
      }

      if (params.trialDays && params.trialDays > 0) {
        sessionParams.subscription_data = {
          trial_period_days: params.trialDays,
        }
      }

      if (params.couponId) {
        sessionParams.discounts = [{ coupon: params.couponId }]
        // Can't use allow_promotion_codes with discounts
        delete sessionParams.allow_promotion_codes
      }

      const session = await stripe.checkout.sessions.create(sessionParams)
      return session.url!
    },

    /**
     * Creates a Billing Portal session for self-service management.
     * Returns the portal URL.
     */
    async createBillingPortalSession(
      customerId: string,
      returnUrl: string,
    ): Promise<string> {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })
      return session.url
    },

    /**
     * Changes the subscription plan (upgrade/downgrade).
     * Prorates by default.
     */
    async changePlan(
      subscriptionId: string,
      newPriceId: string,
    ): Promise<void> {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const currentItem = subscription.items.data[0]
      if (!currentItem) return

      await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: currentItem.id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      })
    },

    /**
     * Cancels the subscription at the end of the current billing period.
     */
    async cancelSubscription(subscriptionId: string): Promise<void> {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    },

    /**
     * Reactivates a subscription that was set to cancel at period end.
     */
    async reactivateSubscription(subscriptionId: string): Promise<void> {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      })
    },

    /**
     * Retrieves the current subscription status.
     */
    async getSubscription(
      subscriptionId: string,
    ): Promise<SubscriptionStatus> {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      const item = sub.items.data[0]

      return {
        id: sub.id,
        status: sub.status as SubscriptionStatus['status'],
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        priceId: item?.price.id ?? '',
      }
    },
  }
}

export type BillingService = ReturnType<typeof createBillingService>
