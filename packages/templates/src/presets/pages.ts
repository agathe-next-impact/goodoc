import { getTemplate } from '../registry'

/**
 * DB-agnostic descriptor of a page materialised from a template preset.
 * Consumers (admin onboarding endpoint, dev seed) map this shape onto
 * their concrete `pages` row type.
 */
export type PresetPageDescriptor = {
  slug: string
  title: string
  pageType: string
  sortOrder: number
  content: Array<{ blockType: string } & Record<string, unknown>>
}

const slugToTitle: Record<string, string> = {
  home: 'Accueil',
  'a-propos': 'À propos',
  services: 'Nos actes',
  contact: 'Contact',
  faq: 'Foire aux questions',
  tarifs: 'Tarifs',
}

const slugToPageType: Record<string, string> = {
  home: 'home',
  'a-propos': 'about',
  services: 'services',
  contact: 'contact',
  faq: 'custom',
  tarifs: 'custom',
}

const slugToSortOrder: Record<string, number> = {
  home: 0,
  'a-propos': 1,
  services: 2,
  tarifs: 3,
  faq: 4,
  contact: 5,
}

/**
 * Materialises a template's presets into a list of page descriptors.
 * Throws if `templateId` is not registered — callers should call
 * `registerBuiltInTemplates()` first.
 */
export function buildPresetPages(templateId: string): PresetPageDescriptor[] {
  const template = getTemplate(templateId)
  if (!template) {
    throw new Error(
      `Unknown template "${templateId}". Did you call registerBuiltInTemplates()?`,
    )
  }

  return Object.entries(template.presets).map(([slug, sections]) => ({
    slug,
    title: slugToTitle[slug] ?? slug,
    pageType: slugToPageType[slug] ?? 'custom',
    sortOrder: slugToSortOrder[slug] ?? 100,
    content: sections.map((section) => ({
      blockType: section.blockType,
      ...section.data,
    })),
  }))
}
