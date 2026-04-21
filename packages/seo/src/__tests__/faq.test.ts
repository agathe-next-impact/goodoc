import { describe, expect, it } from 'vitest'

import { generateFaqJsonLd } from '../generators/faq'
import { faqItems, specialistTenant } from './fixtures'

describe('generateFaqJsonLd', () => {
  it('generates FAQPage type', () => {
    const result = generateFaqJsonLd(specialistTenant, faqItems)

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('FAQPage')
    expect(result['@id']).toBe('https://dr-martin.medsite.fr/faq/#faq')
  })

  it('maps each FAQ item to a Question with acceptedAnswer', () => {
    const result = generateFaqJsonLd(specialistTenant, faqItems)
    const mainEntity = result['mainEntity'] as Record<string, unknown>[]

    expect(mainEntity).toHaveLength(3)

    expect(mainEntity[0]!['@type']).toBe('Question')
    expect(mainEntity[0]!['name']).toBe('Faut-il une ordonnance pour consulter ?')

    const answer = mainEntity[0]!['acceptedAnswer'] as Record<string, unknown>
    expect(answer['@type']).toBe('Answer')
    expect(answer['text']).toBe(
      'Non, vous pouvez prendre rendez-vous directement sans ordonnance.',
    )
  })

  it('handles a single FAQ item', () => {
    const result = generateFaqJsonLd(specialistTenant, [faqItems[0]!])
    const mainEntity = result['mainEntity'] as Record<string, unknown>[]
    expect(mainEntity).toHaveLength(1)
  })

  it('handles an empty FAQ list', () => {
    const result = generateFaqJsonLd(specialistTenant, [])
    const mainEntity = result['mainEntity'] as Record<string, unknown>[]
    expect(mainEntity).toHaveLength(0)
  })
})
