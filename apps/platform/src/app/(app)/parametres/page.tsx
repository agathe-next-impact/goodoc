import { siteSettings } from '@medsite/db'
import { eq } from 'drizzle-orm'

import { getPractitionerSession } from '@/lib/get-tenant'
import { withTenant } from '@/lib/rls'

export default async function ParametresPage() {
  const { user, tenant } = await getPractitionerSession()
  const settings = await withTenant(tenant.id, async (tx) => {
    const rows = await tx
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.tenantId, tenant.id))
      .limit(1)
    return rows[0] ?? null
  })

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Informations principales du compte. La modification se fait via le
          support pour l&apos;instant.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Cabinet</h2>
        <Field label="Nom du cabinet" value={tenant.name} />
        <Field label="Identifiant (slug)" value={tenant.slug} />
        <Field
          label="Domaine personnalisé"
          value={
            tenant.customDomain
              ? `${tenant.customDomain}${tenant.domainVerified ? ' (vérifié)' : ' (non vérifié)'}`
              : 'Aucun'
          }
        />
        <Field label="Modèle de site" value={settings?.templateId ?? '—'} />
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Compte praticien</h2>
        <Field label="Nom" value={user.name ?? '—'} />
        <Field label="Email de notification" value={user.email} />
        <Field label="Rôle" value={user.role} />
      </section>

      <p className="rounded-md border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">
        Pour modifier l&apos;une de ces informations, contactez le support
        depuis l&apos;onglet correspondant.
      </p>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b border-border py-2 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
