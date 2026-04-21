import { describe, expect, it } from 'vitest'

import { TenantCache, type CachedTenant } from './tenant-cache'

function makeTenant(slug: string): CachedTenant {
  return {
    tenantId: 'tnt-' + slug,
    slug,
    status: 'active',
    templateId: 'specialist',
  }
}

describe('TenantCache', () => {
  it('returns undefined on miss', () => {
    const cache = new TenantCache()
    expect(cache.get('missing.example.com')).toBeUndefined()
  })

  it('stores and retrieves values', () => {
    const cache = new TenantCache()
    cache.set('a.medsite.fr', makeTenant('a'))
    expect(cache.get('a.medsite.fr')?.slug).toBe('a')
  })

  it('caches null results (negative cache)', () => {
    const cache = new TenantCache()
    cache.set('nope.medsite.fr', null)
    expect(cache.get('nope.medsite.fr')).toBeNull()
  })

  it('expires entries past the TTL', () => {
    const cache = new TenantCache(100)
    const t0 = 1_000_000
    cache.set('a.medsite.fr', makeTenant('a'), t0)
    expect(cache.get('a.medsite.fr', t0 + 50)?.slug).toBe('a')
    expect(cache.get('a.medsite.fr', t0 + 150)).toBeUndefined()
  })

  it('evicts oldest entry when max size is exceeded', () => {
    const cache = new TenantCache(60_000, 2)
    cache.set('a.medsite.fr', makeTenant('a'))
    cache.set('b.medsite.fr', makeTenant('b'))
    cache.set('c.medsite.fr', makeTenant('c'))
    expect(cache.get('a.medsite.fr')).toBeUndefined()
    expect(cache.get('b.medsite.fr')?.slug).toBe('b')
    expect(cache.get('c.medsite.fr')?.slug).toBe('c')
  })

  it('invalidateSlug drops all entries matching a slug', () => {
    const cache = new TenantCache()
    cache.set('a.medsite.fr', makeTenant('alpha'))
    cache.set('custom-alpha.fr', makeTenant('alpha'))
    cache.set('b.medsite.fr', makeTenant('beta'))
    const dropped = cache.invalidateSlug('alpha')
    expect(dropped).toBe(2)
    expect(cache.get('a.medsite.fr')).toBeUndefined()
    expect(cache.get('custom-alpha.fr')).toBeUndefined()
    expect(cache.get('b.medsite.fr')?.slug).toBe('beta')
  })

  it('invalidateHost drops a single entry', () => {
    const cache = new TenantCache()
    cache.set('a.medsite.fr', makeTenant('a'))
    expect(cache.invalidateHost('a.medsite.fr')).toBe(true)
    expect(cache.get('a.medsite.fr')).toBeUndefined()
  })

  it('LRU: getting an entry refreshes its position', () => {
    const cache = new TenantCache(60_000, 2)
    cache.set('a.medsite.fr', makeTenant('a'))
    cache.set('b.medsite.fr', makeTenant('b'))
    // Touch 'a' so it becomes the most-recently-used.
    expect(cache.get('a.medsite.fr')?.slug).toBe('a')
    cache.set('c.medsite.fr', makeTenant('c'))
    // 'b' should have been evicted (oldest), not 'a'.
    expect(cache.get('a.medsite.fr')?.slug).toBe('a')
    expect(cache.get('b.medsite.fr')).toBeUndefined()
    expect(cache.get('c.medsite.fr')?.slug).toBe('c')
  })
})
