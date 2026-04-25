/**
 * Generic French medical practice placeholder content. Every preset picks
 * from here so the 5 templates stay synchronised on structure while their
 * theme-specific wording lives in the individual preset files.
 *
 * All text is intentionally "lorem-medical" — it should be replaced by the
 * practitioner at onboarding. Visible copy shipped to real tenants is
 * authored in Payload and overrides everything here.
 */

export const placeholderPhotoUrl =
  'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&auto=format&fit=crop'

export const placeholderCabinetUrl =
  'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1600&auto=format&fit=crop'

export const standardServices = [
  {
    title: 'Consultation de médecine générale',
    description:
      'Prise en charge globale : motif du jour, suivi, renouvellement d’ordonnance, prévention.',
    durationLabel: '20 min',
    priceLabel: '25 €',
    iconInitial: 'C',
  },
  {
    title: 'Bilan de santé annuel',
    description:
      'Examen complet recommandé une fois par an pour anticiper et dépister.',
    durationLabel: '45 min',
    priceLabel: '60 €',
    iconInitial: 'B',
  },
  {
    title: 'Suivi de pathologie chronique',
    description:
      'Hypertension, diabète, troubles thyroïdiens — consultation dédiée, rythme adapté.',
    durationLabel: '30 min',
    priceLabel: '30 €',
    iconInitial: 'S',
  },
  {
    title: 'Vaccinations',
    description:
      'Mise à jour du calendrier vaccinal enfant, adulte, voyage.',
    durationLabel: '15 min',
    priceLabel: '25 €',
    iconInitial: 'V',
  },
  {
    title: 'Certificats médicaux',
    description:
      'Sport, scolaire, crèche — délivrés après examen clinique.',
    durationLabel: '15 min',
    priceLabel: '25 €',
    iconInitial: 'M',
  },
  {
    title: 'Téléconsultation',
    description:
      'Consultation à distance sécurisée pour les situations ne nécessitant pas d’examen physique.',
    durationLabel: '15 min',
    priceLabel: '25 €',
    iconInitial: 'T',
  },
]

export const standardFaq = [
  {
    question: 'Comment prendre rendez-vous ?',
    answer:
      'Le plus rapide est de passer par la plateforme de réservation en ligne via le bouton "Prendre rendez-vous". Pour les situations plus délicates, vous pouvez joindre le secrétariat aux horaires d’ouverture.',
  },
  {
    question: 'Êtes-vous conventionné·e ?',
    answer:
      'Oui, le cabinet est conventionné secteur 1 : les tarifs correspondent à la base de remboursement de la Sécurité sociale, sans dépassement d’honoraires.',
  },
  {
    question: 'Acceptez-vous les nouveaux patients ?',
    answer:
      'Oui, de nouveaux patients peuvent être accueillis dans la limite des créneaux disponibles. Merci de privilégier la prise de rendez-vous en ligne.',
  },
  {
    question: 'Que faire en cas d’urgence ?',
    answer:
      'En dehors des horaires d’ouverture, appelez le 15 (SAMU) ou le 112. Le cabinet n’assure pas de permanence téléphonique nocturne.',
  },
  {
    question: 'Les téléconsultations sont-elles remboursées ?',
    answer:
      'Oui, au même titre qu’une consultation présentielle. Elles sont proposées pour les motifs ne nécessitant pas d’examen physique.',
  },
]

export const standardTestimonials = [
  {
    authorName: 'Marie D.',
    content:
      'À l’écoute, précis·e et rassurant·e. J’apprécie particulièrement la disponibilité et la ponctualité.',
    rating: 5,
    dateLabel: 'Janvier 2026',
    source: 'Google',
  },
  {
    authorName: 'Jean-Paul L.',
    content:
      'Un suivi de qualité, des explications claires et une prise en charge rapide. Je recommande.',
    rating: 5,
    dateLabel: 'Décembre 2025',
    source: 'Doctolib',
  },
  {
    authorName: 'Sophie M.',
    content:
      'Cabinet accessible, sans attente excessive. Équipe agréable. Diagnostic posé rapidement.',
    rating: 4,
    dateLabel: 'Novembre 2025',
  },
]

export const standardFees = [
  {
    actLabel: 'Consultation standard',
    durationLabel: '20 min',
    tarifSecu: '25 €',
    tarifCabinet: '25 €',
    conventionLabel: 'Secteur 1',
  },
  {
    actLabel: 'Bilan de santé annuel',
    durationLabel: '45 min',
    tarifSecu: '25 €',
    tarifCabinet: '60 €',
    conventionLabel: 'Secteur 1 — dépassement autorisé',
    note: 'Examen approfondi non pris en charge intégralement.',
  },
  {
    actLabel: 'Téléconsultation',
    durationLabel: '15 min',
    tarifSecu: '25 €',
    tarifCabinet: '25 €',
    conventionLabel: 'Secteur 1',
  },
  {
    actLabel: 'Certificat médical',
    durationLabel: '15 min',
    tarifCabinet: '25 €',
  },
]

export const standardOpeningDays = [
  { dayLabel: 'Lundi', ranges: [{ open: '09:00', close: '12:30' }, { open: '14:00', close: '19:00' }] },
  { dayLabel: 'Mardi', ranges: [{ open: '09:00', close: '12:30' }, { open: '14:00', close: '19:00' }] },
  { dayLabel: 'Mercredi', ranges: [{ open: '09:00', close: '13:00' }] },
  { dayLabel: 'Jeudi', ranges: [{ open: '09:00', close: '12:30' }, { open: '14:00', close: '19:00' }] },
  { dayLabel: 'Vendredi', ranges: [{ open: '09:00', close: '12:30' }, { open: '14:00', close: '18:00' }] },
  { dayLabel: 'Samedi', ranges: [{ open: '09:00', close: '12:00' }] },
  { dayLabel: 'Dimanche', isClosed: true },
]

export const standardAddress = {
  streetAddress: '12 rue de la République',
  postalCode: '75001',
  city: 'Paris',
  country: 'France',
  latitude: 48.8566,
  longitude: 2.3522,
  transports: [
    'Métro ligne 1 — station Châtelet (3 min à pied)',
    'Bus 21, 27, 81 — arrêt Pont Neuf',
  ],
  parking: 'Parking public Saint-Eustache à 200 m. Stationnement vélo devant le cabinet.',
  accessibilityNote:
    'Cabinet accessible aux personnes à mobilité réduite — ascenseur et porte d’entrée large.',
}

export const standardCredentials = [
  'Doctorat en médecine — Université Paris Cité, 2012',
  'DES de médecine générale — 2015',
  'DU d’échographie clinique — 2018',
]

export const standardLanguages = ['Français', 'Anglais']

export const standardLegalNotice =
  'Les données transmises via ce formulaire sont utilisées uniquement pour répondre à votre demande. Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et d’effacement.'
