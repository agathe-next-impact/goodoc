import { describe, expect, it } from 'vitest'

import { classifyHost, normalizeHost } from './tenant-hostname'

describe('normalizeHost', () => {
  it('strips port and lowercases', () => {
    expect(normalizeHost('Sophie-Martin.MedSite.FR:3000')).toBe(
      'sophie-martin.medsite.fr',
    )
  })

  it('handles missing host gracefully', () => {
    expect(normalizeHost('')).toBe('')
  })
})

describe('classifyHost — production', () => {
  it('marks medsite.fr root as marketing', () => {
    expect(classifyHost('medsite.fr')).toEqual({ kind: 'marketing' })
  })

  it('marks www.medsite.fr as marketing', () => {
    expect(classifyHost('www.medsite.fr')).toEqual({ kind: 'marketing' })
  })

  it('marks admin/platform/api as reserved subdomains', () => {
    expect(classifyHost('admin.medsite.fr')).toEqual({
      kind: 'reserved-subdomain',
      subdomain: 'admin',
    })
    expect(classifyHost('platform.medsite.fr')).toEqual({
      kind: 'reserved-subdomain',
      subdomain: 'platform',
    })
    expect(classifyHost('api.medsite.fr')).toEqual({
      kind: 'reserved-subdomain',
      subdomain: 'api',
    })
  })

  it('extracts tenant slug from {slug}.medsite.fr', () => {
    expect(classifyHost('sophie-martin.medsite.fr')).toEqual({
      kind: 'tenant-subdomain',
      slug: 'sophie-martin',
    })
  })

  it('treats multi-level subdomains as custom domain (safety)', () => {
    expect(classifyHost('a.b.medsite.fr')).toEqual({
      kind: 'tenant-custom-domain',
      domain: 'a.b.medsite.fr',
    })
  })

  it('treats unknown domains as custom domain', () => {
    expect(classifyHost('cabinet-dupont.fr')).toEqual({
      kind: 'tenant-custom-domain',
      domain: 'cabinet-dupont.fr',
    })
  })

  it('strips port before classification', () => {
    expect(classifyHost('sophie-martin.medsite.fr:443')).toEqual({
      kind: 'tenant-subdomain',
      slug: 'sophie-martin',
    })
  })
})

describe('classifyHost — development', () => {
  it('marks bare localhost as marketing', () => {
    expect(classifyHost('localhost:3003')).toEqual({ kind: 'marketing' })
  })

  it('extracts tenant slug from {slug}.localhost', () => {
    expect(classifyHost('sophie-martin.localhost:3003')).toEqual({
      kind: 'tenant-subdomain',
      slug: 'sophie-martin',
    })
  })

  it('marks reserved dev subdomains as reserved', () => {
    expect(classifyHost('admin.localhost:3003')).toEqual({
      kind: 'reserved-subdomain',
      subdomain: 'admin',
    })
  })
})

describe('classifyHost — override', () => {
  it('x-tenant-override wins over hostname', () => {
    expect(
      classifyHost('medsite.fr', 'sophie-martin'),
    ).toEqual({ kind: 'tenant-subdomain', slug: 'sophie-martin' })
  })

  it('override is lowercased', () => {
    expect(classifyHost('localhost:3003', 'SOPHIE-MARTIN')).toEqual({
      kind: 'tenant-subdomain',
      slug: 'sophie-martin',
    })
  })

  it('empty override is ignored', () => {
    expect(classifyHost('medsite.fr', '')).toEqual({ kind: 'marketing' })
  })
})
