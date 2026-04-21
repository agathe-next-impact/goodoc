import type { CollectionConfig } from 'payload'

import { tenantIsolation } from '../access/tenant-isolation'

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: { singular: 'Message', plural: 'Messages' },
  admin: {
    useAsTitle: 'senderName',
    defaultColumns: ['senderName', 'subject', 'status', 'createdAt'],
    description:
      'Les messages envoyés par vos patients via le formulaire de contact.',
    group: 'Activité',
  },
  access: {
    read: tenantIsolation,
    update: tenantIsolation,
    // Messages are created by the public form (API route), not from the admin
    create: () => false,
    delete: tenantIsolation,
  },
  fields: [
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'senderName',
      type: 'text',
      required: true,
      label: 'Nom',
      admin: { readOnly: true },
    },
    {
      name: 'senderEmail',
      type: 'email',
      required: true,
      label: 'Email',
      admin: { readOnly: true },
    },
    {
      name: 'senderPhone',
      type: 'text',
      label: 'Téléphone',
      admin: { readOnly: true },
    },
    {
      name: 'subject',
      type: 'text',
      label: 'Objet',
      admin: { readOnly: true },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Message',
      admin: { readOnly: true },
    },
    {
      name: 'motif',
      type: 'text',
      label: 'Motif',
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      label: 'Statut',
      options: [
        { label: 'Nouveau', value: 'new' },
        { label: 'Lu', value: 'read' },
        { label: 'Répondu', value: 'replied' },
        { label: 'Archivé', value: 'archived' },
      ],
    },
    {
      name: 'repliedAt',
      type: 'date',
      label: 'Répondu le',
      admin: {
        condition: (data) => data?.status === 'replied',
        readOnly: true,
      },
    },
  ],
}
