import { createDbClient, type DbClient } from '@medsite/db'

/**
 * Process-scoped Drizzle client.
 *
 * We intentionally lazy-initialise: this file is imported by modules that
 * might run during `next build` (e.g. sitemap.ts is evaluated for route
 * discovery), when `DATABASE_URL` may not be set. Throwing at module-load
 * time would break the build.
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
