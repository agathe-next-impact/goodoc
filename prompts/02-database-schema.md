# Prompt 02 — Schéma de base de données multi-tenant

## Contexte
Le monorepo est initialisé. Tu travailles dans `packages/db/`. L'architecture est multi-tenant à base de données partagée avec isolation par `tenantId` + PostgreSQL Row-Level Security (RLS).

## Objectif
Créer le schéma Drizzle ORM complet, les migrations, les politiques RLS, et le seed de développement.

## Instructions

### 1. Schema Drizzle (`packages/db/schema/`)

Créer les tables suivantes. Toutes les tables (sauf `tenants`, `plans`, `system_*`) ont un champ `tenantId` UUID NOT NULL référençant `tenants.id`.

#### tenants
```typescript
// Le praticien / cabinet — entité racine du multi-tenant
{
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),  // sous-domaine
  customDomain: varchar('custom_domain', { length: 255 }).unique(),
  domainVerified: boolean('domain_verified').default(false),
  planId: uuid('plan_id').references(() => plans.id),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  status: statusEnum('status').default('trial'),  // trial | active | suspended | cancelled
  trialEndsAt: timestamp('trial_ends_at'),
  onboardingStep: integer('onboarding_step').default(1),  // 1-5
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}
```

#### practitioners (1 per tenant, extensible for multi-practitioner cabinets later)
```typescript
{
  id: uuid,
  tenantId: uuid → tenants.id,
  firstName: varchar(100),
  lastName: varchar(100),
  title: varchar(50),          // Dr, Mme, M.
  specialty: varchar(100),     // Ostéopathe, Dermatologue, Sophrologue...
  specialtySlug: varchar(100), // auto-generated kebab-case
  schemaOrgType: varchar(100), // MedicalBusiness, Physician, Physiotherapy, Dentist...
  adeliRpps: varchar(20),
  bio: text,
  photoUrl: varchar(500),
  phoneNumber: varchar(20),
  email: varchar(255),
  // Doctolib integration
  doctolibUrl: varchar(500),
  doctolibSlug: varchar(200),  // extracted automatically
  alternativeBookingUrl: varchar(500),
  bookingMode: bookingModeEnum, // 'doctolib' | 'alternative' | 'contact'
  ctaLabel: varchar(100),
  showDoctolibWidget: boolean().default(true),
  createdAt, updatedAt,
}
```

#### addresses
```typescript
{
  id: uuid,
  tenantId: uuid,
  practitionerId: uuid → practitioners.id,
  label: varchar(100),        // "Cabinet principal", "Cabinet secondaire"
  streetAddress: varchar(255),
  postalCode: varchar(10),
  city: varchar(100),
  country: varchar(2).default('FR'),
  latitude: decimal(10, 7),
  longitude: decimal(10, 7),
  isPrimary: boolean().default(false),
  createdAt, updatedAt,
}
```

#### opening_hours
```typescript
{
  id: uuid,
  tenantId: uuid,
  addressId: uuid → addresses.id,
  dayOfWeek: integer(),       // 0=lundi, 6=dimanche
  openTime: time(),
  closeTime: time(),
  isClosed: boolean().default(false),
}
```

#### services (actes / prestations)
```typescript
{
  id: uuid,
  tenantId: uuid,
  title: varchar(200),
  slug: varchar(200),
  description: text,          // Rich text (Payload blocks JSON)
  shortDescription: varchar(500),
  duration: integer(),        // en minutes
  priceMin: decimal(8, 2),
  priceMax: decimal(8, 2),
  showPrice: boolean().default(false),
  category: varchar(100),
  imageUrl: varchar(500),
  doctolibMotifSlug: varchar(200),  // lien profond vers le bon motif Doctolib
  sortOrder: integer().default(0),
  isPublished: boolean().default(true),
  // SEO
  metaTitle: varchar(200),
  metaDescription: varchar(300),
  schemaOrgData: jsonb(),     // MedicalProcedure JSON-LD pré-calculé
  createdAt, updatedAt,
}
```

#### pages
```typescript
{
  id: uuid,
  tenantId: uuid,
  title: varchar(200),
  slug: varchar(200),         // 'accueil', 'a-propos', 'contact'...
  pageType: pageTypeEnum,     // 'home' | 'about' | 'contact' | 'services' | 'blog_index' | 'legal' | 'custom'
  content: jsonb(),           // Payload CMS blocks (Rich Text, images, CTA, FAQ, etc.)
  isPublished: boolean().default(false),
  isDraft: boolean().default(true),
  publishedAt: timestamp(),
  // SEO
  metaTitle: varchar(200),
  metaDescription: varchar(300),
  sortOrder: integer().default(0),
  createdAt, updatedAt,
}
```

#### blog_posts
```typescript
{
  id: uuid,
  tenantId: uuid,
  title: varchar(300),
  slug: varchar(300),
  excerpt: varchar(500),
  content: jsonb(),           // Payload blocks
  coverImageUrl: varchar(500),
  category: varchar(100),
  tags: text[],               // PostgreSQL array
  authorId: uuid → practitioners.id,
  isPublished: boolean().default(false),
  publishedAt: timestamp(),
  metaTitle: varchar(200),
  metaDescription: varchar(300),
  createdAt, updatedAt,
}
```

#### faq_items
```typescript
{
  id: uuid,
  tenantId: uuid,
  question: varchar(500),
  answer: text,
  sortOrder: integer().default(0),
  isPublished: boolean().default(true),
  createdAt, updatedAt,
}
```

#### testimonials
```typescript
{
  id: uuid,
  tenantId: uuid,
  authorName: varchar(100),
  authorInitials: varchar(5),
  content: text,
  rating: integer(),          // 1-5
  source: varchar(50),        // 'manual' | 'google'
  googleReviewId: varchar(255),
  consentGiven: boolean().default(false),
  isPublished: boolean().default(true),
  publishedAt: timestamp(),
  createdAt, updatedAt,
}
```

#### contact_messages
```typescript
{
  id: uuid,
  tenantId: uuid,
  senderName: varchar(200),
  senderEmail: varchar(255),
  senderPhone: varchar(20),
  subject: varchar(300),
  message: text,
  motif: varchar(100),        // motif de contact sélectionné
  status: messageStatusEnum,  // 'new' | 'read' | 'replied' | 'archived'
  repliedAt: timestamp(),
  createdAt,
}
```

#### site_settings
```typescript
{
  id: uuid,
  tenantId: uuid UNIQUE,     // 1:1 avec tenant
  templateId: varchar(50),    // 'specialist' | 'paramedical' | 'wellness'
  primaryColor: varchar(7),   // hex
  secondaryColor: varchar(7),
  fontHeading: varchar(100),
  fontBody: varchar(100),
  logoUrl: varchar(500),
  faviconUrl: varchar(500),
  // Social links
  googleBusinessUrl: varchar(500),
  facebookUrl: varchar(500),
  instagramUrl: varchar(500),
  linkedinUrl: varchar(500),
  // Analytics
  plausibleSiteId: varchar(100),
  googleAnalyticsId: varchar(20),
  // Legal
  legalMentions: text,
  privacyPolicy: text,
  cookieConsent: boolean().default(true),
  createdAt, updatedAt,
}
```

#### plans (table système, pas de tenantId)
```typescript
{
  id: uuid,
  name: varchar(50),          // 'essential' | 'pro' | 'premium'
  displayName: varchar(100),
  priceMonthly: decimal(8, 2),
  setupFee: decimal(8, 2),
  maxPages: integer(),
  features: jsonb(),          // feature flags: blog, reviews, seoScore, etc.
  stripePriceId: varchar(255),
  isActive: boolean().default(true),
  createdAt, updatedAt,
}
```

#### media (fichiers uploadés)
```typescript
{
  id: uuid,
  tenantId: uuid,
  filename: varchar(255),
  mimeType: varchar(100),
  fileSize: integer(),
  width: integer(),
  height: integer(),
  url: varchar(500),          // Cloudflare R2 URL
  alt: varchar(300),
  createdAt,
}
```

### 2. Enums PostgreSQL
```typescript
export const statusEnum = pgEnum('tenant_status', ['trial', 'active', 'suspended', 'cancelled'])
export const bookingModeEnum = pgEnum('booking_mode', ['doctolib', 'alternative', 'contact'])
export const pageTypeEnum = pgEnum('page_type', ['home', 'about', 'contact', 'services', 'blog_index', 'legal', 'custom'])
export const messageStatusEnum = pgEnum('message_status', ['new', 'read', 'replied', 'archived'])
```

### 3. Index
- `tenants`: index sur `slug`, `customDomain`, `status`
- `practitioners`: index sur `tenantId`, `specialtySlug`
- `services`: index sur `tenantId`, `slug`, `isPublished`
- `pages`: index sur `tenantId`, `slug`, `pageType`
- `blog_posts`: index sur `tenantId`, `slug`, `isPublished`
- `contact_messages`: index sur `tenantId`, `status`, `createdAt DESC`

### 4. Row-Level Security (RLS)
Créer un fichier `packages/db/rls.sql` avec les politiques RLS pour chaque table tenant-scoped :
```sql
-- Activer RLS
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;

-- Politique : un rôle ne voit que ses données
CREATE POLICY tenant_isolation ON practitioners
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```
Appliquer le même pattern pour toutes les tables avec `tenantId`.

### 5. Seed de développement (`packages/db/seed.ts`)
Créer 3 tenants de test avec des données réalistes :
1. **Dr. Sophie Martin** — Dermatologue à Lyon (segment spécialiste, avec Doctolib)
2. **Cabinet Dupont Kinésithérapie** — Kiné à Aurillac (segment paramédical, avec Doctolib)
3. **Émilie Rousseau Sophrologie** — Sophrologue à Clermont-Ferrand (segment bien-être, SANS Doctolib → fallback contact)

Chaque tenant a : profil praticien, adresse, horaires, 3-5 services, 2-3 pages, 2-3 FAQ, 1-2 témoignages, paramètres du site.

### 6. Types Zod (`packages/types/`)
Pour chaque table, créer :
- Le schéma Zod `insertSchema` (pour création)
- Le schéma Zod `updateSchema` (partial, pour modification)
- Le schéma Zod `selectSchema` (pour les réponses API)
- Export du type TypeScript inféré

## Contraintes
- UUID v7 (ordonnés chronologiquement) via `crypto.randomUUID()`
- Pas de `serial` / auto-increment
- Pas de `any` dans les types
- Chaque fichier de schéma dans un fichier séparé : `schema/tenants.ts`, `schema/practitioners.ts`, etc.
- Index `schema/index.ts` qui réexporte tout
