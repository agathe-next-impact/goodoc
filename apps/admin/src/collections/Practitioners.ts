import type { CollectionConfig } from 'payload'

import { superAdminOnly, tenantIsolation } from '../access/tenant-isolation'
import {
  computeBookingModeHook,
  extractDoctolibSlugHook,
} from '../hooks/doctolib'
import {
  generateSpecialtySlugHook,
  mapSchemaOrgTypeHook,
} from '../hooks/specialty'

export const Practitioners: CollectionConfig = {
  slug: 'practitioners',
  labels: { singular: 'Profil', plural: 'Profil' },
  admin: {
    useAsTitle: 'lastName',
    defaultColumns: ['lastName', 'firstName', 'specialty'],
    description:
      'Vos informations professionnelles affichées sur votre site.',
    group: 'Mon site',
  },
  access: {
    read: tenantIsolation,
    update: tenantIsolation,
    create: superAdminOnly,
    delete: superAdminOnly,
  },
  hooks: {
    beforeChange: [
      extractDoctolibSlugHook,
      computeBookingModeHook,
      generateSpecialtySlugHook,
      mapSchemaOrgTypeHook,
    ],
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
        // ── Identité ──
        {
          label: 'Identité',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  type: 'select',
                  label: 'Civilité',
                  options: [
                    { label: 'Dr', value: 'Dr' },
                    { label: 'Mme', value: 'Mme' },
                    { label: 'M.', value: 'M.' },
                  ],
                  admin: { width: '20%' },
                },
                {
                  name: 'firstName',
                  type: 'text',
                  required: true,
                  label: 'Prénom',
                  admin: { width: '40%' },
                },
                {
                  name: 'lastName',
                  type: 'text',
                  required: true,
                  label: 'Nom',
                  admin: { width: '40%' },
                },
              ],
            },
            {
              name: 'specialty',
              type: 'text',
              required: true,
              label: 'Spécialité',
              admin: {
                description:
                  'Ex : Ostéopathe, Dermatologue, Sophrologue',
              },
            },
            {
              name: 'adeliRpps',
              type: 'text',
              label: 'N° ADELI ou RPPS',
              admin: {
                description:
                  'Facultatif — sera vérifié automatiquement (bientôt).',
              },
            },
            {
              name: 'bio',
              type: 'richText',
              label: 'Présentation',
              admin: {
                description:
                  'Décrivez votre parcours, votre approche et vos valeurs. 200-500 mots recommandés.',
              },
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Photo de profil',
            },
          ],
        },
        // ── Contact ──
        {
          label: 'Contact',
          fields: [
            {
              name: 'phoneNumber',
              type: 'text',
              label: 'Téléphone du cabinet',
              admin: { placeholder: '04 71 48 00 00' },
            },
            {
              name: 'email',
              type: 'email',
              label: 'Email professionnel',
            },
          ],
        },
        // ── Rendez-vous ──
        {
          label: 'Rendez-vous',
          fields: [
            {
              name: 'doctolibUrl',
              type: 'text',
              label: 'URL de votre profil Doctolib',
              admin: {
                description:
                  'Collez l\'URL complète de votre page Doctolib. Exemple : https://www.doctolib.fr/osteopathe/aurillac/jean-dupont',
                placeholder: 'https://www.doctolib.fr/...',
              },
            },
            {
              name: 'doctolibSlug',
              type: 'text',
              admin: { readOnly: true, hidden: true },
            },
            {
              name: 'alternativeBookingUrl',
              type: 'text',
              label: 'Autre outil de RDV en ligne (Cal.com, Calendly...)',
              admin: {
                condition: (data) => !data?.doctolibUrl,
                description:
                  'Si vous n\'utilisez pas Doctolib, indiquez l\'URL de votre outil de prise de RDV.',
              },
            },
            {
              name: 'bookingMode',
              type: 'select',
              options: [
                { label: 'Doctolib', value: 'doctolib' },
                { label: 'Autre outil', value: 'alternative' },
                { label: 'Formulaire de contact', value: 'contact' },
              ],
              defaultValue: 'contact',
              admin: {
                readOnly: true,
                description:
                  'Calculé automatiquement selon les URLs renseignées.',
              },
            },
            {
              name: 'showDoctolibWidget',
              type: 'checkbox',
              defaultValue: true,
              label: 'Afficher le calendrier Doctolib sur mon site',
              admin: {
                condition: (data) => data?.bookingMode === 'doctolib',
              },
            },
            {
              name: 'ctaLabel',
              type: 'text',
              label: 'Texte du bouton de RDV (optionnel)',
              admin: {
                placeholder: 'Prendre rendez-vous',
              },
            },
          ],
        },
      ],
    },
    // Hidden auto-computed fields
    {
      name: 'specialtySlug',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'schemaOrgType',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'photoUrl',
      type: 'text',
      admin: { hidden: true },
    },
  ],
}
