import type { PagePreset, TemplateDefinition } from '../types'
import {
  placeholderCabinetUrl,
  placeholderPhotoUrl,
  standardAddress,
  standardCredentials,
  standardFaq,
  standardFees,
  standardLanguages,
  standardLegalNotice,
  standardOpeningDays,
  standardServices,
  standardTestimonials,
} from './_content'

/** Wraps `string[]` into Payload's `[{ value }]` array shape. */
const wrap = (items: readonly string[]) => items.map((value) => ({ value }))

/**
 * Skin parameters: the theme-specific wording that shapes each preset
 * without touching the underlying section order or data. Keeps the core
 * composition DRY while letting templates project their own voice.
 */
export type PresetSkin = {
  /** Optional badge chip shown above the hero H1 (e.g. "Secteur 1"). */
  heroBadge?: string
  heroTitle: string
  heroSubtitle: string
  /** CTA labels — kept in sync across hero / banners. */
  primaryCtaLabel: string
  secondaryCtaLabel: string
  servicesTitle: string
  servicesSubtitle?: string
  aboutEyebrow?: string
  aboutTitle: string
  aboutBody: string
  testimonialsTitle: string
  testimonialsSubtitle?: string
  faqTitle: string
  faqSubtitle?: string
  ctaBannerTitle: string
  ctaBannerSubtitle?: string
  ctaBannerTone?: 'primary' | 'subtle'
  feesTitle: string
  feesDisclaimer?: string
  contactTitle: string
  contactSubtitle?: string
  openingHoursTitle?: string
  locationTitle?: string
  /** Footer partner logos strip label. */
  partnersTitle?: string
}

export type CorePresets = TemplateDefinition['presets']

/**
 * Builds the six canonical pages (`home`, `a-propos`, `services`, `contact`,
 * `faq`, `tarifs`) for a template. The practitioner will edit this in
 * Payload — the preset is what sits in the database the moment they pick
 * the template at onboarding.
 */
export function buildCorePresets(skin: PresetSkin): CorePresets {
  const home: PagePreset = [
    {
      blockType: 'hero-split',
      data: {
        blockType: 'hero-split',
        ...(skin.heroBadge ? { badge: skin.heroBadge } : {}),
        title: skin.heroTitle,
        subtitle: skin.heroSubtitle,
        primaryCta: { label: skin.primaryCtaLabel, href: '/rendez-vous' },
        secondaryCta: { label: skin.secondaryCtaLabel, href: '/a-propos' },
        image: {
          url: placeholderPhotoUrl,
          alt: 'Portrait du praticien',
          width: 960,
          height: 1200,
        },
      },
    },
    {
      blockType: 'services-grid',
      data: {
        blockType: 'services-grid',
        title: skin.servicesTitle,
        ...(skin.servicesSubtitle ? { subtitle: skin.servicesSubtitle } : {}),
        services: standardServices,
        columns: 3,
      },
    },
    {
      blockType: 'about-hero',
      data: {
        blockType: 'about-hero',
        ...(skin.aboutEyebrow ? { eyebrow: skin.aboutEyebrow } : {}),
        title: skin.aboutTitle,
        body: skin.aboutBody,
        cta: { label: 'En savoir plus', href: '/a-propos' },
      },
    },
    {
      blockType: 'opening-hours',
      data: {
        blockType: 'opening-hours',
        ...(skin.openingHoursTitle ? { title: skin.openingHoursTitle } : {}),
        days: standardOpeningDays,
        phoneNumber: '01 23 45 67 89',
        phoneLabel: 'Secrétariat',
        emergencyNote:
          'En cas d’urgence vitale en dehors des horaires d’ouverture, composez le 15 (SAMU).',
      },
    },
    {
      blockType: 'testimonials-grid',
      data: {
        blockType: 'testimonials-grid',
        title: skin.testimonialsTitle,
        ...(skin.testimonialsSubtitle
          ? { subtitle: skin.testimonialsSubtitle }
          : {}),
        testimonials: standardTestimonials,
      },
    },
    {
      blockType: 'faq-accordion',
      data: {
        blockType: 'faq-accordion',
        title: skin.faqTitle,
        ...(skin.faqSubtitle ? { subtitle: skin.faqSubtitle } : {}),
        items: standardFaq.slice(0, 4),
      },
    },
    {
      blockType: 'cta-banner',
      data: {
        blockType: 'cta-banner',
        title: skin.ctaBannerTitle,
        ...(skin.ctaBannerSubtitle ? { subtitle: skin.ctaBannerSubtitle } : {}),
        primaryCta: { label: skin.primaryCtaLabel, href: '/rendez-vous' },
        secondaryCta: { label: 'Nous contacter', href: '/contact' },
        tone: skin.ctaBannerTone ?? 'primary',
      },
    },
    {
      blockType: 'location-map',
      data: {
        blockType: 'location-map',
        ...(skin.locationTitle ? { title: skin.locationTitle } : {}),
        ...standardAddress,
        transports: wrap(standardAddress.transports),
      },
    },
  ]

  const about: PagePreset = [
    {
      blockType: 'about-hero',
      data: {
        blockType: 'about-hero',
        ...(skin.aboutEyebrow ? { eyebrow: skin.aboutEyebrow } : {}),
        title: skin.aboutTitle,
        body: skin.aboutBody,
        image: {
          url: placeholderCabinetUrl,
          alt: 'Intérieur du cabinet',
          width: 1200,
          height: 1500,
        },
      },
    },
    {
      blockType: 'practitioner-card',
      data: {
        blockType: 'practitioner-card',
        civility: 'Dr.',
        firstName: 'Prénom',
        lastName: 'Nom',
        specialty: 'Médecine générale',
        bio: skin.aboutBody,
        photo: {
          url: placeholderPhotoUrl,
          alt: 'Portrait du praticien',
          width: 640,
          height: 800,
        },
        rppsLabel: 'RPPS 10000000000',
        credentials: wrap(standardCredentials),
        languages: wrap(standardLanguages),
        consultationFormats: wrap(['Présentiel', 'Téléconsultation']),
      },
    },
    ...(skin.partnersTitle
      ? [
          {
            blockType: 'partner-logos',
            data: {
              blockType: 'partner-logos',
              title: skin.partnersTitle,
              logos: [
                { name: 'Ordre des médecins' },
                { name: 'ARS Île-de-France' },
                { name: 'MGEN' },
                { name: 'Harmonie Mutuelle' },
              ],
            },
          },
        ]
      : []),
  ]

  const services: PagePreset = [
    {
      blockType: 'about-hero',
      data: {
        blockType: 'about-hero',
        eyebrow: 'Nos actes',
        title: skin.servicesTitle,
        body:
          skin.servicesSubtitle ??
          'Retrouvez ci-dessous les principaux actes pratiqués au cabinet. Chaque consultation est adaptée à votre situation.',
      },
    },
    {
      blockType: 'services-grid',
      data: {
        blockType: 'services-grid',
        title: 'Actes pratiqués',
        services: standardServices,
        columns: 3,
      },
    },
    {
      blockType: 'cta-banner',
      data: {
        blockType: 'cta-banner',
        title: skin.ctaBannerTitle,
        primaryCta: { label: skin.primaryCtaLabel, href: '/rendez-vous' },
        tone: skin.ctaBannerTone ?? 'primary',
      },
    },
  ]

  const contact: PagePreset = [
    {
      blockType: 'about-hero',
      data: {
        blockType: 'about-hero',
        eyebrow: 'Contact',
        title: skin.contactTitle,
        body:
          skin.contactSubtitle ??
          'Vous pouvez nous joindre par téléphone, email ou via le formulaire ci-dessous. Réponse sous 48 h ouvrées.',
      },
    },
    {
      blockType: 'opening-hours',
      data: {
        blockType: 'opening-hours',
        title: skin.openingHoursTitle ?? 'Horaires du cabinet',
        days: standardOpeningDays,
        phoneNumber: '01 23 45 67 89',
        phoneLabel: 'Secrétariat',
      },
    },
    {
      blockType: 'location-map',
      data: {
        blockType: 'location-map',
        title: skin.locationTitle ?? 'Adresse du cabinet',
        ...standardAddress,
        transports: wrap(standardAddress.transports),
      },
    },
    {
      blockType: 'contact-form',
      data: {
        blockType: 'contact-form',
        title: 'Nous écrire',
        subtitle:
          'Pour toute demande non urgente — prise de rendez-vous, informations pratiques.',
        actionUrl: '/contact',
        motifs: wrap([
          'Prise de rendez-vous',
          'Renseignement administratif',
          'Question médicale non urgente',
          'Autre',
        ]),
        legalNotice: standardLegalNotice,
      },
    },
  ]

  const faq: PagePreset = [
    {
      blockType: 'about-hero',
      data: {
        blockType: 'about-hero',
        eyebrow: 'Foire aux questions',
        title: skin.faqTitle,
        body:
          skin.faqSubtitle ??
          'Les questions que nous recevons le plus souvent. Si vous ne trouvez pas la réponse, n’hésitez pas à nous contacter.',
      },
    },
    {
      blockType: 'faq-accordion',
      data: {
        blockType: 'faq-accordion',
        title: skin.faqTitle,
        items: standardFaq,
      },
    },
    {
      blockType: 'cta-banner',
      data: {
        blockType: 'cta-banner',
        title: skin.ctaBannerTitle,
        primaryCta: { label: skin.primaryCtaLabel, href: '/rendez-vous' },
        tone: 'subtle',
      },
    },
  ]

  const tarifs: PagePreset = [
    {
      blockType: 'about-hero',
      data: {
        blockType: 'about-hero',
        eyebrow: 'Tarifs',
        title: skin.feesTitle,
        body:
          skin.feesDisclaimer ??
          'Les tarifs indiqués sont ceux pratiqués au cabinet. Une partie est prise en charge par l’Assurance maladie selon votre régime.',
      },
    },
    {
      blockType: 'fee-pricing',
      data: {
        blockType: 'fee-pricing',
        title: 'Tarifs des actes',
        fees: standardFees,
        disclaimer:
          'Tarifs donnés à titre indicatif, susceptibles d’évoluer. Merci de vérifier votre couverture complémentaire auprès de votre mutuelle.',
      },
    },
  ]

  return {
    home,
    'a-propos': about,
    services,
    contact,
    faq,
    tarifs,
  }
}
