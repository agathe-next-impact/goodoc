import type { CollectionConfig } from 'payload'

import { tenantIsolation } from '../access/tenant-isolation'
import { autoSlugFromTitle } from '../hooks/slug'
import { injectTenantId } from '../hooks/tenant-defaults'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Acte', plural: 'Actes' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'duration', 'showPrice', 'isPublished', 'sortOrder'],
    description:
      'Les actes et prestations que vous proposez. Chaque acte a sa propre page sur votre site.',
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
              label: 'Nom de l\'acte',
              admin: { placeholder: 'Ex : Ostéopathie sportive' },
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              label: 'URL de la page',
              admin: {
                readOnly: true,
                description:
                  'Généré automatiquement à partir du titre.',
              },
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              label: 'Description courte',
              maxLength: 500,
              admin: {
                description:
                  'Résumé en 1-2 phrases. Apparaît dans les listes et les résultats Google.',
              },
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Description détaillée',
              admin: {
                description:
                  'Décrivez l\'acte en détail : déroulement, bénéfices, indications.',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Image illustrative',
            },
          ],
        },
        // ── Tarifs & durée ──
        {
          label: 'Tarifs & durée',
          fields: [
            {
              name: 'duration',
              type: 'number',
              label: 'Durée (minutes)',
              admin: { placeholder: 'Ex : 45', step: 5 },
            },
            {
              name: 'showPrice',
              type: 'checkbox',
              defaultValue: false,
              label: 'Afficher les tarifs sur le site',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'priceMin',
                  type: 'number',
                  label: 'Tarif minimum (€)',
                  admin: {
                    condition: (data) => data?.showPrice,
                    width: '50%',
                    step: 1,
                  },
                },
                {
                  name: 'priceMax',
                  type: 'number',
                  label: 'Tarif maximum (€)',
                  admin: {
                    condition: (data) => data?.showPrice,
                    width: '50%',
                    step: 1,
                  },
                },
              ],
            },
          ],
        },
        // ── Options ──
        {
          label: 'Options',
          fields: [
            {
              name: 'category',
              type: 'text',
              label: 'Catégorie',
              admin: {
                description: 'Ex : Consultations, Soins, Bilans',
              },
            },
            {
              name: 'doctolibMotifSlug',
              type: 'text',
              label: 'Motif Doctolib',
              admin: {
                description:
                  'Identifiant du motif de consultation Doctolib pour la prise de RDV directe. Laisser vide si inconnu.',
                condition: (_, siblingData) => Boolean(siblingData?.doctolibMotifSlug) || false,
              },
            },
            {
              name: 'sortOrder',
              type: 'number',
              defaultValue: 0,
              label: 'Ordre d\'affichage',
              admin: {
                description: 'Les actes sont triés par ordre croissant.',
              },
            },
            {
              name: 'isPublished',
              type: 'checkbox',
              defaultValue: true,
              label: 'Publié sur le site',
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
                  'Titre affiché dans les résultats Google. Laisser vide pour utiliser le nom de l\'acte.',
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              label: 'Description SEO',
              maxLength: 300,
              admin: {
                description:
                  'Description affichée dans les résultats Google. Laisser vide pour utiliser la description courte.',
              },
            },
          ],
        },
      ],
    },
    // Hidden fields
    {
      name: 'imageUrl',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'schemaOrgData',
      type: 'json',
      admin: { hidden: true },
    },
  ],
}
