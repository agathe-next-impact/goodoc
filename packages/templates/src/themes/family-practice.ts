import { buildCorePresets } from '../presets/_builder'
import { defaultTheme } from '../theme/default-theme'
import type { TemplateDefinition } from '../types'

/**
 * `family-practice` — warm sage green with a gentle yellow accent, tuned
 * for paediatrics and general family medicine. Rounded corners, readable
 * humanist type, accessible contrasts.
 */
export const familyPractice: TemplateDefinition = {
  id: 'family-practice',
  name: 'Family Practice',
  description:
    'Vert sauge chaleureux, typographie accessible — pédiatrie, médecine familiale.',
  theme: {
    colors: {
      ...defaultTheme.colors,
      background: '60 30% 98%',
      foreground: '155 25% 18%',
      card: '0 0% 100%',
      cardForeground: '155 25% 18%',
      primary: '155 35% 38%',
      primaryForeground: '60 30% 98%',
      secondary: '155 30% 92%',
      secondaryForeground: '155 35% 20%',
      muted: '150 20% 95%',
      mutedForeground: '150 10% 40%',
      accent: '45 85% 90%',
      accentForeground: '155 35% 20%',
      destructive: '0 62% 48%',
      destructiveForeground: '60 30% 98%',
      border: '150 20% 88%',
      input: '150 20% 88%',
      ring: '155 35% 38%',
    },
    fonts: {
      sans: "'Nunito Sans', ui-sans-serif, system-ui",
      serif: "'Literata', ui-serif, Georgia",
    },
    radius: '0.75rem',
  },
  presets: buildCorePresets({
    heroBadge: 'Médecin de famille',
    heroTitle: 'Toute la famille, un seul cabinet.',
    heroSubtitle:
      'De la naissance à l’âge adulte, un suivi de proximité pour les petits et les grands, dans un cadre accueillant.',
    primaryCtaLabel: 'Prendre rendez-vous',
    secondaryCtaLabel: 'Découvrir le cabinet',
    servicesTitle: 'Nos consultations',
    servicesSubtitle:
      'Des consultations pensées pour chaque âge, de la pédiatrie au suivi des adultes.',
    aboutEyebrow: 'À propos',
    aboutTitle: 'Un cabinet familial, un suivi continu',
    aboutBody:
      'Nous accueillons les familles avec une approche pédagogique et bienveillante. Chaque consultation est un moment dédié, adapté à l’âge et au besoin de l’enfant ou de l’adulte.',
    testimonialsTitle: 'Ils nous font confiance',
    faqTitle: 'Vos questions fréquentes',
    ctaBannerTitle: 'Un rendez-vous pour votre famille ?',
    ctaBannerSubtitle: 'Créneaux disponibles en soirée et le samedi matin.',
    feesTitle: 'Tarifs pratiqués',
    partnersTitle: 'Partenaires du cabinet',
    openingHoursTitle: 'Horaires d’ouverture',
    locationTitle: 'Venir au cabinet',
    contactTitle: 'Nous contacter',
  }),
}
