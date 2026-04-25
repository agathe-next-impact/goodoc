import type { Field } from 'payload'

/**
 * Payload field groups shared across multiple page blocks.
 *
 * Each field set mirrors the corresponding Zod schema in `@medsite/templates`
 * (`packages/templates/src/blocks/_shared/schemas.ts`). Keep them in sync:
 * a mismatch will make `SectionRenderer` silently drop the block in prod and
 * show a red debug banner in dev.
 */

export const imageFields: Field[] = [
  {
    name: 'url',
    type: 'text',
    label: 'URL de l’image',
    admin: {
      description:
        'Collez l’URL d’une image — utilisez la bibliothèque média pour uploader. Laissez vide si non utilisé.',
    },
  },
  {
    name: 'alt',
    type: 'text',
    label: 'Texte alternatif',
    admin: {
      description: 'Décrit l’image — important pour l’accessibilité et le SEO.',
    },
  },
  {
    name: 'width',
    type: 'number',
    label: 'Largeur (px)',
    admin: { width: '50%' },
  },
  {
    name: 'height',
    type: 'number',
    label: 'Hauteur (px)',
    admin: { width: '50%' },
  },
]

export const ctaFields: Field[] = [
  {
    name: 'label',
    type: 'text',
    required: true,
    label: 'Texte du bouton',
    admin: { width: '50%' },
  },
  {
    name: 'href',
    type: 'text',
    required: true,
    label: 'Lien',
    admin: {
      width: '50%',
      description: 'URL absolue (https://…) ou relative (/rendez-vous).',
    },
  },
  {
    name: 'external',
    type: 'checkbox',
    label: 'Ouvrir dans un nouvel onglet',
    admin: { width: '100%' },
  },
]
