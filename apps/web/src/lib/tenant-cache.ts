/**
 * In-memory tenant resolution cache — process-local LRU with a short TTL.
 *
 * Lives in the Node runtime (Server Components, `getTenant()`). Not used
 * from the Edge middleware, which stays DB-free and hostname-only.
 *
 * - **Key**: the raw host (normalised lowercase, no port).
 * - **Value**: a compact snapshot of the tenant — enough to decide
 *   routing + theming without re-querying. Full details are fetched by
 *   `getTenant()` via `unstable_cache`.
 * - **TTL**: 60 seconds (configurable via the constructor).
 * - **Max size**: 500 entries. Oldest-inserted entries evicted first —
 *   relying on `Map`'s insertion-order iteration.
 * - **Invalidation**: `invalidate(slug)` drops every entry matching a slug
 *   (customers may access via multiple hostnames). Call from mutations.
 */

import type { TenantStatus } from './tenant-types'

export interface CachedTenant {
  tenantId: string
  slug: string
  status: TenantStatus
  templateId: string
}

export type CachedTenantResult = CachedTenant | null

interface CacheEntry {
  value: CachedTenantResult
  expiresAt: number
}

const DEFAULT_TTL_MS = 60_000
const DEFAULT_MAX_SIZE = 500

export class TenantCache {
  private readonly store = new Map<string, CacheEntry>()

  constructor(
    private readonly ttlMs: number = DEFAULT_TTL_MS,
    private readonly maxSize: number = DEFAULT_MAX_SIZE,
  ) {}

  get(host: string, now: number = Date.now()): CachedTenantResult | undefined {
    const entry = this.store.get(host)
    if (!entry) return undefined
    if (entry.expiresAt <= now) {
      this.store.delete(host)
      return undefined
    }
    // Refresh insertion order → LRU touch.
    this.store.delete(host)
    this.store.set(host, entry)
    return entry.value
  }

  set(host: string, value: CachedTenantResult, now: number = Date.now()): void {
    if (this.store.has(host)) {
      this.store.delete(host)
    } else if (this.store.size >= this.maxSize) {
      const oldest = this.store.keys().next().value
      if (oldest !== undefined) this.store.delete(oldest)
    }
    this.store.set(host, { value, expiresAt: now + this.ttlMs })
  }

  /**
   * Drops every cached entry whose value matches the given slug.
   * Used when a tenant is updated — call alongside `revalidateTag`.
   */
  invalidateSlug(slug: string): number {
    let count = 0
    for (const [host, entry] of this.store) {
      if (entry.value?.slug === slug) {
        this.store.delete(host)
        count += 1
      }
    }
    return count
  }

  invalidateHost(host: string): boolean {
    return this.store.delete(host)
  }

  clear(): void {
    this.store.clear()
  }

  get size(): number {
    return this.store.size
  }
}

/**
 * Shared process-wide singleton.
 * Module-scoped so it survives across requests in the same Node process.
 */
export const tenantCache = new TenantCache()
