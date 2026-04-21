export interface PlanConfig {
  name: string
  displayName: string
  priceMonthlyEur: number
  setupFeeEur: number
  maxPages: number
  features: Record<string, boolean>
}

export interface SubscriptionStatus {
  id: string
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  priceId: string
}

export interface CheckoutParams {
  customerId: string
  priceId: string
  setupPriceId?: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
  couponId?: string
}

export interface WebhookEvent {
  type: string
  tenantId?: string
  stripeCustomerId?: string
  subscriptionId?: string
  invoiceId?: string
  amountPaid?: number
  failureCount?: number
  newPriceId?: string
}

export const PLANS: PlanConfig[] = [
  {
    name: 'essentiel',
    displayName: 'Essentiel',
    priceMonthlyEur: 59,
    setupFeeEur: 199,
    maxPages: 5,
    features: {
      blog: false,
      customDomain: false,
      analytics: false,
      prioritySupport: false,
    },
  },
  {
    name: 'pro',
    displayName: 'Pro',
    priceMonthlyEur: 119,
    setupFeeEur: 299,
    maxPages: 15,
    features: {
      blog: true,
      customDomain: true,
      analytics: true,
      prioritySupport: false,
    },
  },
  {
    name: 'premium',
    displayName: 'Premium',
    priceMonthlyEur: 199,
    setupFeeEur: 0,
    maxPages: 50,
    features: {
      blog: true,
      customDomain: true,
      analytics: true,
      prioritySupport: true,
    },
  },
]
