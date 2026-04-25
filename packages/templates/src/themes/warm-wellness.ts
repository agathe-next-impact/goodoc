import { buildCorePresets } from '../presets/_builder'
import { defaultTheme } from '../theme/default-theme'
import type { TemplateDefinition } from '../types'

/**
 * `warm-wellness` — terracotta + pastel palette and rounded corners, tuned
 * for psychologues, kinés, ostéopathes, sages-femmes. Humanist serif for
 * headings, Nunito body for warmth.
 */
export const warmWellness: TemplateDefinition = {
  id: 'warm-wellness',
  name: 'Warm Wellness',
  description:
    'Palette chaleureuse terracotta/pastel, typographie ronde — psy, kiné, ostéo, sage-femme.',
  theme: {
    colors: {
      ...defaultTheme.colors,
      background: '30 30% 98%',
      foreground: '20 20% 20%',
      card: '0 0% 100%',
      cardForeground: '20 20% 20%',
      primary: '15 48% 48%',
      primaryForeground: '30 30% 98%',
      secondary: '15 30% 92%',
      secondaryForeground: '15 45% 25%',
      muted: '30 20% 95%',
      mutedForeground: '20 10% 45%',
      accent: '40 60% 93%',
      accentForeground: '15 45% 25%',
      destructive: '0 72% 51%',
      destructiveForeground: '0 0% 100%',
      border: '30 20% 88%',
      input: '30 20% 88%',
      ring: '15 48% 48%',
    },
    fonts: {
      sans: "'Nunito', ui-sans-serif, system-ui",
      serif: "'DM Serif Display', ui-serif, Georgia",
    },
    radius: '1rem',
  },
  presets: buildCorePresets({
    heroTitle: 'Prenez soin de vous, en douceur.',
    heroSubtitle:
      'Un espace d’accompagnement bienveillant pour retrouver équilibre, sérénité et confiance en son corps.',
    primaryCtaLabel: 'Réserver ma séance',
    secondaryCtaLabel: 'Découvrir le cabinet',
    servicesTitle: 'Mes prestations',
    servicesSubtitle:
      'Des séances pensées pour vous — écoute, présence et ajustement à votre rythme.',
    aboutEyebrow: 'À propos',
    aboutTitle: 'Une approche chaleureuse et à l’écoute',
    aboutBody:
      'J’accompagne chacun·e dans un cadre bienveillant, sans jugement, à son rythme. Formé·e aux pratiques contemporaines et aux approches corporelles, je propose un espace sécurisant pour explorer ce qui compte pour vous.',
    testimonialsTitle: 'Paroles de patient·es',
    faqTitle: 'Vos questions',
    ctaBannerTitle: 'Envie d’une première séance ?',
    ctaBannerSubtitle: 'Je vous recontacte sous 48 h pour fixer un créneau.',
    ctaBannerTone: 'subtle',
    feesTitle: 'Tarifs des séances',
    partnersTitle: 'Mutuelles partenaires',
    openingHoursTitle: 'Disponibilités',
    locationTitle: 'Où me trouver',
    contactTitle: 'Me contacter',
  }),
}
