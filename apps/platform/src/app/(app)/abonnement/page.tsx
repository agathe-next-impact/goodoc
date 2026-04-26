import type Stripe from 'stripe'

import { getPractitionerSession } from '@/lib/get-tenant'
import { stripe } from '@/lib/stripe'

const moneyFmt = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})
const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

interface SubscriptionView {
  status: string
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

interface InvoiceView {
  id: string
  number: string | null
  amountPaidEur: number
  status: string | null
  hostedInvoiceUrl: string | null
  createdAt: Date
}

async function fetchStripeData(
  customerId: string | null,
  subscriptionId: string | null,
): Promise<{
  subscription: SubscriptionView | null
  invoices: InvoiceView[]
  degraded: boolean
}> {
  const client = stripe()
  if (!client || !customerId) {
    return { subscription: null, invoices: [], degraded: true }
  }

  let subscription: SubscriptionView | null = null
  if (subscriptionId) {
    try {
      const sub = await client.subscriptions.retrieve(subscriptionId)
      subscription = {
        status: sub.status,
        currentPeriodEnd: sub.current_period_end
          ? new Date(sub.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      }
    } catch {
      // Subscription not found in this Stripe account (likely env mismatch).
      subscription = null
    }
  }

  let invoices: InvoiceView[] = []
  try {
    const list = await client.invoices.list({ customer: customerId, limit: 12 })
    invoices = list.data.map(toInvoiceView)
  } catch {
    invoices = []
  }

  return { subscription, invoices, degraded: false }
}

function toInvoiceView(inv: Stripe.Invoice): InvoiceView {
  return {
    id: inv.id,
    number: inv.number,
    amountPaidEur: (inv.amount_paid ?? 0) / 100,
    status: inv.status,
    hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
    createdAt: new Date((inv.created ?? 0) * 1000),
  }
}

export default async function AbonnementPage() {
  const { tenant, plan } = await getPractitionerSession()
  const { subscription, invoices, degraded } = await fetchStripeData(
    tenant.stripeCustomerId,
    tenant.stripeSubscriptionId,
  )

  const trialDaysLeft = tenant.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((tenant.trialEndsAt.getTime() - Date.now()) / 86_400_000),
      )
    : null

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Abonnement</h1>
        <p className="text-sm text-muted-foreground">
          Plan, facturation et historique des paiements.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          {plan?.displayName ?? 'Plan non défini'}
        </h2>
        {plan ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {moneyFmt.format(Number(plan.priceMonthly))} / mois ·{' '}
            {plan.maxPages} pages incluses
          </p>
        ) : null}
        {tenant.status === 'trial' && trialDaysLeft !== null ? (
          <p className="mt-3 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900">
            Période d&apos;essai — {trialDaysLeft} jour{trialDaysLeft > 1 ? 's' : ''} restant
            {trialDaysLeft > 1 ? 's' : ''}.
          </p>
        ) : null}
        {subscription ? (
          <p className="mt-3 text-sm">
            Statut : <strong>{subscription.status}</strong>
            {subscription.currentPeriodEnd
              ? ` · prochaine échéance ${dateFmt.format(subscription.currentPeriodEnd)}`
              : ''}
            {subscription.cancelAtPeriodEnd
              ? ' · résiliation programmée en fin de période'
              : ''}
          </p>
        ) : null}
        {degraded ? (
          <p className="mt-3 rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground">
            Mode dégradé : Stripe n&apos;est pas configuré dans cet
            environnement, les détails de facturation ne sont pas disponibles.
          </p>
        ) : null}

        {!degraded && tenant.stripeCustomerId ? (
          <form action="/api/billing/portal" method="POST" className="mt-4">
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Mettre à jour mon mode de paiement
            </button>
          </form>
        ) : null}
      </section>

      {invoices.length > 0 ? (
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Historique</h2>
          <ul className="divide-y divide-border">
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium">
                    {inv.number ?? inv.id}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {dateFmt.format(inv.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums">
                    {moneyFmt.format(inv.amountPaidEur)}
                  </span>
                  <span className="text-xs uppercase text-muted-foreground">
                    {inv.status ?? '—'}
                  </span>
                  {inv.hostedInvoiceUrl ? (
                    <a
                      href={inv.hostedInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Voir
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
