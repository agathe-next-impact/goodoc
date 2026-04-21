import type { CollectionConfig } from 'payload'

import { tenantIsolation } from '../access/tenant-isolation'
import { injectTenantId } from '../hooks/tenant-defaults'

export const FaqItems: CollectionConfig = {
  slug: 'faq-items',
  labels: { singular: 'Question fréquente', plural: 'Questions fréquentes' },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'sortOrder', 'isPublished'],
    description:
      'Les questions fréquentes de vos patients. Apparaissent sur votre site et dans les résultats Google.',
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
      name: 'question',
      type: 'text',
      required: true,
      label: 'Question',
      maxLength: 500,
      admin: {
        placeholder: 'Ex : Faut-il une ordonnance pour consulter ?',
      },
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
      label: 'Réponse',
      admin: {
        description: 'Répondez de manière claire et concise.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: 'Ordre d\'affichage',
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      label: 'Publiée sur le site',
    },
  ],
}
