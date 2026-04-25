import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { FaqAccordion } from '../blocks/faq-accordion'
import { OpeningHours } from '../blocks/opening-hours'
import { ServicesGrid } from '../blocks/services-grid'
import { TestimonialsGrid } from '../blocks/testimonials-grid'

afterEach(cleanup)

function extractJsonLd(container: HTMLElement): Record<string, unknown>[] {
  const scripts = container.querySelectorAll('script[type="application/ld+json"]')
  return Array.from(scripts).map((s) => JSON.parse(s.textContent ?? '{}'))
}

describe('block-level JSON-LD', () => {
  it('FaqAccordion emits a FAQPage graph', () => {
    const { container } = render(
      <FaqAccordion
        blockType="faq-accordion"
        title="FAQ"
        items={[{ question: 'Q1 ?', answer: 'A1' }]}
      />,
    )
    const [graph] = extractJsonLd(container)
    expect(graph?.['@type']).toBe('FAQPage')
    expect(graph?.mainEntity).toMatchObject([
      {
        '@type': 'Question',
        name: 'Q1 ?',
        acceptedAnswer: { '@type': 'Answer', text: 'A1' },
      },
    ])
  })

  it('ServicesGrid emits an ItemList of Service', () => {
    const { container } = render(
      <ServicesGrid
        blockType="services-grid"
        title="Nos actes"
        services={[
          { title: 'Consultation', description: 'Standard', href: '/actes/c' },
        ]}
      />,
    )
    const [graph] = extractJsonLd(container)
    expect(graph?.['@type']).toBe('ItemList')
    expect(graph?.itemListElement).toMatchObject([
      {
        position: 1,
        item: {
          '@type': 'Service',
          name: 'Consultation',
          description: 'Standard',
          url: '/actes/c',
        },
      },
    ])
  })

  it('TestimonialsGrid emits an ItemList of Review with ratings', () => {
    const { container } = render(
      <TestimonialsGrid
        blockType="testimonials-grid"
        title="Avis"
        testimonials={[
          {
            authorName: 'Marie D.',
            content: 'Excellent suivi.',
            rating: 5,
            source: 'Doctolib',
          },
        ]}
      />,
    )
    const [graph] = extractJsonLd(container)
    expect(graph?.['@type']).toBe('ItemList')
    const firstReview = (graph?.itemListElement as Array<Record<string, unknown>>)[0]
    expect(firstReview?.item).toMatchObject({
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Marie D.' },
      reviewBody: 'Excellent suivi.',
      reviewRating: { '@type': 'Rating', ratingValue: 5 },
      publisher: { '@type': 'Organization', name: 'Doctolib' },
    })
  })

  it('OpeningHours emits a LocalBusiness with openingHoursSpecification', () => {
    const { container } = render(
      <OpeningHours
        blockType="opening-hours"
        days={[
          {
            dayLabel: 'Lundi',
            ranges: [
              { open: '09:00', close: '12:00' },
              { open: '14:00', close: '18:00' },
            ],
          },
          { dayLabel: 'Dimanche', isClosed: true },
        ]}
      />,
    )
    const [graph] = extractJsonLd(container)
    expect(graph?.['@type']).toBe('LocalBusiness')
    expect(graph?.openingHoursSpecification).toMatchObject([
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Mo', opens: '09:00', closes: '12:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Mo', opens: '14:00', closes: '18:00' },
    ])
  })
})
