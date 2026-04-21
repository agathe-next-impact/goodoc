import type { CollectionConfig } from 'payload'

import { tenantIsolation } from '../access/tenant-isolation'
import { injectTenantId } from '../hooks/tenant-defaults'

export const Addresses: CollectionConfig = {
  slug: 'addresses',
  labels: { singular: 'Adresse', plural: 'Adresses' },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'streetAddress', 'city', 'isPrimary'],
    description:
      'L\'adresse de votre cabinet. Si vous avez plusieurs lieux de consultation, ajoutez-les ici.',
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
      name: 'practitionerId',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'label',
      type: 'text',
      label: 'Nom du lieu',
      admin: {
        placeholder: 'Ex : Cabinet principal',
      },
    },
    {
      name: 'streetAddress',
      type: 'text',
      required: true,
      label: 'Adresse',
      admin: { placeholder: '15 Rue de la Santé' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'postalCode',
          type: 'text',
          required: true,
          label: 'Code postal',
          admin: { width: '30%' },
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          label: 'Ville',
          admin: { width: '50%' },
        },
        {
          name: 'country',
          type: 'text',
          required: true,
          defaultValue: 'FR',
          label: 'Pays',
          admin: { width: '20%', readOnly: true },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          label: 'Latitude',
          admin: {
            width: '50%',
            description: 'Renseignée automatiquement (bientôt).',
            step: 0.0000001,
          },
        },
        {
          name: 'longitude',
          type: 'number',
          label: 'Longitude',
          admin: {
            width: '50%',
            description: 'Renseignée automatiquement (bientôt).',
            step: 0.0000001,
          },
        },
      ],
    },
    {
      name: 'isPrimary',
      type: 'checkbox',
      defaultValue: false,
      label: 'Adresse principale',
      admin: {
        description:
          'L\'adresse principale est affichée en priorité sur votre site.',
      },
    },
  ],
}
