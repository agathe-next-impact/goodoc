import { buildCorePresets } from '../presets/_builder'
import { defaultTheme } from '../theme/default-theme'
import type { TemplateDefinition } from '../types'

/**
 * `minimal-pro` — black/white editorial. Didone-style serif headings, sharp
 * corners, no accent color. For institutional / legal medicine / expert
 * advisory practices.
 */
export const minimalPro: TemplateDefinition = {
  id: 'minimal-pro',
  name: 'Minimal Pro',
  description:
    'Noir et blanc éditorial, serif classique — institutionnel, médecine juridique, expertise.',
  theme: {
    colors: {
      ...defaultTheme.colors,
      background: '0 0% 100%',
      foreground: '0 0% 10%',
      card: '0 0% 100%',
      cardForeground: '0 0% 10%',
      primary: '0 0% 10%',
      primaryForeground: '0 0% 100%',
      secondary: '0 0% 96%',
      secondaryForeground: '0 0% 10%',
      muted: '0 0% 96%',
      mutedForeground: '0 0% 45%',
      accent: '0 0% 92%',
      accentForeground: '0 0% 10%',
      destructive: '0 72% 45%',
      destructiveForeground: '0 0% 100%',
      border: '0 0% 88%',
      input: '0 0% 88%',
      ring: '0 0% 10%',
    },
    fonts: {
      sans: "'Inter', ui-sans-serif, system-ui",
      serif: "'Playfair Display', ui-serif, Georgia",
    },
    radius: '0rem',
  },
  presets: buildCorePresets({
    heroTitle: 'Une pratique médicale rigoureuse et responsable.',
    heroSubtitle:
      'Consultation, expertise et suivi personnalisé, dans le respect du secret médical et des bonnes pratiques cliniques.',
    primaryCtaLabel: 'Prendre rendez-vous',
    secondaryCtaLabel: 'Parcours',
    servicesTitle: 'Prestations',
    servicesSubtitle:
      'Chaque acte est conduit selon les protocoles professionnels et documenté précisément.',
    aboutEyebrow: 'Présentation',
    aboutTitle: 'Un exercice fondé sur la rigueur et le secret professionnel',
    aboutBody:
      'Praticien·ne inscrit·e au tableau de l’Ordre, j’exerce depuis plus de 10 ans dans le respect strict de la déontologie médicale et du secret professionnel. J’accompagne patients et institutions avec méthode et discrétion.',
    testimonialsTitle: 'Témoignages',
    faqTitle: 'Questions fréquentes',
    ctaBannerTitle: 'Prendre rendez-vous',
    ctaBannerSubtitle: 'Consultation sur rendez-vous uniquement.',
    ctaBannerTone: 'subtle',
    feesTitle: 'Tarifs et conditions',
    openingHoursTitle: 'Horaires',
    locationTitle: 'Accès',
    contactTitle: 'Contact',
  }),
}
