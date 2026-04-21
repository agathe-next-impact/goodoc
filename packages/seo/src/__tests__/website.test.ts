import { describe, expect, it } from 'vitest'

import { generateWebSiteJsonLd } from '../generators/website'
import { specialistTenant, wellnessTenant } from './fixtures'

describe('generateWebSiteJsonLd', () => {
  it('generates WebSite type', () => {
    const result = generateWebSiteJsonLd(specialistTenant)

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('WebSite')
    expect(result['@id']).toBe('https://dr-martin.medsite.fr/#website')
    expect(result['name']).toBe('Cabinet de Cardiologie Dr Martin')
    expect(result['url']).toBe('https://dr-martin.medsite.fr')
    expect(result['inLanguage']).toBe('fr-FR')
  })

  it('links publisher to organization via @id', () => {
    const result = generateWebSiteJsonLd(specialistTenant)
    const publisher = result['publisher'] as Record<string, unknown>
    expect(publisher['@id']).toBe('https://dr-martin.medsite.fr/#organization')
  })

  it('includes SearchAction when hasBlog is true', () => {
    const result = generateWebSiteJsonLd(specialistTenant, { hasBlog: true })
    const action = result['potentialAction'] as Record<string, unknown>

    expect(action['@type']).toBe('SearchAction')
    const target = action['target'] as Record<string, unknown>
    expect(target['@type']).toBe('EntryPoint')
    expect(target['urlTemplate']).toBe(
      'https://dr-martin.medsite.fr/blog?q={search_term_string}',
    )
    expect(action['query-input']).toBe('required name=search_term_string')
  })

  it('omits SearchAction when hasBlog is false', () => {
    const result = generateWebSiteJsonLd(specialistTenant, { hasBlog: false })
    expect(result['potentialAction']).toBeUndefined()
  })

  it('omits SearchAction when options not provided', () => {
    const result = generateWebSiteJsonLd(wellnessTenant)
    expect(result['potentialAction']).toBeUndefined()
  })
})
