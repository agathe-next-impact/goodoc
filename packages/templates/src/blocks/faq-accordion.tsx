'use client'

import { cn } from '@medsite/ui'
import { useState } from 'react'
import { z } from 'zod'

import { registerBlock } from '../registry'
import { JsonLd } from './_shared/json-ld'
import { Section, SectionHeader } from './_shared/section'

/**
 * Client component — keeps its open/close state locally and relies on the
 * native `<details>` element semantics for accessibility (toggleable via
 * Space/Enter by default, ARIA roles handled by the browser). We still wrap
 * with `'use client'` because the controlled variant produces a better visual
 * transition than uncontrolled `<details>` can offer.
 */
export const faqAccordionSchema = z.object({
  blockType: z.literal('faq-accordion'),
  id: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  items: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .min(1),
})

export type FaqAccordionProps = z.infer<typeof faqAccordionSchema>

function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function FaqAccordion({ title, subtitle, items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <Section muted>
      <JsonLd data={faqJsonLd(items)} />
      <div className="mx-auto max-w-3xl">
        <SectionHeader title={title} subtitle={subtitle} align="center" />
        <ul className="divide-border bg-card border-border divide-y rounded-[var(--radius)] border">
          {items.map((item, index) => {
            const isOpen = openIndex === index
            const contentId = `faq-panel-${index}`
            const buttonId = `faq-button-${index}`
            return (
              <li key={`${item.question}-${index}`}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="focus-visible:ring-ring flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium focus-visible:outline-none focus-visible:ring-2"
                  >
                    <span>{item.question}</span>
                    <span
                      aria-hidden
                      className={cn(
                        'text-muted-foreground shrink-0 text-lg transition-transform',
                        isOpen && 'rotate-45',
                      )}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={contentId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="text-muted-foreground whitespace-pre-line px-5 pb-5 text-sm leading-relaxed"
                >
                  {item.answer}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}

registerBlock({
  blockType: 'faq-accordion',
  schema: faqAccordionSchema,
  Component: FaqAccordion,
})
