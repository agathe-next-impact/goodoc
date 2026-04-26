import { contactMessages } from '@medsite/db'
import { and, count, eq, gte } from 'drizzle-orm'

import { SiteStatusCard } from '@/components/site-status-card'
import { getPractitionerSession } from '@/lib/get-tenant'
import { withTenant } from '@/lib/rls'

function buildSiteUrl(slug: string, customDomain: string | null): string {
  if (customDomain) return `https://${customDomain}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003'
  const url = new URL(appUrl)
  // Dev: keep the port and hostname; prepend slug as a subdomain marker so
  // the link is at least visible. In prod the host already encodes the
  // tenant subdomain (e.g. `<slug>.medsite.fr`).
  if (url.hostname === 'localhost') {
    return `${appUrl}/?tenant=${slug}`
  }
  url.hostname = `${slug}.${url.hostname.replace(/^www\./, '')}`
  return url.toString().replace(/\/$/, '')
}

async function getMessageStats(tenantId: string) {
  const since = new Date(Date.now() - 30 * 86_400_000)
  return withTenant(tenantId, async (tx) => {
    const totalRows = await tx
      .select({ value: count() })
      .from(contactMessages)
      .where(eq(contactMessages.tenantId, tenantId))
    const recentRows = await tx
      .select({ value: count() })
      .from(contactMessages)
      .where(
        and(
          eq(contactMessages.tenantId, tenantId),
          gte(contactMessages.createdAt, since),
        ),
      )
    const unreadRows = await tx
      .select({ value: count() })
      .from(contactMessages)
      .where(
        and(
          eq(contactMessages.tenantId, tenantId),
          eq(contactMessages.status, 'new'),
        ),
      )
    return {
      total: totalRows[0]?.value ?? 0,
      last30Days: recentRows[0]?.value ?? 0,
      unread: unreadRows[0]?.value ?? 0,
    }
  })
}

export default async function DashboardPage() {
  const { tenant } = await getPractitionerSession()
  const siteUrl = buildSiteUrl(tenant.slug, tenant.customDomain)
  const stats = await getMessageStats(tenant.id)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">
          Vue d&apos;ensemble de votre site et de votre activité.
        </p>
      </header>

      <SiteStatusCard tenant={tenant} siteUrl={siteUrl} />

      <section
        aria-label="Indicateurs clés"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <Kpi label="Messages reçus (30 j)" value={stats.last30Days} />
        <Kpi label="Messages non lus" value={stats.unread} highlight />
        <Kpi label="Messages totaux" value={stats.total} />
      </section>

      <section className="rounded-lg border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">
        Les statistiques de visites et de prises de rendez-vous (Plausible,
        Doctolib) seront ajoutées dans une prochaine itération.
      </section>
    </div>
  )
}

function Kpi({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-4 shadow-sm ${
        highlight && value > 0 ? 'ring-2 ring-primary/40' : ''
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
    </div>
  )
}
