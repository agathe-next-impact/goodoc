import type { Block } from 'payload'

import { ctaFields, imageFields } from './_shared'

/**
 * All 13 Payload Blocks available in the page editor. Each `slug` must
 * exactly match a registered `blockType` in `@medsite/templates` — the
 * `SectionRenderer` uses that literal to look up the React component and
 * the Zod schema to validate.
 *
 * When editing this file, cross-check against
 * `packages/templates/src/blocks/*.tsx`:
 *   - field names must match Zod keys
 *   - required fields in Payload must match `.min(1)` / non-optional Zod fields
 *   - enums / selects must match `z.enum(...)`
 */

export const placeholderBlock: Block = {
  slug: 'placeholder',
  labels: { singular: 'Bloc de test', plural: 'Blocs de test' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    { name: 'body', type: 'textarea', label: 'Contenu' },
  ],
}

export const heroSplitBlock: Block = {
  slug: 'hero-split',
  labels: { singular: 'En-tête avec image', plural: 'En-têtes avec image' },
  fields: [
    { name: 'badge', type: 'text', label: 'Badge (optionnel)' },
    { name: 'title', type: 'text', required: true, label: 'Titre principal' },
    { name: 'subtitle', type: 'textarea', label: 'Sous-titre' },
    { name: 'primaryCta', type: 'group', label: 'Bouton principal', fields: ctaFields },
    { name: 'secondaryCta', type: 'group', label: 'Bouton secondaire (optionnel)', fields: ctaFields },
    { name: 'image', type: 'group', label: 'Image', fields: imageFields },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      label: 'Position de l’image',
      options: [
        { label: 'À droite', value: 'right' },
        { label: 'À gauche', value: 'left' },
      ],
    },
  ],
}

export const servicesGridBlock: Block = {
  slug: 'services-grid',
  labels: { singular: 'Grille d’actes', plural: 'Grilles d’actes' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titre de la section' },
    { name: 'subtitle', type: 'textarea', label: 'Sous-titre' },
    {
      name: 'services',
      type: 'array',
      minRows: 1,
      label: 'Actes',
      labels: { singular: 'Acte', plural: 'Actes' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Nom de l’acte' },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'priceLabel', type: 'text', label: 'Tarif (affiché tel quel, ex. "25 €")', admin: { width: '50%' } },
        { name: 'durationLabel', type: 'text', label: 'Durée (ex. "30 min")', admin: { width: '50%' } },
        { name: 'href', type: 'text', label: 'Lien vers la page de détail (optionnel)' },
        { name: 'iconInitial', type: 'text', maxLength: 2, label: 'Initiale (1 ou 2 lettres)' },
      ],
    },
    {
      name: 'columns',
      type: 'number',
      defaultValue: 3,
      min: 2,
      max: 4,
      label: 'Nombre de colonnes (2, 3 ou 4)',
    },
  ],
}

export const aboutHeroBlock: Block = {
  slug: 'about-hero',
  labels: { singular: 'En-tête de page', plural: 'En-têtes de page' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Mention au-dessus du titre' },
    { name: 'title', type: 'text', required: true, label: 'Titre' },
    { name: 'body', type: 'textarea', required: true, label: 'Paragraphe' },
    { name: 'image', type: 'group', label: 'Image (optionnelle)', fields: imageFields },
    { name: 'cta', type: 'group', label: 'Bouton (optionnel)', fields: ctaFields },
  ],
}

export const practitionerCardBlock: Block = {
  slug: 'practitioner-card',
  labels: { singular: 'Carte praticien', plural: 'Cartes praticien' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'civility', type: 'text', label: 'Civilité (ex. "Dr.")', admin: { width: '33%' } },
        { name: 'firstName', type: 'text', required: true, label: 'Prénom', admin: { width: '33%' } },
        { name: 'lastName', type: 'text', required: true, label: 'Nom', admin: { width: '34%' } },
      ],
    },
    { name: 'specialty', type: 'text', required: true, label: 'Spécialité' },
    { name: 'bio', type: 'textarea', label: 'Biographie' },
    { name: 'photo', type: 'group', label: 'Portrait', fields: imageFields },
    { name: 'rppsLabel', type: 'text', label: 'Mention RPPS / ADELI' },
    {
      name: 'credentials',
      type: 'array',
      label: 'Diplômes et formation',
      labels: { singular: 'Diplôme', plural: 'Diplômes' },
      fields: [{ name: 'value', type: 'text', required: true, label: 'Diplôme' }],
    },
    {
      name: 'languages',
      type: 'array',
      label: 'Langues parlées',
      labels: { singular: 'Langue', plural: 'Langues' },
      fields: [{ name: 'value', type: 'text', required: true, label: 'Langue' }],
    },
    {
      name: 'consultationFormats',
      type: 'array',
      label: 'Formats de consultation',
      labels: { singular: 'Format', plural: 'Formats' },
      fields: [{ name: 'value', type: 'text', required: true, label: 'Format' }],
    },
  ],
}

export const openingHoursBlock: Block = {
  slug: 'opening-hours',
  labels: { singular: 'Horaires d’ouverture', plural: 'Horaires d’ouverture' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    { name: 'subtitle', type: 'textarea', label: 'Sous-titre' },
    {
      name: 'days',
      type: 'array',
      minRows: 1,
      label: 'Jours',
      labels: { singular: 'Jour', plural: 'Jours' },
      fields: [
        { name: 'dayLabel', type: 'text', required: true, label: 'Jour' },
        { name: 'isClosed', type: 'checkbox', label: 'Fermé' },
        {
          name: 'ranges',
          type: 'array',
          label: 'Créneaux horaires',
          labels: { singular: 'Créneau', plural: 'Créneaux' },
          admin: {
            condition: (_data, siblingData: Record<string, unknown>) =>
              !siblingData?.isClosed,
          },
          fields: [
            { name: 'open', type: 'text', required: true, label: 'Ouverture (HH:MM)', admin: { width: '50%' } },
            { name: 'close', type: 'text', required: true, label: 'Fermeture (HH:MM)', admin: { width: '50%' } },
          ],
        },
        { name: 'note', type: 'text', label: 'Note (optionnel)' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phoneNumber', type: 'text', label: 'Téléphone', admin: { width: '50%' } },
        { name: 'phoneLabel', type: 'text', label: 'Libellé du téléphone', admin: { width: '50%' } },
      ],
    },
    { name: 'emergencyNote', type: 'textarea', label: 'Consignes d’urgence' },
  ],
}

export const locationMapBlock: Block = {
  slug: 'location-map',
  labels: { singular: 'Carte et adresse', plural: 'Cartes et adresses' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    { name: 'subtitle', type: 'textarea', label: 'Sous-titre' },
    { name: 'streetAddress', type: 'text', required: true, label: 'Adresse postale' },
    {
      type: 'row',
      fields: [
        { name: 'postalCode', type: 'text', required: true, label: 'Code postal', admin: { width: '33%' } },
        { name: 'city', type: 'text', required: true, label: 'Ville', admin: { width: '33%' } },
        { name: 'country', type: 'text', label: 'Pays', defaultValue: 'France', admin: { width: '34%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'latitude', type: 'number', label: 'Latitude', admin: { width: '50%' } },
        { name: 'longitude', type: 'number', label: 'Longitude', admin: { width: '50%' } },
      ],
    },
    {
      name: 'transports',
      type: 'array',
      label: 'Transports',
      labels: { singular: 'Transport', plural: 'Transports' },
      fields: [{ name: 'value', type: 'text', required: true, label: 'Transport' }],
    },
    { name: 'parking', type: 'textarea', label: 'Stationnement' },
    { name: 'accessibilityNote', type: 'textarea', label: 'Accessibilité' },
  ],
}

export const testimonialsGridBlock: Block = {
  slug: 'testimonials-grid',
  labels: { singular: 'Grille d’avis', plural: 'Grilles d’avis' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titre' },
    { name: 'subtitle', type: 'textarea', label: 'Sous-titre' },
    {
      name: 'testimonials',
      type: 'array',
      minRows: 1,
      label: 'Avis',
      labels: { singular: 'Avis', plural: 'Avis' },
      fields: [
        { name: 'authorName', type: 'text', required: true, label: 'Auteur (anonymisé — ex. "Marie D.")' },
        { name: 'content', type: 'textarea', required: true, label: 'Témoignage' },
        { name: 'rating', type: 'number', min: 1, max: 5, label: 'Note sur 5', admin: { width: '33%' } },
        { name: 'dateLabel', type: 'text', label: 'Date (ex. "Janvier 2026")', admin: { width: '33%' } },
        { name: 'source', type: 'text', label: 'Source (Google, Doctolib…)', admin: { width: '34%' } },
      ],
    },
  ],
}

export const faqAccordionBlock: Block = {
  slug: 'faq-accordion',
  labels: { singular: 'Questions fréquentes', plural: 'Questions fréquentes' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titre' },
    { name: 'subtitle', type: 'textarea', label: 'Sous-titre' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      label: 'Questions',
      labels: { singular: 'Question', plural: 'Questions' },
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Question' },
        { name: 'answer', type: 'textarea', required: true, label: 'Réponse' },
      ],
    },
  ],
}

export const contactFormBlock: Block = {
  slug: 'contact-form',
  labels: { singular: 'Formulaire de contact', plural: 'Formulaires de contact' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    { name: 'subtitle', type: 'textarea', label: 'Sous-titre' },
    { name: 'actionUrl', type: 'text', required: true, defaultValue: '/contact', label: 'URL de soumission' },
    { name: 'successMessage', type: 'text', label: 'Message de succès' },
    {
      name: 'motifs',
      type: 'array',
      label: 'Motifs proposés',
      labels: { singular: 'Motif', plural: 'Motifs' },
      fields: [{ name: 'value', type: 'text', required: true, label: 'Motif' }],
    },
    { name: 'showPhone', type: 'checkbox', defaultValue: true, label: 'Afficher le champ téléphone' },
    { name: 'legalNotice', type: 'textarea', label: 'Mention légale RGPD' },
  ],
}

export const ctaBannerBlock: Block = {
  slug: 'cta-banner',
  labels: { singular: 'Bandeau d’appel à l’action', plural: 'Bandeaux d’appel à l’action' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titre' },
    { name: 'subtitle', type: 'textarea', label: 'Sous-titre' },
    { name: 'primaryCta', type: 'group', label: 'Bouton principal', fields: ctaFields },
    { name: 'secondaryCta', type: 'group', label: 'Bouton secondaire (optionnel)', fields: ctaFields },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'primary',
      label: 'Ton visuel',
      options: [
        { label: 'Coloré (principal)', value: 'primary' },
        { label: 'Doux (secondaire)', value: 'subtle' },
      ],
    },
  ],
}

export const feePricingBlock: Block = {
  slug: 'fee-pricing',
  labels: { singular: 'Tableau de tarifs', plural: 'Tableaux de tarifs' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titre' },
    { name: 'subtitle', type: 'textarea', label: 'Sous-titre' },
    { name: 'disclaimer', type: 'textarea', label: 'Avertissement (en bas du tableau)' },
    {
      name: 'fees',
      type: 'array',
      minRows: 1,
      label: 'Actes',
      labels: { singular: 'Acte', plural: 'Actes' },
      fields: [
        { name: 'actLabel', type: 'text', required: true, label: 'Acte' },
        { name: 'durationLabel', type: 'text', label: 'Durée' },
        { name: 'tarifSecu', type: 'text', label: 'Tarif Sécurité sociale' },
        { name: 'tarifCabinet', type: 'text', label: 'Tarif cabinet' },
        { name: 'conventionLabel', type: 'text', label: 'Convention' },
        { name: 'note', type: 'textarea', label: 'Note' },
      ],
    },
  ],
}

export const partnerLogosBlock: Block = {
  slug: 'partner-logos',
  labels: { singular: 'Bande de partenaires', plural: 'Bandes de partenaires' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    { name: 'subtitle', type: 'textarea', label: 'Sous-titre' },
    {
      name: 'logos',
      type: 'array',
      minRows: 1,
      label: 'Partenaires',
      labels: { singular: 'Partenaire', plural: 'Partenaires' },
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nom' },
        { name: 'image', type: 'group', label: 'Logo (optionnel)', fields: imageFields },
        { name: 'href', type: 'text', label: 'Lien (optionnel)' },
      ],
    },
  ],
}

export const pageBlocks: Block[] = [
  heroSplitBlock,
  servicesGridBlock,
  aboutHeroBlock,
  practitionerCardBlock,
  openingHoursBlock,
  locationMapBlock,
  testimonialsGridBlock,
  faqAccordionBlock,
  contactFormBlock,
  ctaBannerBlock,
  feePricingBlock,
  partnerLogosBlock,
  placeholderBlock,
]
