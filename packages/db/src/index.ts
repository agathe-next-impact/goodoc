import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

export * from './schema'

/**
 * Creates a Drizzle client bound to the given connection URL.
 * Call this once per process (Next.js: cache via module scope).
 */
export function createDbClient(databaseUrl: string) {
  const client = postgres(databaseUrl, { prepare: false })
  return drizzle(client, { schema })
}

export type DbClient = ReturnType<typeof createDbClient>
