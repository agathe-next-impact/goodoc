import type { CollectionConfig } from 'payload'

import { tenantIsolation } from '../access/tenant-isolation'
import { injectTenantId } from '../hooks/tenant-defaults'

export const OpeningHours: CollectionConfig = {
  slug: 'opening-hours',
  labels: { singular: 'Horaire', plural: 'Horaires' },
  admin: {
    defaultColumns: ['dayOfWeek', 'openTime', 'closeTime', 'isClosed'],
    description:
      'Les horaires d\'ouverture de votre cabinet.',
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
      name: 'addressId',
      type: 'text',
      required: true,
      label: 'Adresse',
      admin: { hidden: true },
    },
    {
      name: 'dayOfWeek',
      type: 'select',
      required: true,
      label: 'Jour',
      options: [
        { label: 'Lundi', value: '0' },
        { label: 'Mardi', value: '1' },
        { label: 'Mercredi', value: '2' },
        { label: 'Jeudi', value: '3' },
        { label: 'Vendredi', value: '4' },
        { label: 'Samedi', value: '5' },
        { label: 'Dimanche', value: '6' },
      ],
    },
    {
      name: 'isClosed',
      type: 'checkbox',
      defaultValue: false,
      label: 'Fermé ce jour',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'openTime',
          type: 'text',
          label: 'Ouverture',
          admin: {
            placeholder: '09:00',
            width: '50%',
            condition: (data) => !data?.isClosed,
          },
        },
        {
          name: 'closeTime',
          type: 'text',
          label: 'Fermeture',
          admin: {
            placeholder: '18:00',
            width: '50%',
            condition: (data) => !data?.isClosed,
          },
        },
      ],
    },
  ],
}
