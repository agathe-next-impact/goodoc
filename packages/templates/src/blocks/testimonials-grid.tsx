import { z } from 'zod'

import { registerBlock } from '../registry'
import { JsonLd } from './_shared/json-ld'
import { Section, SectionHeader } from './_shared/section'

/**
 * Grid of short patient quotes. Per CNIL, testimonials must be anonymised —
 * we model `authorName` as "Marie D." by default rather than full names. A
 * source label ("Google", "Doctolib") is optional and kept free-form so
 * tenants can credit the aggregation provider if needed.
 */
export const testimonialsGridSchema = z.object({
  blockType: z.literal('testimonials-grid'),
  id: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  testimonials: z
    .array(
      z.object({
        authorName: z.string().min(1),
        content: z.string().min(1),
        rating: z.number().int().min(1).max(5).optional(),
        dateLabel: z.string().optional(),
        source: z.string().optional(),
      }),
    )
    .min(1),
})

export type TestimonialsGridProps = z.infer<typeof testimonialsGridSchema>

function Stars({ rating }: { rating: number }) {
  const rounded = Math.max(1, Math.min(5, Math.round(rating)))
  return (
    <span aria-label={`Note ${rounded} sur 5`} className="text-primary">
      {'★'.repeat(rounded)}
      <span className="text-muted-foreground/40">{'★'.repeat(5 - rounded)}</span>
    </span>
  )
}

function testimonialsJsonLd(testimonials: TestimonialsGridProps['testimonials']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: testimonials.map((t, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Review',
        author: { '@type': 'Person', name: t.authorName },
        reviewBody: t.content,
        ...(typeof t.rating === 'number'
          ? {
              reviewRating: {
                '@type': 'Rating',
                ratingValue: t.rating,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
        ...(t.source ? { publisher: { '@type': 'Organization', name: t.source } } : {}),
      },
    })),
  }
}

export function TestimonialsGrid({
  title,
  subtitle,
  testimonials,
}: TestimonialsGridProps) {
  return (
    <Section>
      <JsonLd data={testimonialsJsonLd(testimonials)} />
      <SectionHeader title={title} subtitle={subtitle} align="center" />
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, index) => (
          <li
            key={`${t.authorName}-${index}`}
            className="bg-card border-border flex h-full flex-col rounded-[var(--radius)] border p-6"
          >
            {typeof t.rating === 'number' ? (
              <div className="mb-3 text-sm">
                <Stars rating={t.rating} />
              </div>
            ) : null}
            <blockquote className="text-foreground/90 flex-1 text-sm leading-relaxed">
              “{t.content}”
            </blockquote>
            <footer className="text-muted-foreground mt-5 flex items-center justify-between text-xs">
              <cite className="not-italic font-medium">{t.authorName}</cite>
              {t.source || t.dateLabel ? (
                <span>
                  {[t.dateLabel, t.source].filter(Boolean).join(' · ')}
                </span>
              ) : null}
            </footer>
          </li>
        ))}
      </ul>
    </Section>
  )
}

registerBlock({
  blockType: 'testimonials-grid',
  schema: testimonialsGridSchema,
  Component: TestimonialsGrid,
})
