import 'server-only'

import { createDbClient, type DbClient } from '@medsite/db'

/**
 * Process-scoped Drizzle client. Lazy-initialised so that `next build`
 * (which evaluates server modules without a real `DATABASE_URL`) doesn't
 * crash at module load.
 */
let cached: DbClient | null = null

export function db(): DbClient {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set — cannot initialise the database client',
    )
  }
  cached = createDbClient(url)
  return cached
}
