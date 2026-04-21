import { describe, expect, it } from 'vitest'

import { generateArticleJsonLd } from '../generators/article'
import { generateHomeJsonLd } from '../generators/home'
import { generatePractitionerJsonLd } from '../generators/practitioner'
import { generateServiceJsonLd } from '../generators/service'
import { generateWebSiteJsonLd } from '../generators/website'
import { blogPost, serviceWithPrice, specialistTenant } from './fixtures'

describe('@id consistency across generators', () => {
  const home = generateHomeJsonLd(specialistTenant)
  const practitioner = generatePractitionerJsonLd(specialistTenant)
  const service = generateServiceJsonLd(specialistTenant, serviceWithPrice)
  const article = generateArticleJsonLd(specialistTenant, blogPost)
  const website = generateWebSiteJsonLd(specialistTenant)

  const orgId = `${specialistTenant.siteUrl}/#organization`
  const practId = `${specialistTenant.siteUrl}/#practitioner`

  it('home generator defines organization @id', () => {
    expect(home['@id']).toBe(orgId)
  })

  it('practitioner generator defines practitioner @id', () => {
    expect(practitioner['@id']).toBe(practId)
  })

  it('practitioner worksFor references organization @id', () => {
    const worksFor = practitioner['worksFor'] as Record<string, unknown>
    expect(worksFor['@id']).toBe(orgId)
  })

  it('service provider references practitioner @id', () => {
    const provider = service['provider'] as Record<string, unknown>
    expect(provider['@id']).toBe(practId)
  })

  it('article author references practitioner @id', () => {
    const author = article['author'] as Record<string, unknown>
    expect(author['@id']).toBe(practId)
  })

  it('article publisher references organization @id', () => {
    const publisher = article['publisher'] as Record<string, unknown>
    expect(publisher['@id']).toBe(orgId)
  })

  it('website publisher references organization @id', () => {
    const publisher = website['publisher'] as Record<string, unknown>
    expect(publisher['@id']).toBe(orgId)
  })

  it('all @id values follow {siteUrl}/#{type} pattern', () => {
    const siteUrl = specialistTenant.siteUrl
    const ids = [
      home['@id'] as string,
      practitioner['@id'] as string,
      website['@id'] as string,
    ]

    for (const id of ids) {
      expect(id).toMatch(new RegExp(`^${siteUrl}/#\\w+$`))
    }
  })
})
