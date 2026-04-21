import { describe, expect, it } from 'vitest'

import {
  buildBreadcrumbItems,
  generateBreadcrumbJsonLd,
} from '../generators/breadcrumb'

describe('generateBreadcrumbJsonLd', () => {
  it('generates BreadcrumbList type', () => {
    const items = buildBreadcrumbItems('https://dr-martin.medsite.fr')
    const result = generateBreadcrumbJsonLd(items)

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('BreadcrumbList')
  })

  it('assigns correct positions starting at 1', () => {
    const items = buildBreadcrumbItems(
      'https://dr-martin.medsite.fr',
      { name: 'Actes', path: '/actes' },
      { name: 'Ostéopathie sportive', path: '/actes/osteopathie-sportive' },
    )
    const result = generateBreadcrumbJsonLd(items)
    const list = result['itemListElement'] as Record<string, unknown>[]

    expect(list).toHaveLength(3)
    expect(list[0]!['position']).toBe(1)
    expect(list[0]!['name']).toBe('Accueil')
    expect(list[0]!['item']).toBe('https://dr-martin.medsite.fr')

    expect(list[1]!['position']).toBe(2)
    expect(list[1]!['name']).toBe('Actes')
    expect(list[1]!['item']).toBe('https://dr-martin.medsite.fr/actes')

    expect(list[2]!['position']).toBe(3)
    expect(list[2]!['name']).toBe('Ostéopathie sportive')
  })
})

describe('buildBreadcrumbItems', () => {
  it('always starts with Accueil', () => {
    const items = buildBreadcrumbItems('https://example.com')
    expect(items).toHaveLength(1)
    expect(items[0]!.name).toBe('Accueil')
    expect(items[0]!.url).toBe('https://example.com')
  })

  it('builds blog breadcrumb path', () => {
    const items = buildBreadcrumbItems(
      'https://dr-martin.medsite.fr',
      { name: 'Blog', path: '/blog' },
      { name: 'Quand consulter un ostéopathe ?', path: '/blog/quand-consulter' },
    )

    expect(items).toHaveLength(3)
    expect(items[1]!.name).toBe('Blog')
    expect(items[2]!.url).toBe(
      'https://dr-martin.medsite.fr/blog/quand-consulter',
    )
  })
})
