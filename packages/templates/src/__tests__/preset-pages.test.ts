import { describe, expect, it } from 'vitest'

import '../blocks'
import { buildPresetPages } from '../presets/pages'
import { getBlock } from '../registry'
import { registerBuiltInTemplates } from '../themes'

registerBuiltInTemplates()

describe('buildPresetPages', () => {
  it('produces the six canonical pages for every template', () => {
    const ids = [
      'medical-classic',
      'warm-wellness',
      'modern-clinic',
      'minimal-pro',
      'family-practice',
    ]
    for (const id of ids) {
      const pages = buildPresetPages(id)
      const slugs = pages.map((p) => p.slug).sort()
      expect(slugs).toEqual(
        ['a-propos', 'contact', 'faq', 'home', 'services', 'tarifs'].sort(),
      )
    }
  })

  it('each section still validates against its block schema after merging', () => {
    const pages = buildPresetPages('medical-classic')
    for (const page of pages) {
      for (const section of page.content) {
        const def = getBlock(section.blockType)
        expect(def, `unknown block ${section.blockType}`).toBeDefined()
        const parsed = def!.schema.safeParse(section)
        expect(
          parsed.success,
          `${page.slug} · ${section.blockType} — ${
            parsed.success ? '' : JSON.stringify(parsed.error.issues)
          }`,
        ).toBe(true)
      }
    }
  })

  it('assigns stable sort order per slug', () => {
    const pages = buildPresetPages('medical-classic')
    const byslug = Object.fromEntries(pages.map((p) => [p.slug, p.sortOrder]))
    expect(byslug.home).toBe(0)
    expect(byslug['a-propos']).toBe(1)
    expect(byslug.services).toBe(2)
    expect(byslug.tarifs).toBe(3)
    expect(byslug.faq).toBe(4)
    expect(byslug.contact).toBe(5)
  })

  it('throws on unknown templateId', () => {
    expect(() => buildPresetPages('does-not-exist')).toThrow(/Unknown template/)
  })
})
