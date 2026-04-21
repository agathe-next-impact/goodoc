# Prompt 07 — Frontend : Templates et pages publiques

## Contexte
Tu travailles dans `apps/web/app/(tenant)/`. Les packages `seo`, `doctolib` et `ui` sont prêts. Tu construis les pages publiques du site praticien avec Next.js 15 App Router, Server Components par défaut, et un design professionnel mobile-first.

## Objectif
Implémenter toutes les pages du site praticien avec SEO complet, intégration Doctolib, et composants responsives.

## Instructions

### 1. Layout tenant (`layout.tsx`)

- Charger le tenant via `getTenant()`
- Injecter les CSS custom properties (couleurs, polices) depuis `siteSettings`
- Composants partagés : `<SiteHeader>` et `<SiteFooter>`
- `<link rel="preconnect">` vers Doctolib, Google Maps, Google Fonts
- Script Plausible Analytics conditionnel

### 2. Page d'accueil (`page.tsx`)

Structure :
```
<HeroSection />           — Photo praticien + accroche + CTA Doctolib
<ServicesPreview />        — 3-4 actes phares en cards
<AboutPreview />           — Extrait bio + lien "En savoir plus"
<TestimonialsSection />    — Carrousel de témoignages (si disponibles)
<BookingSection />         — Widget iframe Doctolib OU section contact
<LocationSection />        — Carte Google Maps + horaires + adresse
```

SEO : 
- `generateMetadata()` → title, description, openGraph avec image praticien
- JSON-LD : MedicalBusiness + LocalBusiness + BreadcrumbList + WebSite

### 3. Page À propos (`a-propos/page.tsx`)

Structure :
```
<PageHeader title="À propos" />
<PractitionerBio />        — Photo + bio complète
<QualificationsSection />  — Diplômes, formations, certifications
<ApproachSection />        — Philosophie de soin
<CabinetGallery />         — Photos du cabinet (si uploadées)
<BookingCta context="footer" />
```

SEO :
- JSON-LD : IndividualPhysician + BreadcrumbList

### 4. Pages Actes

#### Liste (`actes/page.tsx`)
- Grille de cards avec image, titre, courte description, durée, prix optionnel
- Chaque card est un lien vers la page détaillée
- JSON-LD : ItemList + BreadcrumbList

#### Détail (`actes/[slug]/page.tsx`)
- `generateStaticParams()` pour SSG
- Contenu riche de l'acte (description, déroulement, indications)
- Sidebar : durée, prix, CTA Doctolib contextuel ("Prendre RDV pour {acte}")
- Section "Autres actes" en bas de page (maillage interne)
- JSON-LD : MedicalProcedure + Service + BreadcrumbList

### 5. Page Contact (`contact/page.tsx`)

Structure :
```
<PageHeader title="Contact" />
<ContactGrid>
  <ContactForm />           — Formulaire (Server Action)
  <ContactInfo />           — Téléphone, email, adresse
</ContactGrid>
<MapSection />              — Google Maps embed
<OpeningHoursTable />       — Horaires formatés
```

Le formulaire utilise un Server Action :
- Champs : nom, email, téléphone (optionnel), motif (select), message
- Validation Zod côté serveur
- Sauvegarde en DB (`contact_messages`)
- Envoi email notification au praticien via Resend
- Honeypot anti-spam + rate limiting
- Feedback utilisateur (toast succès/erreur)

### 6. Page Blog

#### Index (`blog/page.tsx`)
- Liste des articles publiés, paginés (12 par page)
- Card : image, titre, extrait, date, catégorie
- Filtre par catégorie (optionnel)

#### Article (`blog/[slug]/page.tsx`)
- `generateStaticParams()` pour SSG
- Contenu riche (lexical blocks)
- Auteur (praticien) avec photo et lien
- Articles connexes en bas de page
- JSON-LD : Article + BreadcrumbList

### 7. Page Rendez-vous (`rendez-vous/page.tsx`)

Page dédiée au widget Doctolib (si mode doctolib) :
- `<BookingSection>` en pleine largeur
- Informations pratiques : adresse, horaires, téléphone
- JSON-LD : LocalBusiness (reprend l'@id de la page d'accueil)

Si mode contact : redirige vers /contact

### 8. Pages légales

- `mentions-legales/page.tsx` — Mentions légales (contenu depuis SiteSettings, template pré-rempli)
- `politique-de-confidentialite/page.tsx` — RGPD (template pré-rempli)
- `noindex` sur ces pages

### 9. Sitemap dynamique (`sitemap.ts`)

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await getTenantOrNull()
  if (!tenant) return []
  
  const services = await getPublishedServices(tenant.id)
  const blogPosts = await getPublishedBlogPosts(tenant.id)
  
  return [
    { url: tenant.siteUrl, lastModified: tenant.updatedAt, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${tenant.siteUrl}/a-propos`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${tenant.siteUrl}/actes`, changeFrequency: 'weekly', priority: 0.9 },
    ...services.map(s => ({
      url: `${tenant.siteUrl}/actes/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${tenant.siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    ...blogPosts.map(p => ({
      url: `${tenant.siteUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ]
}
```

### 10. Robots.txt (`robots.ts`)

```typescript
export default function robots(): MetadataRoute.Robots {
  const tenant = getTenantOrNull()
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    sitemap: tenant ? `${tenant.siteUrl}/sitemap.xml` : undefined,
  }
}
```

### 11. Design System

Utiliser les composants de `packages/ui/` basés sur shadcn/ui. Le design doit être :
- **Professionnel et sobre** — pas de fantaisie, le praticien doit inspirer confiance
- **Mobile-first** — 70%+ du trafic sera mobile
- **Rapide** — tout en Server Components sauf les interactions (formulaire, carrousel)
- **Accessible** — WCAG 2.1 AA, navigation clavier, contrastes

Les couleurs viennent des CSS custom properties injectées depuis `siteSettings` :
```css
:root {
  --color-primary: var(--tenant-primary, #1B3A5C);
  --color-secondary: var(--tenant-secondary, #2E86AB);
}
```

## Contraintes
- Server Components par défaut — Client Components uniquement pour : formulaire de contact, carrousel de témoignages, sticky bar mobile, carte Google Maps
- Toutes les images via `next/image` avec `width`, `height`, `alt` explicites
- `generateMetadata()` dans CHAQUE page.tsx — jamais de meta hardcodé
- JSON-LD dans CHAQUE page.tsx via `<JsonLd>` du package `seo`
- Jamais de `fetch` dans les composants — les queries sont dans `lib/queries/`
- ISR avec `revalidate: 3600` (1h) sur les pages statiques, revalidation on-demand via webhook Payload
