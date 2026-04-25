import { describe, expect, it } from 'vitest'

import { getBlock, listBlocks } from '../registry'

// Side-effect import registers every built-in block.
import '../blocks'

const expectedTypes = [
  'placeholder',
  'hero-split',
  'services-grid',
  'about-hero',
  'practitioner-card',
  'opening-hours',
  'location-map',
  'testimonials-grid',
  'faq-accordion',
  'contact-form',
  'cta-banner',
  'fee-pricing',
  'partner-logos',
]

describe('built-in blocks', () => {
  it('registers every expected block type', () => {
    const types = listBlocks().map((b) => b.blockType).sort()
    for (const expected of expectedTypes) {
      expect(types).toContain(expected)
    }
  })

  it('every block definition has a schema and a Component', () => {
    for (const blockType of expectedTypes) {
      const def = getBlock(blockType)
      expect(def, `missing ${blockType}`).toBeDefined()
      expect(def?.schema).toBeDefined()
      expect(def?.Component).toBeTypeOf('function')
    }
  })

  it('hero-split validates a minimal payload', () => {
    const def = getBlock('hero-split')!
    const parsed = def.schema.safeParse({
      blockType: 'hero-split',
      title: 'Votre santé, notre priorité',
      primaryCta: { label: 'Prendre rendez-vous', href: '/rendez-vous' },
      image: { url: 'https://example.com/portrait.jpg', alt: 'Portrait' },
    })
    expect(parsed.success).toBe(true)
  })

  it('services-grid rejects an empty services array', () => {
    const def = getBlock('services-grid')!
    const parsed = def.schema.safeParse({
      blockType: 'services-grid',
      title: 'Nos actes',
      services: [],
    })
    expect(parsed.success).toBe(false)
  })

  it('opening-hours enforces HH:MM format', () => {
    const def = getBlock('opening-hours')!
    const parsed = def.schema.safeParse({
      blockType: 'opening-hours',
      days: [
        {
          dayLabel: 'Lundi',
          ranges: [{ open: '09h', close: '12:00' }],
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })

  it('fee-pricing accepts a minimal fee list', () => {
    const def = getBlock('fee-pricing')!
    const parsed = def.schema.safeParse({
      blockType: 'fee-pricing',
      title: 'Tarifs',
      fees: [{ actLabel: 'Consultation', tarifSecu: '25 €' }],
    })
    expect(parsed.success).toBe(true)
  })
})
