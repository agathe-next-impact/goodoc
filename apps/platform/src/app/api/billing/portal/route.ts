import { createCustomerPortalSession } from '@medsite/billing'
import { NextResponse } from 'next/server'

import { getPractitionerSession } from '@/lib/get-tenant'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const { tenant } = await getPractitionerSession()

  if (!tenant.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No Stripe customer attached to this tenant.' },
      { status: 400 },
    )
  }

  const client = stripe()
  if (!client) {
    return NextResponse.json(
      { error: 'Stripe is not configured in this environment.' },
      { status: 503 },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002'
  const { url } = await createCustomerPortalSession(client, {
    stripeCustomerId: tenant.stripeCustomerId,
    returnUrl: `${appUrl}/abonnement`,
  })

  return NextResponse.redirect(url, { status: 303 })
}
