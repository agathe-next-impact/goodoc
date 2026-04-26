import { contactMessages } from '@medsite/db'
import { count, desc, eq } from 'drizzle-orm'

import { getPractitionerSession } from '@/lib/get-tenant'
import { withTenant } from '@/lib/rls'

import { toggleMessageRead } from './actions'

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '1', 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default async function MessagesPage({ searchParams }: PageProps) {
  const { tenant } = await getPractitionerSession()
  const page = parsePage((await searchParams).page)
  const offset = (page - 1) * PAGE_SIZE

  const { rows, total } = await withTenant(tenant.id, async (tx) => {
    const [totalRow] = await tx
      .select({ value: count() })
      .from(contactMessages)
      .where(eq(contactMessages.tenantId, tenant.id))
    const list = await tx
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.tenantId, tenant.id))
      .orderBy(desc(contactMessages.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset)
    return { rows: list, total: totalRow?.value ?? 0 }
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          {total} message{total > 1 ? 's' : ''} reçu{total > 1 ? 's' : ''} via
          le formulaire de contact.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          Aucun message pour l&apos;instant.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((msg) => {
            const unread = msg.status === 'new'
            return (
              <li
                key={msg.id}
                className={`rounded-lg border bg-card p-4 shadow-sm ${
                  unread ? 'border-primary/40' : 'border-border'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{msg.senderName}</span>{' '}
                    <a
                      href={`mailto:${msg.senderEmail}${
                        msg.subject ? `?subject=${encodeURIComponent(`Re: ${msg.subject}`)}` : ''
                      }`}
                      className="text-sm text-primary hover:underline"
                    >
                      {msg.senderEmail}
                    </a>
                    {msg.senderPhone ? (
                      <span className="text-sm text-muted-foreground">
                        {' '}
                        · {msg.senderPhone}
                      </span>
                    ) : null}
                  </div>
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={msg.createdAt.toISOString()}
                  >
                    {dateFmt.format(msg.createdAt)}
                  </time>
                </div>
                {msg.subject ? (
                  <p className="mt-2 text-sm font-semibold">{msg.subject}</p>
                ) : null}
                <p className="mt-1 whitespace-pre-line text-sm">
                  {msg.message}
                </p>
                <form
                  action={toggleMessageRead}
                  className="mt-3 flex items-center gap-3"
                >
                  <input type="hidden" name="messageId" value={msg.id} />
                  <input
                    type="hidden"
                    name="nextStatus"
                    value={unread ? 'read' : 'new'}
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
                  >
                    {unread ? 'Marquer comme lu' : 'Marquer comme non lu'}
                  </button>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {msg.status}
                  </span>
                </form>
              </li>
            )
          })}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between text-sm"
        >
          <PageLink page={page - 1} disabled={page <= 1} label="← Précédent" />
          <span className="text-muted-foreground">
            Page {page} sur {totalPages}
          </span>
          <PageLink
            page={page + 1}
            disabled={page >= totalPages}
            label="Suivant →"
          />
        </nav>
      ) : null}
    </div>
  )
}

function PageLink({
  page,
  disabled,
  label,
}: {
  page: number
  disabled: boolean
  label: string
}) {
  if (disabled) {
    return <span className="text-muted-foreground/50">{label}</span>
  }
  return (
    <a
      href={`/messages?page=${page}`}
      className="rounded-md border border-input bg-card px-3 py-1.5 hover:bg-accent"
    >
      {label}
    </a>
  )
}
