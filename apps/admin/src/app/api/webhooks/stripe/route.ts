import { eq } from 'drizzle-orm'
import { tenants } from '@medsite/db'
import {
  createStripeClient,
  createWebhookHandler,
} from '@medsite/billing'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'

const stripe = createStripeClient(process.env.STRIPE_SECRET_KEY ?? '')
const webhookHandler = createWebhookHandler(stripe)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = webhookHandler.verifyEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const parsed = webhookHandler.parseEvent(event)
  if (!parsed) {
    // Unhandled event type — acknowledge and move on
    return NextResponse.json({ received: true })
  }

  // Process asynchronously — return 200 fast
  processWebhookEvent(parsed).catch((err) => {
    console.error('Webhook processing error:', err)
  })

  return NextResponse.json({ received: true })
}

async function processWebhookEvent(event: {
  type: string
  stripeCustomerId?: string
  subscriptionId?: string
  tenantId?: string
  amountPaid?: number
  failureCount?: number
  newPriceId?: string
}) {
  const client = db()

  // Resolve tenantId from Stripe customer if not provided
  let tenantId = event.tenantId
  if (!tenantId && event.stripeCustomerId) {
    const rows = await client
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.stripeCustomerId, event.stripeCustomerId))
      .limit(1)
    tenantId = rows[0]?.id
  }

  if (!tenantId) {
    console.warn(`Webhook ${event.type}: could not resolve tenantId`)
    return
  }

  switch (event.type) {
    case 'checkout_completed': {
      await client
        .update(tenants)
        .set({
          status: 'active',
          stripeSubscriptionId: event.subscriptionId,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId))
      break
    }

    case 'invoice_paid': {
      // Payment received — ensure tenant is active
      await client
        .update(tenants)
        .set({ status: 'active', updatedAt: new Date() })
        .where(eq(tenants.id, tenantId))
      break
    }

    case 'invoice_payment_failed': {
      // After 3 failures, suspend
      if (event.failureCount && event.failureCount >= 3) {
        await client
          .update(tenants)
          .set({ status: 'suspended', updatedAt: new Date() })
          .where(eq(tenants.id, tenantId))
      }
      break
    }

    case 'subscription_updated': {
      // Plan change — update if needed
      // The plan mapping (priceId → planId) would be done here
      await client
        .update(tenants)
        .set({ updatedAt: new Date() })
        .where(eq(tenants.id, tenantId))
      break
    }

    case 'subscription_deleted': {
      await client
        .update(tenants)
        .set({
          status: 'cancelled',
          stripeSubscriptionId: null,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId))
      break
    }
  }
}
