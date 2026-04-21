/**
 * One-time script to configure Stripe products, prices, and coupons.
 * Run via: pnpm --filter @medsite/billing setup:stripe
 *
 * Requires STRIPE_SECRET_KEY in the environment.
 */
import Stripe from 'stripe'

import { PLANS } from '../types'

const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey) {
  console.error('STRIPE_SECRET_KEY is required')
  process.exit(1)
}

const stripe = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' })

async function main() {
  console.warn('Setting up Stripe products and prices...\n')

  for (const plan of PLANS) {
    // Create product
    const product = await stripe.products.create({
      name: `MedSite ${plan.displayName}`,
      description: `Abonnement MedSite ${plan.displayName} — ${plan.maxPages} pages max`,
      metadata: { planName: plan.name },
    })
    console.warn(`Product: ${product.name} (${product.id})`)

    // Create recurring monthly price
    const recurringPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.priceMonthlyEur * 100,
      currency: 'eur',
      recurring: { interval: 'month' },
      metadata: { planName: plan.name, type: 'recurring' },
    })
    console.warn(`  Recurring: ${plan.priceMonthlyEur}€/month (${recurringPrice.id})`)

    // Create one-time setup fee (if applicable)
    if (plan.setupFeeEur > 0) {
      const setupPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.setupFeeEur * 100,
        currency: 'eur',
        metadata: { planName: plan.name, type: 'setup' },
      })
      console.warn(`  Setup fee: ${plan.setupFeeEur}€ (${setupPrice.id})`)
    }

    console.warn()
  }

  // Create launch coupon
  const coupon = await stripe.coupons.create({
    id: 'LAUNCH50',
    percent_off: 50,
    duration: 'repeating',
    duration_in_months: 3,
    name: 'Lancement MedSite — 50% pendant 3 mois',
    metadata: { campaign: 'launch' },
  })
  console.warn(`Coupon: ${coupon.name} (${coupon.id})`)

  console.warn('\nDone! Update your plans table with the Stripe price IDs above.')
}

main().catch((err) => {
  console.error('Setup failed:', err)
  process.exit(1)
})
