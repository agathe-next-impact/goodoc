import type { CollectionConfig } from 'payload'

import { tenantIsolation } from '../access/tenant-isolation'
import { autoSlugFromTitle } from '../hooks/slug'
import { injectTenantId } from '../hooks/tenant-defaults'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'isPublished', 'publishedAt'],
    description:
      'Rédigez des articles pour votre blog. Les articles publiés améliorent votre référencement.',
    group: 'Mon site',
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
              label: 'Titre de l\'article',
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              label: 'URL de l\'article',
              admin: {
                readOnly: true,
                description: 'Généré automatiquement à partir du titre.',
              },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Résumé',
              maxLength: 500,
              admin: {
                description:
                  'Court résumé affiché dans les listes et les partages sur les réseaux sociaux.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              label: 'Contenu de l\'article',
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Image de couverture',
            },
          ],
        },
        // ── Catégorie & tags ──
        {
          label: 'Catégorie',
          fields: [
            {
              name: 'category',
              type: 'text',
              label: 'Catégorie',
              admin: {
                description: 'Ex : Prévention, Conseils, Actualités',
              },
            },
            {
              name: 'tags',
              type: 'array',
              label: 'Tags',
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                  required: true,
                  label: 'Tag',
                },
              ],
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
              label: 'Publier cet article',
            },
            {
              name: 'publishedAt',
              type: 'date',
              label: 'Date de publication',
              admin: {
                description:
                  'Date affichée sur l\'article. Si vide, la date de publication sera utilisée.',
              },
            },
            {
              name: 'authorId',
              type: 'text',
              label: 'Auteur',
              admin: { hidden: true },
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
                  'Titre affiché dans Google. Laisser vide pour utiliser le titre de l\'article.',
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              label: 'Description SEO',
              maxLength: 300,
              admin: {
                description:
                  'Description affichée dans Google. Laisser vide pour utiliser le résumé.',
              },
            },
          ],
        },
      ],
    },
    // Hidden
    {
      name: 'coverImageUrl',
      type: 'text',
      admin: { hidden: true },
    },
  ],
}
