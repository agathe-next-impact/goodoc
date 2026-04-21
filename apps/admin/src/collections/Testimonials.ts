import type { CollectionConfig } from 'payload'

import { tenantIsolation } from '../access/tenant-isolation'
import { injectTenantId } from '../hooks/tenant-defaults'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Témoignage', plural: 'Témoignages' },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'rating', 'source', 'isPublished'],
    description:
      'Les témoignages de vos patients. Vous pouvez les ajouter manuellement ou les importer depuis Google.',
    group: 'Mon site',
  },
  access: {
    read: tenantIsolation,
    create: tenantIsolation,
    update: tenantIsolation,
    delete: tenantIsolation,
  },
  hooks: {
    beforeChange: [injectTenantId],
  },
  fields: [
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
      label: 'Nom du patient',
      admin: {
        description:
          'Prénom et initiale du nom. Ex : Marie L.',
      },
    },
    {
      name: 'authorInitials',
      type: 'text',
      label: 'Initiales',
      maxLength: 5,
      admin: {
        description: 'Ex : ML — utilisé pour l\'avatar si pas de photo.',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Témoignage',
    },
    {
      name: 'rating',
      type: 'number',
      label: 'Note (1 à 5)',
      min: 1,
      max: 5,
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'manual',
      label: 'Source',
      options: [
        { label: 'Ajouté manuellement', value: 'manual' },
        { label: 'Google', value: 'google' },
      ],
    },
    {
      name: 'googleReviewId',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'consentGiven',
      type: 'checkbox',
      defaultValue: false,
      label: 'Consentement obtenu',
      admin: {
        description:
          'Confirmez avoir l\'accord du patient pour publier ce témoignage.',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      label: 'Publié sur le site',
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Date',
      admin: { description: 'Date du témoignage.' },
    },
  ],
}
