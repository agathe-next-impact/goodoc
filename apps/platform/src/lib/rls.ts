import 'server-only'

import { sql } from 'drizzle-orm'

import { db } from './db'

type Tx = Parameters<Parameters<ReturnType<typeof db>['transaction']>[0]>[0]

/**
 * Runs `fn` inside a transaction with `app.current_tenant_id` bound to
 * `tenantId`. Required for any read of tenant-scoped tables (RLS policies
 * compare against this setting — see `packages/db/rls.sql`).
 *
 * The setting is `LOCAL` so it's automatically reset at transaction end,
 * preventing leaks between requests sharing the same connection.
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  return db().transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    )
    return fn(tx)
  })
}
