import { buildCorePresets } from '../presets/_builder'
import { defaultTheme } from '../theme/default-theme'
import type { TemplateDefinition } from '../types'

/**
 * `modern-clinic` — dark premium with navy background and a gold accent,
 * targeting dental surgeons, cosmetic surgeons and high-end practices.
 * Tight radius, Cormorant serif headings.
 */
export const modernClinic: TemplateDefinition = {
  id: 'modern-clinic',
  name: 'Modern Clinic',
  description:
    'Sombre premium, bleu nuit + accent or — dentiste, chirurgie esthétique, cabinets haut de gamme.',
  theme: {
    colors: {
      ...defaultTheme.colors,
      background: '220 20% 8%',
      foreground: '220 20% 95%',
      card: '220 18% 11%',
      cardForeground: '220 20% 95%',
      primary: '195 80% 50%',
      primaryForeground: '220 20% 8%',
      secondary: '220 15% 14%',
      secondaryForeground: '220 20% 95%',
      muted: '220 15% 12%',
      mutedForeground: '220 10% 65%',
      accent: '45 80% 55%',
      accentForeground: '220 20% 5%',
      destructive: '0 62% 45%',
      destructiveForeground: '220 20% 95%',
      border: '220 15% 18%',
      input: '220 15% 18%',
      ring: '195 80% 50%',
    },
    fonts: {
      sans: "'Inter', ui-sans-serif, system-ui",
      serif: "'Cormorant Garamond', ui-serif, Georgia",
    },
    radius: '0.25rem',
  },
  presets: buildCorePresets({
    heroBadge: 'Excellence clinique',
    heroTitle: 'Un savoir-faire au service de votre santé.',
    heroSubtitle:
      'Un plateau technique de pointe, une équipe expérimentée, un suivi personnalisé du premier rendez-vous à la cicatrisation.',
    primaryCtaLabel: 'Prendre rendez-vous',
    secondaryCtaLabel: 'Découvrir le cabinet',
    servicesTitle: 'Nos expertises',
    servicesSubtitle:
      'Des protocoles fondés sur les dernières recommandations, dans un cadre discret et maîtrisé.',
    aboutEyebrow: 'Le cabinet',
    aboutTitle: 'Un cadre d’exception pour une médecine d’excellence',
    aboutBody:
      'Pensé pour allier performance technique et confort patient, le cabinet dispose d’équipements de dernière génération et d’une équipe dédiée à la qualité de chaque prise en charge.',
    testimonialsTitle: 'Ils nous ont fait confiance',
    faqTitle: 'Questions fréquentes',
    ctaBannerTitle: 'Planifions votre consultation.',
    ctaBannerSubtitle: 'Premier rendez-vous disponible sous 10 jours.',
    feesTitle: 'Honoraires et conventionnement',
    partnersTitle: 'Références et partenariats',
    openingHoursTitle: 'Horaires d’accueil',
    locationTitle: 'Accès au cabinet',
    contactTitle: 'Contact',
  }),
}
