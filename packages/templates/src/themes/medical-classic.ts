import { buildCorePresets } from '../presets/_builder'
import { defaultTheme } from '../theme/default-theme'
import type { TemplateDefinition } from '../types'

/**
 * `medical-classic` — sober, reassuring blue palette tuned for general
 * practitioners and specialists. Close to the global default tokens so an
 * unbranded tenant still looks intentional.
 */
export const medicalClassic: TemplateDefinition = {
  id: 'medical-classic',
  name: 'Medical Classic',
  description:
    'Palette bleu sobre, typographie lisible — adapté aux médecins généralistes et spécialistes.',
  theme: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: '201 96% 32%',
      primaryForeground: '0 0% 100%',
      accent: '201 96% 96%',
      accentForeground: '201 96% 20%',
      ring: '201 96% 32%',
    },
  },
  presets: buildCorePresets({
    heroBadge: 'Conventionné secteur 1',
    heroTitle: 'Votre santé, prise au sérieux.',
    heroSubtitle:
      'Médecin généraliste à Paris, j’accompagne adultes et adolescents dans leur suivi, leur prévention et leur traitement au quotidien.',
    primaryCtaLabel: 'Prendre rendez-vous',
    secondaryCtaLabel: 'En savoir plus',
    servicesTitle: 'Nos actes',
    servicesSubtitle:
      'Une médecine de proximité attentive, conjuguant écoute, rigueur et médecine fondée sur les preuves.',
    aboutEyebrow: 'Le praticien',
    aboutTitle: 'Une médecine humaine, rigoureuse et accessible',
    aboutBody:
      'Diplômé·e de la faculté de médecine de Paris, j’exerce depuis 2015 avec une approche fondée sur l’écoute, l’examen clinique approfondi et la prévention. Je reçois adultes et adolescents sur rendez-vous.',
    testimonialsTitle: 'Ce que disent les patient·es',
    testimonialsSubtitle:
      'Avis recueillis sur Google et Doctolib avec le consentement des auteurs.',
    faqTitle: 'Questions fréquentes',
    faqSubtitle:
      'Les réponses aux questions les plus courantes. En cas de doute, contactez-nous.',
    ctaBannerTitle: 'Besoin d’un rendez-vous ?',
    ctaBannerSubtitle:
      'La prise de rendez-vous en ligne est disponible 24 h / 24.',
    feesTitle: 'Tarifs et conventionnement',
    partnersTitle: 'Organismes partenaires',
    openingHoursTitle: 'Horaires du cabinet',
    locationTitle: 'Venir au cabinet',
    contactTitle: 'Nous contacter',
  }),
}
