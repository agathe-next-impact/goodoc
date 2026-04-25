import type { GlobalConfig } from 'payload'

import { tenantIsolation } from '../access/tenant-isolation'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Réglages du site',
  admin: {
    description:
      'Personnalisez l\'apparence, les couleurs et les liens de votre site.',
    group: 'Mon site',
  },
  access: {
    read: tenantIsolation,
    update: tenantIsolation,
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
        // ── Apparence ──
        {
          label: 'Apparence',
          fields: [
            {
              name: 'templateId',
              type: 'select',
              defaultValue: 'medical-classic',
              label: 'Modèle de site',
              options: [
                { label: 'Medical Classic — bleu sobre, généraliste', value: 'medical-classic' },
                { label: 'Warm Wellness — chaleureux, paramédical / bien-être', value: 'warm-wellness' },
                { label: 'Modern Clinic — premium sombre, dentaire / chirurgie', value: 'modern-clinic' },
                { label: 'Minimal Pro — éditorial noir et blanc, institutionnel', value: 'minimal-pro' },
                { label: 'Family Practice — vert chaleureux, pédiatrie / famille', value: 'family-practice' },
              ],
              admin: {
                description:
                  'Le modèle détermine la palette, la typographie et la mise en page. Changer de modèle ne modifie pas vos contenus existants.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'primaryColor',
                  type: 'text',
                  label: 'Couleur principale',
                  admin: {
                    placeholder: '#205BB8',
                    width: '50%',
                    description: 'Code couleur hexadécimal. Ex : #205BB8',
                  },
                },
                {
                  name: 'secondaryColor',
                  type: 'text',
                  label: 'Couleur secondaire',
                  admin: {
                    placeholder: '#F5F5F5',
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'fontHeading',
                  type: 'text',
                  label: 'Police des titres',
                  admin: { width: '50%', placeholder: 'Inter' },
                },
                {
                  name: 'fontBody',
                  type: 'text',
                  label: 'Police du texte',
                  admin: { width: '50%', placeholder: 'Inter' },
                },
              ],
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon',
              admin: {
                description: 'L\'icône affichée dans l\'onglet du navigateur.',
              },
            },
          ],
        },
        // ── Réseaux sociaux ──
        {
          label: 'Réseaux sociaux',
          fields: [
            {
              name: 'googleBusinessUrl',
              type: 'text',
              label: 'Google Business',
              admin: { placeholder: 'https://g.page/votre-fiche' },
            },
            {
              name: 'facebookUrl',
              type: 'text',
              label: 'Facebook',
              admin: { placeholder: 'https://facebook.com/votre-page' },
            },
            {
              name: 'instagramUrl',
              type: 'text',
              label: 'Instagram',
              admin: { placeholder: 'https://instagram.com/votre-compte' },
            },
            {
              name: 'linkedinUrl',
              type: 'text',
              label: 'LinkedIn',
              admin: { placeholder: 'https://linkedin.com/in/votre-profil' },
            },
          ],
        },
        // ── Analytics ──
        {
          label: 'Statistiques',
          fields: [
            {
              name: 'plausibleSiteId',
              type: 'text',
              label: 'Identifiant Plausible',
              admin: {
                description:
                  'Configuré automatiquement. Contactez le support si besoin.',
              },
            },
            {
              name: 'googleAnalyticsId',
              type: 'text',
              label: 'ID Google Analytics',
              admin: {
                placeholder: 'G-XXXXXXXXXX',
                description: 'Facultatif — si vous utilisez Google Analytics.',
              },
            },
          ],
        },
        // ── Mentions légales ──
        {
          label: 'Mentions légales',
          fields: [
            {
              name: 'legalMentions',
              type: 'richText',
              label: 'Mentions légales',
              admin: {
                description:
                  'Obligatoires pour tout site professionnel. Un modèle est pré-rempli.',
              },
            },
            {
              name: 'privacyPolicy',
              type: 'richText',
              label: 'Politique de confidentialité',
            },
            {
              name: 'cookieConsent',
              type: 'checkbox',
              defaultValue: true,
              label: 'Afficher le bandeau cookies',
              admin: {
                description:
                  'Obligatoire si vous utilisez des outils d\'analyse.',
              },
            },
          ],
        },
      ],
    },
    // Hidden
    {
      name: 'logoUrl',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'faviconUrl',
      type: 'text',
      admin: { hidden: true },
    },
  ],
}
