import { describe, expect, it } from 'vitest'

import '../blocks'
import { getBlock, listTemplates } from '../registry'
import { registerBuiltInTemplates } from '../themes'
import type { PagePreset } from '../types'

registerBuiltInTemplates()

const expectedTemplateIds = [
  'medical-classic',
  'warm-wellness',
  'modern-clinic',
  'minimal-pro',
  'family-practice',
]

const expectedPageSlugs = ['home', 'a-propos', 'services', 'contact', 'faq', 'tarifs']

describe('built-in templates', () => {
  it('registers every expected template id', () => {
    const ids = listTemplates().map((t) => t.id).sort()
    for (const expected of expectedTemplateIds) {
      expect(ids).toContain(expected)
    }
  })

  it('every template exposes the canonical set of page presets', () => {
    for (const template of listTemplates()) {
      if (!expectedTemplateIds.includes(template.id)) continue
      for (const slug of expectedPageSlugs) {
        expect(
          template.presets[slug],
          `${template.id} missing preset for ${slug}`,
        ).toBeDefined()
      }
    }
  })

  it('every preset section validates against its block schema', () => {
    for (const template of listTemplates()) {
      if (!expectedTemplateIds.includes(template.id)) continue
      for (const [slug, preset] of Object.entries(template.presets)) {
        const sections = preset as PagePreset
        sections.forEach((section, index) => {
          const def = getBlock(section.blockType)
          expect(
            def,
            `${template.id}:${slug}[${index}] — unknown block "${section.blockType}"`,
          ).toBeDefined()
          const parsed = def!.schema.safeParse(section.data)
          expect(
            parsed.success,
            `${template.id}:${slug}[${index}] (${section.blockType}) — ${
              parsed.success ? '' : JSON.stringify(parsed.error.issues)
            }`,
          ).toBe(true)
        })
      }
    }
  })

  it('theme tokens are well-formed HSL triplets', () => {
    const hslRe = /^\d+\s\d+%\s\d+%$/
    for (const template of listTemplates()) {
      if (!expectedTemplateIds.includes(template.id)) continue
      const { colors } = template.theme
      for (const [key, value] of Object.entries(colors)) {
        expect(value, `${template.id}.${key} must match "H S% L%"`).toMatch(hslRe)
      }
    }
  })
})
