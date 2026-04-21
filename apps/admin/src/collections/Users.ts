import type { CollectionConfig } from 'payload'

import { superAdminOnly } from '../access/tenant-isolation'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'tenantId'],
    group: 'Système',
    description: 'Comptes utilisateurs et rôles d\'accès.',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nom complet',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'practitioner',
      label: 'Rôle',
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Praticien', value: 'practitioner' },
        { label: 'Collaborateur', value: 'collaborator' },
      ],
      access: {
        update: ({ req: { user } }) => user?.role === 'super-admin',
      },
    },
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      label: 'ID du cabinet',
      admin: {
        description: 'Identifiant du cabinet auquel cet utilisateur est rattaché.',
        condition: (data) => data?.role !== 'super-admin',
      },
      access: {
        update: ({ req: { user } }) => user?.role === 'super-admin',
      },
    },
  ],
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    create: superAdminOnly,
    delete: superAdminOnly,
  },
}
