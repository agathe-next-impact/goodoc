import type {
  BlogPostSEOData,
  FaqItemSEOData,
  ServiceSEOData,
  TenantSEOData,
} from '../types'

// --- Segment 1: Specialist (cardiologue) ---
export const specialistTenant: TenantSEOData = {
  siteUrl: 'https://dr-martin.medsite.fr',
  practitioner: {
    firstName: 'Jean',
    lastName: 'Martin',
    title: 'Dr',
    specialty: 'Cardiologue',
    specialtySlug: 'cardiologue',
    businessName: 'Cabinet de Cardiologie Dr Martin',
    bio: 'Le Dr Jean Martin est cardiologue à Paris, spécialisé dans la prévention cardiovasculaire et le suivi des pathologies cardiaques. Diplômé de la faculté de médecine Paris-Descartes.',
    photoUrl: 'https://media.medsite.fr/dr-martin/photo.jpg',
    phoneNumber: '01 42 00 00 00',
    email: 'contact@dr-martin.fr',
    doctolibUrl: 'https://www.doctolib.fr/cardiologue/paris/jean-martin',
    credentials: [
      { name: 'Diplôme de Cardiologie', issuedBy: 'Université Paris-Descartes', identifier: 'ADELI-123456' },
    ],
    alumniOf: ['Université Paris-Descartes'],
    knowsAbout: ['Cardiologie interventionnelle', 'Échocardiographie', 'Prévention cardiovasculaire'],
    memberOf: ['Société Française de Cardiologie'],
  },
  address: {
    streetAddress: '15 Rue de la Santé',
    city: 'Paris',
    postalCode: '75013',
    country: 'FR',
    latitude: '48.8356',
    longitude: '2.3411',
  },
  openingHours: [
    { dayOfWeek: 0, openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 4, openTime: '09:00', closeTime: '13:00', isClosed: false },
    { dayOfWeek: 5, openTime: null, closeTime: null, isClosed: true },
    { dayOfWeek: 6, openTime: null, closeTime: null, isClosed: true },
  ],
  socialLinks: {
    googleBusinessUrl: 'https://g.page/dr-martin-cardio',
    linkedinUrl: 'https://linkedin.com/in/dr-jean-martin',
  },
  reviewStats: { average: 4.8, count: 127 },
}

// --- Segment 2: Paramedical (kinésithérapeute) ---
export const paramedicalTenant: TenantSEOData = {
  siteUrl: 'https://kine-dupont.medsite.fr',
  practitioner: {
    firstName: 'Sophie',
    lastName: 'Dupont',
    specialty: 'Kinésithérapeute',
    specialtySlug: 'kinesitherapeute',
    businessName: 'Cabinet de Kinésithérapie Dupont',
    bio: 'Sophie Dupont est kinésithérapeute à Lyon, spécialisée en rééducation sportive et post-opératoire.',
    phoneNumber: '04 72 00 00 00',
    email: 'contact@kine-dupont.fr',
  },
  address: {
    streetAddress: '8 Rue Mercière',
    city: 'Lyon',
    postalCode: '69002',
    country: 'FR',
  },
  openingHours: [
    { dayOfWeek: 0, openTime: '08:00', closeTime: '19:00', isClosed: false },
    { dayOfWeek: 1, openTime: '08:00', closeTime: '19:00', isClosed: false },
    { dayOfWeek: 2, openTime: '08:00', closeTime: '19:00', isClosed: false },
    { dayOfWeek: 3, openTime: '08:00', closeTime: '19:00', isClosed: false },
    { dayOfWeek: 4, openTime: '08:00', closeTime: '12:00', isClosed: false },
    { dayOfWeek: 5, openTime: null, closeTime: null, isClosed: true },
    { dayOfWeek: 6, openTime: null, closeTime: null, isClosed: true },
  ],
  socialLinks: {
    instagramUrl: 'https://instagram.com/kine_dupont',
  },
}

// --- Segment 3: Bien-être (sophrologue) ---
export const wellnessTenant: TenantSEOData = {
  siteUrl: 'https://sophro-leroy.medsite.fr',
  practitioner: {
    firstName: 'Marie',
    lastName: 'Leroy',
    specialty: 'Sophrologue',
    specialtySlug: 'sophrologue',
    businessName: 'Cabinet de Sophrologie Marie Leroy',
    phoneNumber: '06 12 34 56 78',
  },
  address: {
    streetAddress: '3 Place du Capitole',
    city: 'Toulouse',
    postalCode: '31000',
    country: 'FR',
    latitude: '43.6047',
    longitude: '1.4442',
  },
  openingHours: [
    { dayOfWeek: 0, openTime: '10:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 1, openTime: '10:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 2, openTime: '10:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 3, openTime: '10:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 4, openTime: null, closeTime: null, isClosed: true },
    { dayOfWeek: 5, openTime: null, closeTime: null, isClosed: true },
    { dayOfWeek: 6, openTime: null, closeTime: null, isClosed: true },
  ],
  socialLinks: {},
}

// --- Service fixtures ---
export const serviceWithPrice: ServiceSEOData = {
  title: 'Échocardiographie',
  slug: 'echocardiographie',
  shortDescription: 'Examen d\'imagerie cardiaque par ultrasons pour évaluer la structure et la fonction du cœur.',
  procedureType: 'DiagnosticProcedure',
  priceMin: '80',
  priceMax: '120',
  showPrice: true,
  duration: 30,
  imageUrl: 'https://media.medsite.fr/dr-martin/echo.jpg',
}

export const serviceNoPrice: ServiceSEOData = {
  title: 'Rééducation sportive',
  slug: 'reeducation-sportive',
  shortDescription: 'Prise en charge des blessures sportives et rééducation post-traumatique.',
  showPrice: false,
  duration: 45,
}

// --- Blog fixture ---
export const blogPost: BlogPostSEOData = {
  title: 'Quand consulter un cardiologue ?',
  slug: 'quand-consulter-un-cardiologue',
  excerpt: 'Découvrez les signes qui doivent vous amener à consulter un cardiologue.',
  coverImageUrl: 'https://media.medsite.fr/dr-martin/blog-cardio.jpg',
  category: 'Prévention',
  tags: ['cardiologie', 'prévention', 'santé'],
  publishedAt: '2026-03-15T10:00:00Z',
  modifiedAt: '2026-04-01T14:30:00Z',
}

export const blogPostMinimal: BlogPostSEOData = {
  title: 'Les bienfaits de la sophrologie',
  slug: 'bienfaits-sophrologie',
  publishedAt: '2026-02-10T08:00:00Z',
}

// --- FAQ fixture ---
export const faqItems: FaqItemSEOData[] = [
  {
    question: 'Faut-il une ordonnance pour consulter ?',
    answer: 'Non, vous pouvez prendre rendez-vous directement sans ordonnance.',
  },
  {
    question: 'Les consultations sont-elles remboursées ?',
    answer: 'Les consultations sont prises en charge par l\'Assurance Maladie et votre mutuelle.',
  },
  {
    question: 'Combien de temps dure une consultation ?',
    answer: 'Une consultation dure environ 30 minutes.',
  },
]
