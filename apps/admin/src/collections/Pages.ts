import type { CollectionConfig } from 'payload'

import { tenantIsolation } from '../access/tenant-isolation'
import { autoSlugFromTitle } from '../hooks/slug'
import { injectTenantId } from '../hooks/tenant-defaults'
import { pageBlocks } from './_page-blocks/blocks'

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3003'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pageType', 'isPublished', 'updatedAt'],
    description:
      'Les pages de votre site. Personnalisez le contenu de chaque page avec des blocs.',
    group: 'Mon site',
    livePreview: {
      url: ({ data }) => {
        const slug = typeof data?.slug === 'string' ? data.slug : ''
        const secret = process.env.PREVIEW_SECRET ?? ''
        return `${WEB_URL}/api/preview?secret=${encodeURIComponent(secret)}&slug=${encodeURIComponent(slug)}`
      },
      breakpoints: [
        { name: 'mobile', label: 'Mobile', width: 375, height: 667 },
        { name: 'tablet', label: 'Tablette', width: 768, height: 1024 },
        { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
      ],
    },
  },
  access: {
    read: tenantIsolation,
    create: tenantIsolation,
    update: tenantIsolation,
    delete: tenantIsolation,
  },
  hooks: {
    beforeChange: [injectTenantId, autoSlugFromTitle],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
    {
      type: 'tabs',
      tabs: [
        // ── Contenu ──
        {
          label: 'Contenu',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Titre de la page',
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              label: 'URL de la page',
              admin: {
                readOnly: true,
                description: 'Généré automatiquement à partir du titre.',
              },
            },
            {
              name: 'pageType',
              type: 'select',
              required: true,
              defaultValue: 'custom',
              label: 'Type de page',
              options: [
                { label: 'Accueil', value: 'home' },
                { label: 'À propos', value: 'about' },
                { label: 'Contact', value: 'contact' },
                { label: 'Actes', value: 'services' },
                { label: 'Blog', value: 'blog_index' },
                { label: 'Mentions légales', value: 'legal' },
                { label: 'Page libre', value: 'custom' },
              ],
            },
            {
              name: 'blockPicker',
              type: 'ui',
              label: '',
              admin: {
                components: {
                  Field: '@/components/block-picker#BlockPicker',
                },
              },
            },
            {
              name: 'content',
              type: 'blocks',
              label: 'Contenu de la page',
              admin: {
                description:
                  'Composez votre page bloc par bloc. Utilisez « Insérer un bloc » ci-dessus pour parcourir la galerie avec aperçu.',
              },
              blocks: pageBlocks,
            },
          ],
        },
        // ── Publication ──
        {
          label: 'Publication',
          fields: [
            {
              name: 'isPublished',
              type: 'checkbox',
              defaultValue: false,
              label: 'Publier cette page',
              admin: {
                description:
                  'La page n\'est visible par vos patients que si elle est publiée.',
              },
            },
            {
              name: 'publishedAt',
              type: 'date',
              label: 'Date de publication',
              admin: {
                condition: (data) => data?.isPublished,
              },
            },
            {
              name: 'sortOrder',
              type: 'number',
              defaultValue: 0,
              label: 'Ordre dans le menu',
            },
          ],
        },
        // ── SEO ──
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              label: 'Titre SEO',
              maxLength: 200,
              admin: {
                description:
                  'Titre affiché dans les résultats Google. Laisser vide pour utiliser le titre de la page.',
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              label: 'Description SEO',
              maxLength: 300,
              admin: {
                description:
                  'Description affichée sous le titre dans les résultats Google.',
              },
            },
          ],
        },
      ],
    },
    // Hidden fields
    {
      name: 'isDraft',
      type: 'checkbox',
      defaultValue: true,
      admin: { hidden: true },
    },
  ],
}
