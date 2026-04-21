import type { CollectionConfig } from 'payload'

import { publicRead, tenantIsolation } from '../access/tenant-isolation'
import { injectTenantId } from '../hooks/tenant-defaults'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Images' },
  admin: {
    group: 'Mon site',
    description: 'Photos et images utilisées sur votre site.',
  },
  access: {
    read: publicRead,
    create: tenantIsolation,
    update: tenantIsolation,
    delete: tenantIsolation,
  },
  hooks: {
    beforeChange: [injectTenantId],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Description de l\'image',
      required: true,
      admin: {
        description:
          'Décrivez ce que montre l\'image. Important pour l\'accessibilité et le référencement.',
      },
    },
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
      { name: 'card', width: 600, height: 400, position: 'centre' },
      { name: 'hero', width: 1200, height: 630, position: 'centre' },
    ],
  },
}
