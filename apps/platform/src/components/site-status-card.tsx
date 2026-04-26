import type { Tenant } from '@medsite/db'

const STATUS_LABELS: Record<Tenant['status'], { label: string; tone: string }> = {
  trial: { label: 'Période d\'essai', tone: 'bg-amber-100 text-amber-900' },
  active: { label: 'Actif', tone: 'bg-emerald-100 text-emerald-900' },
  suspended: { label: 'Suspendu', tone: 'bg-rose-100 text-rose-900' },
  cancelled: { label: 'Résilié', tone: 'bg-zinc-200 text-zinc-700' },
}

export function SiteStatusCard({ tenant, siteUrl }: { tenant: Tenant; siteUrl: string }) {
  const status = STATUS_LABELS[tenant.status]
  const trialDaysLeft = tenant.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((tenant.trialEndsAt.getTime() - Date.now()) / 86_400_000),
      )
    : null

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{tenant.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <a
              href={siteUrl}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {siteUrl}
            </a>
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}
        >
          {status.label}
          {tenant.status === 'trial' && trialDaysLeft !== null
            ? ` — ${trialDaysLeft} j restants`
            : ''}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Voir mon site
        </a>
      </div>
    </section>
  )
}
