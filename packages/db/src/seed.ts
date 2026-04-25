/**
 * Development seed — creates 3 realistic tenants covering the
 * specialist / paramedical / wellness segments.
 *
 * Run with: `pnpm db:seed`
 *
 * Idempotent: truncates all tenant-scoped tables before reseeding.
 * Safe in dev only — DO NOT run against production.
 */
import {
  buildPresetPages,
  registerBuiltInTemplates,
} from '@medsite/templates'
import { sql } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'

import { createDbClient } from './index'

registerBuiltInTemplates()
import {
  addresses,
  blogPosts,
  contactMessages,
  faqItems,
  media,
  openingHours,
  pages,
  plans,
  practitioners,
  services,
  siteSettings,
  tenants,
  testimonials,
} from './schema'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run the seed script')
}

if (process.env.NODE_ENV === 'production') {
  throw new Error('Refusing to run seed in production')
}

const db = createDbClient(databaseUrl)

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────

function newId(): string {
  return uuidv7()
}

/**
 * Materialises a template's preset pages for a tenant. Each preset becomes
 * one published `pages` row with its sections in the `content` jsonb field
 * — directly renderable by `apps/web`'s `SectionRenderer` via `/p/<slug>`.
 */
async function seedPresetPages(tenantId: string, templateId: string) {
  const descriptors = buildPresetPages(templateId)
  await db.insert(pages).values(
    descriptors.map((d) => ({
      tenantId,
      title: d.title,
      slug: d.slug,
      pageType: d.pageType as never,
      content: d.content,
      isPublished: true,
      isDraft: false,
      publishedAt: new Date(),
      sortOrder: d.sortOrder,
    })),
  )
}

/** Standard Mon-Fri 9-18, closed weekends. */
function standardWeek(tenantId: string, addressId: string) {
  return Array.from({ length: 7 }, (_, day) => ({
    id: newId(),
    tenantId,
    addressId,
    dayOfWeek: day,
    openTime: day < 5 ? '09:00:00' : null,
    closeTime: day < 5 ? '18:00:00' : null,
    isClosed: day >= 5,
  }))
}

// ───────────────────────────────────────────────────────────────────
// Plans (system)
// ───────────────────────────────────────────────────────────────────

async function seedPlans() {
  const essentialId = newId()
  const proId = newId()
  const premiumId = newId()

  await db.insert(plans).values([
    {
      id: essentialId,
      name: 'essential',
      displayName: 'Essentiel',
      priceMonthly: '29.00',
      setupFee: '0',
      maxPages: 5,
      features: { blog: false, reviews: false, seoScore: false, multiAddress: false },
      isActive: true,
    },
    {
      id: proId,
      name: 'pro',
      displayName: 'Pro',
      priceMonthly: '59.00',
      setupFee: '0',
      maxPages: 15,
      features: { blog: true, reviews: true, seoScore: true, multiAddress: false },
      isActive: true,
    },
    {
      id: premiumId,
      name: 'premium',
      displayName: 'Premium',
      priceMonthly: '99.00',
      setupFee: '0',
      maxPages: 50,
      features: { blog: true, reviews: true, seoScore: true, multiAddress: true },
      isActive: true,
    },
  ])

  return { essentialId, proId, premiumId }
}

// ───────────────────────────────────────────────────────────────────
// Tenant 1 — Dr. Sophie Martin, dermatologue, Lyon (with Doctolib)
// ───────────────────────────────────────────────────────────────────

async function seedDrMartin(proPlanId: string) {
  const tenantId = newId()
  const practitionerId = newId()
  const addressId = newId()

  await db.insert(tenants).values({
    id: tenantId,
    name: 'Dr. Sophie Martin',
    slug: 'dr-sophie-martin',
    planId: proPlanId,
    status: 'active',
    onboardingStep: 5,
  })

  await db.insert(practitioners).values({
    id: practitionerId,
    tenantId,
    firstName: 'Sophie',
    lastName: 'Martin',
    title: 'Dr',
    specialty: 'Dermatologue',
    specialtySlug: 'dermatologue',
    schemaOrgType: 'Physician',
    adeliRpps: '10003456789',
    bio: "Diplômée de l'Université Claude Bernard Lyon 1, le Dr. Sophie Martin exerce la dermatologie depuis 15 ans. Elle est spécialisée dans le dépistage du mélanome et la dermatologie esthétique.",
    email: 'contact@dr-sophie-martin.fr',
    phoneNumber: '+33 4 78 00 00 01',
    doctolibUrl: 'https://www.doctolib.fr/dermatologue/lyon/sophie-martin',
    doctolibSlug: 'sophie-martin',
    bookingMode: 'doctolib',
    ctaLabel: 'Prendre rendez-vous sur Doctolib',
    showDoctolibWidget: true,
  })

  await db.insert(addresses).values({
    id: addressId,
    tenantId,
    practitionerId,
    label: 'Cabinet principal',
    streetAddress: '12 rue Édouard Herriot',
    postalCode: '69002',
    city: 'Lyon',
    latitude: '45.7640000',
    longitude: '4.8357000',
    isPrimary: true,
  })

  await db.insert(openingHours).values(standardWeek(tenantId, addressId))

  await db.insert(services).values([
    {
      tenantId,
      title: 'Consultation de dermatologie générale',
      slug: 'consultation-dermatologie-generale',
      shortDescription: 'Examen complet de la peau, diagnostic et prise en charge des pathologies cutanées courantes.',
      duration: 30,
      priceMin: '60.00',
      priceMax: '60.00',
      showPrice: true,
      category: 'Consultations',
      doctolibMotifSlug: 'consultation-dermatologie',
      sortOrder: 1,
    },
    {
      tenantId,
      title: 'Dépistage du mélanome',
      slug: 'depistage-melanome',
      shortDescription: 'Cartographie des grains de beauté par dermoscopie numérique et suivi annuel.',
      duration: 45,
      priceMin: '90.00',
      priceMax: '90.00',
      showPrice: true,
      category: 'Dépistage',
      doctolibMotifSlug: 'depistage-melanome',
      sortOrder: 2,
    },
    {
      tenantId,
      title: 'Dermatologie esthétique',
      slug: 'dermatologie-esthetique',
      shortDescription: 'Peelings, injections, laser — soins esthétiques réalisés par un dermatologue.',
      duration: 60,
      priceMin: '150.00',
      priceMax: '400.00',
      showPrice: false,
      category: 'Esthétique',
      sortOrder: 3,
    },
  ])

  await seedPresetPages(tenantId, 'medical-classic')

  await db.insert(faqItems).values([
    {
      tenantId,
      question: 'Faut-il une ordonnance pour consulter ?',
      answer: "Non, vous pouvez consulter directement sans passer par votre médecin traitant. Toutefois, dans le parcours de soins coordonnés, une consultation avec votre médecin traitant au préalable vous permet d'être mieux remboursé.",
      sortOrder: 0,
    },
    {
      tenantId,
      question: 'Le cabinet pratique-t-il le tiers payant ?',
      answer: 'Oui, le tiers payant est pratiqué sur la part obligatoire. La part complémentaire reste à votre charge sauf convention avec votre mutuelle.',
      sortOrder: 1,
    },
  ])

  await db.insert(testimonials).values([
    {
      tenantId,
      authorName: 'Claire D.',
      authorInitials: 'CD',
      content: 'Dr. Martin est très professionnelle et rassurante. Le dépistage de mélanome est fait avec soin, je recommande vivement.',
      rating: 5,
      source: 'manual',
      consentGiven: true,
      publishedAt: new Date(),
    },
  ])

  await db.insert(siteSettings).values({
    tenantId,
    templateId: 'medical-classic',
    primaryColor: '#0F766E',
    secondaryColor: '#E0F2F1',
    fontHeading: 'Source Serif Pro',
    fontBody: 'Inter',
    googleBusinessUrl: 'https://g.page/dr-sophie-martin-lyon',
  })
}

// ───────────────────────────────────────────────────────────────────
// Tenant 2 — Cabinet Dupont Kinésithérapie, Aurillac (with Doctolib)
// ───────────────────────────────────────────────────────────────────

async function seedCabinetDupont(essentialPlanId: string) {
  const tenantId = newId()
  const practitionerId = newId()
  const addressId = newId()

  await db.insert(tenants).values({
    id: tenantId,
    name: 'Cabinet Dupont Kinésithérapie',
    slug: 'cabinet-dupont',
    planId: essentialPlanId,
    status: 'active',
    onboardingStep: 5,
  })

  await db.insert(practitioners).values({
    id: practitionerId,
    tenantId,
    firstName: 'Julien',
    lastName: 'Dupont',
    title: 'M.',
    specialty: 'Masseur-kinésithérapeute',
    specialtySlug: 'masseur-kinesitherapeute',
    schemaOrgType: 'Physiotherapy',
    adeliRpps: '15007865432',
    bio: 'Kinésithérapeute diplômé d\'État depuis 10 ans, Julien Dupont accompagne sportifs et patients dans leur rééducation avec une approche manuelle et personnalisée.',
    email: 'contact@cabinet-dupont.fr',
    phoneNumber: '+33 4 71 00 00 02',
    doctolibUrl: 'https://www.doctolib.fr/masseur-kinesitherapeute/aurillac/julien-dupont',
    doctolibSlug: 'julien-dupont',
    bookingMode: 'doctolib',
    ctaLabel: 'Réserver un créneau sur Doctolib',
    showDoctolibWidget: true,
  })

  await db.insert(addresses).values({
    id: addressId,
    tenantId,
    practitionerId,
    label: 'Cabinet',
    streetAddress: '4 avenue de la République',
    postalCode: '15000',
    city: 'Aurillac',
    latitude: '44.9260000',
    longitude: '2.4450000',
    isPrimary: true,
  })

  await db.insert(openingHours).values(standardWeek(tenantId, addressId))

  await db.insert(services).values([
    {
      tenantId,
      title: 'Rééducation post-opératoire',
      slug: 'reeducation-post-operatoire',
      shortDescription: 'Récupération fonctionnelle après chirurgie orthopédique, ligamentaire ou articulaire.',
      duration: 45,
      priceMin: '35.00',
      showPrice: false,
      category: 'Rééducation',
      sortOrder: 1,
    },
    {
      tenantId,
      title: 'Kinésithérapie du sport',
      slug: 'kinesitherapie-du-sport',
      shortDescription: 'Prévention et traitement des traumatismes sportifs, renforcement ciblé, reprise progressive.',
      duration: 45,
      priceMin: '35.00',
      showPrice: false,
      category: 'Sport',
      sortOrder: 2,
    },
    {
      tenantId,
      title: 'Thérapie manuelle',
      slug: 'therapie-manuelle',
      shortDescription: 'Techniques de mobilisation articulaire et tissulaire pour soulager douleurs et raideurs.',
      duration: 30,
      priceMin: '35.00',
      showPrice: false,
      category: 'Manuel',
      sortOrder: 3,
    },
    {
      tenantId,
      title: 'Rééducation respiratoire',
      slug: 'reeducation-respiratoire',
      shortDescription: 'Prise en charge des pathologies respiratoires chroniques et post-bronchiolite.',
      duration: 30,
      priceMin: '35.00',
      showPrice: false,
      category: 'Rééducation',
      sortOrder: 4,
    },
  ])

  await seedPresetPages(tenantId, 'family-practice')

  await db.insert(faqItems).values([
    {
      tenantId,
      question: 'Faut-il une prescription médicale ?',
      answer: "Oui, une prescription médicale est nécessaire pour que vos séances soient remboursées par l'Assurance Maladie.",
      sortOrder: 0,
    },
    {
      tenantId,
      question: 'Combien de séances prévoir ?',
      answer: 'Le nombre de séances dépend de votre pathologie. Nous établissons un bilan lors de la première séance pour définir un plan de soin adapté.',
      sortOrder: 1,
    },
    {
      tenantId,
      question: 'Le cabinet reçoit-il les enfants ?',
      answer: 'Oui, nous recevons les enfants à partir de 6 mois (rééducation respiratoire) et tous âges pour les autres soins.',
      sortOrder: 2,
    },
  ])

  await db.insert(testimonials).values([
    {
      tenantId,
      authorName: 'Marc P.',
      authorInitials: 'MP',
      content: "Julien m'a suivi après ma rupture des ligaments croisés. Rééducation progressive et efficace, je suis de nouveau sur les pistes !",
      rating: 5,
      source: 'manual',
      consentGiven: true,
      publishedAt: new Date(),
    },
    {
      tenantId,
      authorName: 'Sandrine L.',
      authorInitials: 'SL',
      content: 'Très à l\'écoute, explique bien et prend le temps nécessaire. Je recommande vraiment.',
      rating: 5,
      source: 'manual',
      consentGiven: true,
      publishedAt: new Date(),
    },
  ])

  await db.insert(siteSettings).values({
    tenantId,
    templateId: 'family-practice',
    primaryColor: '#1E40AF',
    secondaryColor: '#DBEAFE',
    fontHeading: 'Inter',
    fontBody: 'Inter',
  })
}

// ───────────────────────────────────────────────────────────────────
// Tenant 3 — Émilie Rousseau, sophrologue, Clermont (no Doctolib)
// ───────────────────────────────────────────────────────────────────

async function seedEmilieRousseau(essentialPlanId: string) {
  const tenantId = newId()
  const practitionerId = newId()
  const addressId = newId()

  await db.insert(tenants).values({
    id: tenantId,
    name: 'Émilie Rousseau Sophrologie',
    slug: 'emilie-rousseau',
    planId: essentialPlanId,
    status: 'trial',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    onboardingStep: 4,
  })

  await db.insert(practitioners).values({
    id: practitionerId,
    tenantId,
    firstName: 'Émilie',
    lastName: 'Rousseau',
    title: 'Mme',
    specialty: 'Sophrologue',
    specialtySlug: 'sophrologue',
    schemaOrgType: 'HealthAndBeautyBusiness',
    bio: "Sophrologue certifiée RNCP, Émilie accompagne adultes et adolescents dans la gestion du stress, la préparation mentale, le sommeil et la confiance en soi. Approche douce et bienveillante, en cabinet ou en visio.",
    email: 'contact@emilie-rousseau-sophrologie.fr',
    phoneNumber: '+33 4 73 00 00 03',
    // Pas de Doctolib pour les sophrologues — fallback contact form
    bookingMode: 'contact',
    ctaLabel: 'Me contacter pour un rendez-vous',
    showDoctolibWidget: false,
  })

  await db.insert(addresses).values({
    id: addressId,
    tenantId,
    practitionerId,
    label: 'Cabinet',
    streetAddress: '18 rue Blatin',
    postalCode: '63000',
    city: 'Clermont-Ferrand',
    latitude: '45.7770000',
    longitude: '3.0870000',
    isPrimary: true,
  })

  // Sophrologue often works Tue-Sat afternoons
  await db.insert(openingHours).values(
    Array.from({ length: 7 }, (_, day) => ({
      id: newId(),
      tenantId,
      addressId,
      dayOfWeek: day,
      openTime: day >= 1 && day <= 5 ? '14:00:00' : null,
      closeTime: day >= 1 && day <= 5 ? '20:00:00' : null,
      isClosed: day === 0 || day === 6,
    })),
  )

  await db.insert(services).values([
    {
      tenantId,
      title: 'Séance de sophrologie individuelle',
      slug: 'seance-individuelle',
      shortDescription: 'Séance sur mesure : relaxation dynamique, visualisations positives, respiration consciente.',
      duration: 60,
      priceMin: '55.00',
      priceMax: '55.00',
      showPrice: true,
      category: 'Séances',
      sortOrder: 1,
    },
    {
      tenantId,
      title: 'Préparation aux examens',
      slug: 'preparation-examens',
      shortDescription: 'Programme de 5 séances pour lycéens et étudiants : gestion du stress, concentration, sommeil.',
      duration: 60,
      priceMin: '250.00',
      priceMax: '250.00',
      showPrice: true,
      category: 'Programmes',
      sortOrder: 2,
    },
    {
      tenantId,
      title: 'Accompagnement grossesse',
      slug: 'accompagnement-grossesse',
      shortDescription: 'Préparation à la naissance en douceur : respiration, relaxation, visualisation de l\'accouchement.',
      duration: 60,
      priceMin: '55.00',
      priceMax: '55.00',
      showPrice: true,
      category: 'Programmes',
      sortOrder: 3,
    },
  ])

  await seedPresetPages(tenantId, 'warm-wellness')

  await db.insert(faqItems).values([
    {
      tenantId,
      question: "Qu'est-ce que la sophrologie ?",
      answer: "La sophrologie est une méthode psycho-corporelle qui combine relaxation, respiration et visualisation positive. Elle vise à mieux gérer le stress, les émotions et à renforcer la confiance en soi.",
      sortOrder: 0,
    },
    {
      tenantId,
      question: "Combien de séances sont nécessaires ?",
      answer: "Un accompagnement se fait généralement sur 5 à 10 séances selon l'objectif. Nous définissons ensemble le rythme et le nombre lors de la première séance.",
      sortOrder: 1,
    },
  ])

  await db.insert(testimonials).values([
    {
      tenantId,
      authorName: 'Julie M.',
      authorInitials: 'JM',
      content: "Émilie m'a accompagnée pendant ma grossesse puis pour la préparation à l'accouchement. Un vrai cocon de douceur, je la recommande chaleureusement.",
      rating: 5,
      source: 'manual',
      consentGiven: true,
      publishedAt: new Date(),
    },
  ])

  await db.insert(siteSettings).values({
    tenantId,
    templateId: 'warm-wellness',
    primaryColor: '#B45309',
    secondaryColor: '#FEF3C7',
    fontHeading: 'Source Serif Pro',
    fontBody: 'Inter',
  })
}

// ───────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────

async function main() {
  console.warn('[seed] truncating tables…')

  // Truncate in reverse dependency order; CASCADE handles FKs.
  await db.execute(sql`
    TRUNCATE TABLE
      ${media},
      ${contactMessages},
      ${testimonials},
      ${faqItems},
      ${blogPosts},
      ${pages},
      ${services},
      ${openingHours},
      ${addresses},
      ${practitioners},
      ${siteSettings},
      ${tenants},
      ${plans}
    RESTART IDENTITY CASCADE
  `)

  console.warn('[seed] inserting plans…')
  const { essentialId, proId } = await seedPlans()

  console.warn('[seed] inserting Dr. Sophie Martin (dermatologue, Lyon)…')
  await seedDrMartin(proId)

  console.warn('[seed] inserting Cabinet Dupont (kinésithérapie, Aurillac)…')
  await seedCabinetDupont(essentialId)

  console.warn('[seed] inserting Émilie Rousseau (sophrologue, Clermont)…')
  await seedEmilieRousseau(essentialId)

  console.warn('[seed] done ✓')
  process.exit(0)
}

main().catch((error) => {
  console.error('[seed] failed:', error)
  process.exit(1)
})
