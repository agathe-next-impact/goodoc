import type { CollectionConfig } from 'payload'

import { tenantIsolation } from '../access/tenant-isolation'
import { autoSlugFromTitle } from '../hooks/slug'
import { injectTenantId } from '../hooks/tenant-defaults'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pageType', 'isPublished', 'updatedAt'],
    description:
      'Les pages de votre site. Personnalisez le contenu de chaque page avec des blocs.',
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
              label: 'Titre de la page',
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              label: 'URL de la page',
              admin: {
                readOnly: true,
                description: 'Généré automatiquement à partir du titre.',
              },
            },
            {
              name: 'pageType',
              type: 'select',
              required: true,
              defaultValue: 'custom',
              label: 'Type de page',
              options: [
                { label: 'Accueil', value: 'home' },
                { label: 'À propos', value: 'about' },
                { label: 'Contact', value: 'contact' },
                { label: 'Actes', value: 'services' },
                { label: 'Blog', value: 'blog_index' },
                { label: 'Mentions légales', value: 'legal' },
                { label: 'Page libre', value: 'custom' },
              ],
            },
            {
              name: 'content',
              type: 'blocks',
              label: 'Contenu de la page',
              blocks: [
                // Hero
                {
                  slug: 'hero',
                  labels: { singular: 'En-tête (hero)', plural: 'En-têtes' },
                  fields: [
                    { name: 'heading', type: 'text', required: true, label: 'Titre principal' },
                    { name: 'subheading', type: 'text', label: 'Sous-titre' },
                    { name: 'image', type: 'upload', relationTo: 'media', label: 'Image de fond' },
                    { name: 'showBookingCta', type: 'checkbox', defaultValue: true, label: 'Afficher le bouton de RDV' },
                  ],
                },
                // Rich text
                {
                  slug: 'richText',
                  labels: { singular: 'Texte', plural: 'Textes' },
                  fields: [
                    { name: 'content', type: 'richText', required: true, label: 'Contenu' },
                  ],
                },
                // Services grid
                {
                  slug: 'servicesGrid',
                  labels: { singular: 'Grille d\'actes', plural: 'Grilles d\'actes' },
                  fields: [
                    { name: 'heading', type: 'text', label: 'Titre de la section', defaultValue: 'Nos actes' },
                    { name: 'maxItems', type: 'number', label: 'Nombre d\'actes à afficher', defaultValue: 6 },
                  ],
                },
                // Testimonials
                {
                  slug: 'testimonials',
                  labels: { singular: 'Témoignages', plural: 'Témoignages' },
                  fields: [
                    { name: 'heading', type: 'text', label: 'Titre de la section', defaultValue: 'Témoignages' },
                    { name: 'maxItems', type: 'number', label: 'Nombre de témoignages à afficher', defaultValue: 4 },
                  ],
                },
                // FAQ
                {
                  slug: 'faq',
                  labels: { singular: 'FAQ', plural: 'FAQ' },
                  fields: [
                    { name: 'heading', type: 'text', label: 'Titre de la section', defaultValue: 'Questions fréquentes' },
                  ],
                },
                // Map
                {
                  slug: 'map',
                  labels: { singular: 'Carte', plural: 'Cartes' },
                  fields: [
                    { name: 'heading', type: 'text', label: 'Titre de la section', defaultValue: 'Nous trouver' },
                    { name: 'height', type: 'number', label: 'Hauteur (px)', defaultValue: 400 },
                  ],
                },
                // Photo gallery
                {
                  slug: 'gallery',
                  labels: { singular: 'Galerie photos', plural: 'Galeries photos' },
                  fields: [
                    { name: 'heading', type: 'text', label: 'Titre de la section' },
                    { name: 'images', type: 'array', label: 'Photos', fields: [
                      { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Photo' },
                      { name: 'caption', type: 'text', label: 'Légende' },
                    ]},
                  ],
                },
                // Doctolib CTA
                {
                  slug: 'doctolibCta',
                  labels: { singular: 'Bouton Doctolib', plural: 'Boutons Doctolib' },
                  fields: [
                    { name: 'heading', type: 'text', label: 'Titre', defaultValue: 'Prendre rendez-vous' },
                    { name: 'showWidget', type: 'checkbox', defaultValue: false, label: 'Afficher le calendrier Doctolib intégré' },
                  ],
                },
                // Free HTML
                {
                  slug: 'freeHtml',
                  labels: { singular: 'Bloc libre', plural: 'Blocs libres' },
                  fields: [
                    { name: 'html', type: 'code', required: true, label: 'Code HTML',
                      admin: {
                        language: 'html',
                        description: 'Attention : ce contenu est injecté tel quel dans la page.',
                      },
                    },
                  ],
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
              label: 'Publier cette page',
              admin: {
                description:
                  'La page n\'est visible par vos patients que si elle est publiée.',
              },
            },
            {
              name: 'publishedAt',
              type: 'date',
              label: 'Date de publication',
              admin: {
                condition: (data) => data?.isPublished,
              },
            },
            {
              name: 'sortOrder',
              type: 'number',
              defaultValue: 0,
              label: 'Ordre dans le menu',
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
                  'Titre affiché dans les résultats Google. Laisser vide pour utiliser le titre de la page.',
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              label: 'Description SEO',
              maxLength: 300,
              admin: {
                description:
                  'Description affichée sous le titre dans les résultats Google.',
              },
            },
          ],
        },
      ],
    },
    // Hidden fields
    {
      name: 'isDraft',
      type: 'checkbox',
      defaultValue: true,
      admin: { hidden: true },
    },
  ],
}
