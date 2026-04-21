import { describe, expect, it } from 'vitest'

import { generateArticleJsonLd } from '../generators/article'
import {
  blogPost,
  blogPostMinimal,
  specialistTenant,
  wellnessTenant,
} from './fixtures'

describe('generateArticleJsonLd', () => {
  it('generates Article type with all fields', () => {
    const result = generateArticleJsonLd(specialistTenant, blogPost)

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('Article')
    expect(result['@id']).toBe(
      'https://dr-martin.medsite.fr/blog/quand-consulter-un-cardiologue/#article',
    )
    expect(result['headline']).toBe('Quand consulter un cardiologue ?')
    expect(result['description']).toBe(
      'Découvrez les signes qui doivent vous amener à consulter un cardiologue.',
    )
    expect(result['image']).toBe(
      'https://media.medsite.fr/dr-martin/blog-cardio.jpg',
    )
    expect(result['datePublished']).toBe('2026-03-15T10:00:00Z')
    expect(result['dateModified']).toBe('2026-04-01T14:30:00Z')
    expect(result['inLanguage']).toBe('fr-FR')
  })

  it('links author to practitioner via @id', () => {
    const result = generateArticleJsonLd(specialistTenant, blogPost)
    const author = result['author'] as Record<string, unknown>
    expect(author['@id']).toBe('https://dr-martin.medsite.fr/#practitioner')
  })

  it('links publisher to organization via @id', () => {
    const result = generateArticleJsonLd(specialistTenant, blogPost)
    const publisher = result['publisher'] as Record<string, unknown>
    expect(publisher['@id']).toBe('https://dr-martin.medsite.fr/#organization')
  })

  it('includes mainEntityOfPage with correct URL', () => {
    const result = generateArticleJsonLd(specialistTenant, blogPost)
    const mainEntity = result['mainEntityOfPage'] as Record<string, unknown>
    expect(mainEntity['@type']).toBe('WebPage')
    expect(mainEntity['@id']).toBe(
      'https://dr-martin.medsite.fr/blog/quand-consulter-un-cardiologue',
    )
  })

  it('includes articleSection and keywords when provided', () => {
    const result = generateArticleJsonLd(specialistTenant, blogPost)
    expect(result['articleSection']).toBe('Prévention')
    expect(result['keywords']).toBe('cardiologie, prévention, santé')
  })

  it('omits optional fields when not provided', () => {
    const result = generateArticleJsonLd(wellnessTenant, blogPostMinimal)

    expect(result['description']).toBeUndefined()
    expect(result['image']).toBeUndefined()
    expect(result['dateModified']).toBeUndefined()
    expect(result['articleSection']).toBeUndefined()
    expect(result['keywords']).toBeUndefined()
  })

  it('@id references are consistent across generators', () => {
    const result = generateArticleJsonLd(specialistTenant, blogPost)
    const author = result['author'] as Record<string, unknown>
    const publisher = result['publisher'] as Record<string, unknown>

    // These must match the @id from practitioner and home generators
    expect(author['@id']).toBe('https://dr-martin.medsite.fr/#practitioner')
    expect(publisher['@id']).toBe('https://dr-martin.medsite.fr/#organization')
  })
})
