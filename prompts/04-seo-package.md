# Prompt 04 — Package SEO : Générateurs schema.org JSON-LD

## Contexte
Tu travailles dans `packages/seo/`. Ce package est critique — le SEO est l'avantage compétitif principal de la plateforme face à Doctolib. Chaque page publique DOIT avoir des données structurées JSON-LD complètes et interconnectées.

## Objectif
Créer le package complet de génération SEO : JSON-LD par type de page, helpers meta, et mapping automatique des spécialités vers les types schema.org.

## Instructions

### 1. Mapping spécialités → schema.org (`src/specialty-map.ts`)

```typescript
export const specialtySchemaMap: Record<string, {
  schemaType: string
  parentType: string
  medicalSpecialty?: string
}> = {
  'dermatologue': { schemaType: 'Dermatology', parentType: 'MedicalBusiness' },
  'dentiste': { schemaType: 'Dentist', parentType: 'MedicalBusiness' },
  'ophtalmologue': { schemaType: 'Optometric', parentType: 'MedicalBusiness' },
  'orl': { schemaType: 'Otolaryngologic', parentType: 'MedicalBusiness' },
  'cardiologue': { schemaType: 'Physician', parentType: 'MedicalBusiness', medicalSpecialty: 'Cardiovascular' },
  'gynecologue': { schemaType: 'Gynecologic', parentType: 'MedicalBusiness' },
  'pediatre': { schemaType: 'Pediatric', parentType: 'MedicalBusiness' },
  'psychiatre': { schemaType: 'Psychiatric', parentType: 'MedicalBusiness' },
  'kinesitherapeute': { schemaType: 'Physiotherapy', parentType: 'MedicalBusiness' },
  'osteopathe': { schemaType: 'MedicalBusiness', parentType: 'LocalBusiness' },
  'infirmier': { schemaType: 'Nursing', parentType: 'MedicalBusiness' },
  'orthophoniste': { schemaType: 'MedicalBusiness', parentType: 'LocalBusiness' },
  'sage-femme': { schemaType: 'Midwifery', parentType: 'MedicalBusiness' },
  'sophrologue': { schemaType: 'HealthAndBeautyBusiness', parentType: 'LocalBusiness' },
  'naturopathe': { schemaType: 'HealthAndBeautyBusiness', parentType: 'LocalBusiness' },
  'hypnotherapeute': { schemaType: 'HealthAndBeautyBusiness', parentType: 'LocalBusiness' },
  // fallback
  'default': { schemaType: 'MedicalBusiness', parentType: 'LocalBusiness' },
}
```

### 2. Générateur page d'accueil (`src/generators/home.ts`)

Génère un JSON-LD combinant MedicalBusiness (ou sous-type) + LocalBusiness :

```typescript
export function generateHomeJsonLd(tenant: TenantSEOData): JsonLdScript {
  const spec = getSpecialtySchema(tenant.practitioner.specialtySlug)
  return {
    '@context': 'https://schema.org',
    '@type': [spec.schemaType, 'LocalBusiness'],
    '@id': `${tenant.siteUrl}/#organization`,
    'name': tenant.practitioner.businessName,
    'description': tenant.practitioner.bio?.substring(0, 300),
    'url': tenant.siteUrl,
    'telephone': tenant.practitioner.phoneNumber,
    'email': tenant.practitioner.email,
    'image': tenant.practitioner.photoUrl,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': tenant.address.streetAddress,
      'addressLocality': tenant.address.city,
      'postalCode': tenant.address.postalCode,
      'addressCountry': tenant.address.country,
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': tenant.address.latitude,
      'longitude': tenant.address.longitude,
    },
    'openingHoursSpecification': formatOpeningHours(tenant.openingHours),
    'medicalSpecialty': spec.medicalSpecialty,
    'sameAs': buildSameAs(tenant),  // Doctolib, Google Business, réseaux sociaux
    // AggregateRating si avis disponibles
    ...(tenant.reviewStats && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': tenant.reviewStats.average,
        'reviewCount': tenant.reviewStats.count,
        'bestRating': 5,
      }
    }),
  }
}
```

### 3. Générateur page À propos (`src/generators/practitioner.ts`)

Type : IndividualPhysician (pour médecins) ou Person (pour paramédicaux/bien-être)
Propriétés : name, medicalSpecialty, alumniOf, hasCredential, knowsAbout, memberOf, image, description
Lien vers l'organisation via `@id`

### 4. Générateur pages Actes (`src/generators/service.ts`)

Type : MedicalProcedure + Service
Propriétés : name, procedureType, bodyLocation, description, provider (@id → Physician), offers (si prix affiché)
Chaque acte a son propre JSON-LD sur sa page dédiée.

### 5. Générateur FAQ (`src/generators/faq.ts`)

Type : FAQPage
Propriétés : mainEntity → array de Question avec acceptedAnswer
Éligible aux rich snippets Google (questions dépliables dans les SERP).

### 6. Générateur Blog (`src/generators/article.ts`)

Type : Article
Propriétés : headline, author (@id → IndividualPhysician), datePublished, dateModified, image, publisher (@id → Organization)

### 7. Générateurs transversaux

#### BreadcrumbList (`src/generators/breadcrumb.ts`)
Généré sur TOUTES les pages :
```
Accueil > Actes > Ostéopathie sportive
Accueil > Blog > Quand consulter un ostéopathe ?
```

#### WebSite + SearchAction (`src/generators/website.ts`)
Sur la page d'accueil uniquement. Inclut le potentialAction SearchAction si le site a un blog.

### 8. Composant React (`src/components/json-ld.tsx`)

```typescript
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

### 9. Meta helpers (`src/meta.ts`)

```typescript
export function generatePageMetadata(params: {
  tenant: TenantSEOData
  page: 'home' | 'about' | 'contact' | 'service' | 'blog_post' | 'blog_index'
  service?: ServiceSEOData
  blogPost?: BlogPostSEOData
}): Metadata {
  // Génère le title, description, openGraph, twitter, alternates
  // Pattern title par type de page :
  // home: "{Nom} — {Spécialité} à {Ville} | {Actes phares}"
  // service: "{Acte} | {Nom} — {Spécialité} à {Ville}"
  // blog: "{Titre article} | Blog {Nom}"
  // about: "À propos de {Nom} — {Spécialité} à {Ville}"
  // contact: "Contact — {Nom} {Spécialité} à {Ville}"
}
```

### 10. Tests (`src/__tests__/`)

- Tester chaque générateur avec des données réalistes des 3 segments (spécialiste, paramédical, bien-être)
- Valider le JSON-LD produit contre les types `schema-dts`
- Tester le mapping de spécialités (toutes les entrées + fallback)
- Tester que les @id sont cohérents entre les pages (le Physician de la page À propos est bien le même que le provider des actes)
- Tester les cas limites : pas de photo, pas de prix, pas d'avis, pas de Doctolib

## Contraintes
- Aucune donnée hardcodée — tout vient du tenant
- Les @id doivent suivre le pattern `{siteUrl}/#{type}` pour garantir la cohérence du knowledge graph
- Le JSON-LD doit être valide quand testé sur https://search.google.com/test/rich-results
- Pas de données dans le JSON-LD qui ne sont pas visibles sur la page (règle Google)
- Le package ne doit avoir AUCUNE dépendance sur Next.js — il exporte des fonctions pures
