# Catalogue de sections — Phase 0 bis

> **Source** : inventaire des 6 templates shadcnblocks stockés dans `.templates-source/` (gitignoré).
> **Méthode** : lecture **uniquement** des noms de fichiers de sections — aucun code n'a été lu pour éviter toute contamination involontaire. Les templates servent de *références visuelles* ; tout le code des blocs MedSite sera réécrit depuis des sources MIT (shadcn blocks, Aceternity UI, Magic UI, Vercel Templates).
> **Licence** : les templates shadcnblocks sont **interdits en SaaS** (voir `LICENSE`). On ne référence leurs noms qu'à titre d'inspiration visuelle — aucun fichier n'est importé dans `packages/` ou `apps/`.

---

## 1. Synthèse des sections observées

| Template | Sections présentes |
|----------|-------------------|
| **aspect** | hero, split-section, logos, features, features-hero, about-hero, team-carousel, testimonials, faq, faq-page, blog-header, blog-post, featured-post, post-grid, contact-hero, contact-form, pricing, pricing-table, support-hero, open-positions, dashboard, tabs, world-map, separator |
| **lumen** | hero, logos, features-grid, features-showcase, features-carousel, benefits-showcase, video-showcase, testimonials, testimonials-marquee, faq-section, team-showcase, about-hero, why-we-began, pricing, pricing-table |
| **metafi** | hero, mission, logos, partner-logos, features, features-section, features-included, feature-benefits, feature-pricing, team, testimonials, faq, cta, about-hero, careers-hero, contact-section, blog-grid, blog-post, blog-featured, featured-blog-posts, integrations, integrations-hero, all-integrations, perks, tabs, trough-years (timeline), pricing-hero, legal-article, job-openings |
| **plasma** | hero, features, features2, features-tabs, ai-automation, testimonials, about-hero, about-news, about-team, about-logos, product-hero, product-features, product-dashboard, product-logs |
| **scalar** | hero, features, compatibility, testimonials, faq, contact, blog-posts, roadmap, about-hero, about-mission-team, about-investors-contributors, about-testimonials, product-hero, product-features, product-compatibility, product-cta |
| **zippay** | hero, features-hero, features-section, features-bullets, features-solutions, features-tabs, feature-quad, logos, mission, core-values, testimonials, faq, faq-page, cta-card, cta-section, pricing-hero, comparison-plan, integrations-hero, integrations-list, integration-post, contact-form, about-hero, blog-header, blog-grid, blog-post, blog-featured-posts, content-illustration1/2, cards-illustrations, expense-illustration |

---

## 2. Archétypes consolidés

Regroupement des variantes observées en **archétypes canoniques** — chacun deviendra un bloc dans `packages/templates/src/blocks/` avec plusieurs `variant`.

### Légende pertinence MedSite

- ✅ **Cœur** — indispensable à un site de praticien
- 🟡 **Utile** — valorisant selon la spécialité ou le type de cabinet
- ⚠️ **À adapter** — concept pertinent mais vocabulaire/UX à remédicaliser
- ❌ **Hors scope** — inutile pour un site praticien

### 2.1 Heroes

| Archétype | Variantes observées | Pertinence | Notes MedSite |
|-----------|--------------------|------------| --------------|
| `HeroCentered` | hero (lumen, scalar, plasma) | ✅ | Variante par défaut, titre + baseline + CTA booking |
| `HeroSplit` | hero (aspect, metafi, zippay) | ✅ | Photo du praticien à droite, baseline à gauche |
| `HeroVideo` | video-showcase (lumen) | 🟡 | Vidéo de présentation du cabinet (premium) |
| `HeroWithBadge` | product-hero (scalar, plasma) | 🟡 | Badge "Conventionné secteur 1", "Agréé ARS" |
| `HeroMinimal` | about-hero (tous) | ✅ | Titre + sous-titre pour pages internes |

### 2.2 Services / Actes (ex-Features)

| Archétype | Variantes observées | Pertinence | Notes MedSite |
|-----------|--------------------|------------| --------------|
| `ServicesGrid` | features, features-grid (tous) | ✅ | Grille 3×N d'actes avec icône + descriptif + durée + tarif |
| `ServicesShowcase` | features-showcase (lumen) | ✅ | Bloc riche par acte (photo + description longue) |
| `ServicesTabs` | features-tabs, tabs (aspect, metafi, zippay, plasma) | 🟡 | Onglets par spécialité (cabinet pluridisciplinaire) |
| `ServicesBullets` | features-bullets (zippay) | ✅ | Liste à puces avec check, pour page "approche thérapeutique" |
| `ServicesQuad` | feature-quad (zippay) | 🟡 | 4 piliers du cabinet (ex. "Écoute / Expertise / Suivi / Disponibilité") |
| `ServicesCarousel` | features-carousel (lumen) | 🟡 | Carousel mobile-first |

### 2.3 À propos / Mission

| Archétype | Variantes observées | Pertinence | Notes MedSite |
|-----------|--------------------|------------| --------------|
| `AboutHero` | about-hero (tous) | ✅ | Portrait + bio praticien |
| `Mission` | mission (metafi, zippay), why-we-began (lumen) | ✅ | "Ma vision du soin", "Mon approche" |
| `CoreValues` | core-values (zippay) | ✅ | 3–4 valeurs du cabinet (avec icônes) |
| `Timeline` | trough-years (metafi), roadmap (scalar) | 🟡 | Parcours du praticien (diplômes, expérience) |

### 2.4 Équipe / Praticiens

| Archétype | Variantes observées | Pertinence | Notes MedSite |
|-----------|--------------------|------------| --------------|
| `TeamGrid` | team (metafi), about-team (plasma), team-showcase (lumen) | ✅ | Cabinet avec plusieurs praticiens |
| `TeamCarousel` | team-carousel (aspect) | 🟡 | Version mobile / cabinet > 6 praticiens |
| `PractitionerCard` | (dérivé de team) | ✅ | Un seul praticien : version étendue avec diplômes, langues, RPPS |

### 2.5 Avis patients (ex-Testimonials)

| Archétype | Variantes observées | Pertinence | Notes MedSite |
|-----------|--------------------|------------| --------------|
| `TestimonialsGrid` | testimonials (tous) | ✅ | Avis Google / Doctolib agrégés |
| `TestimonialsMarquee` | testimonials-marquee (lumen) | 🟡 | Défilement continu (premium) |
| `TestimonialSpotlight` | about-testimonials (scalar) | 🟡 | Un seul avis mis en avant |

> ⚠️ Conformité CNIL/RGPD : les avis doivent être anonymisés (prénom + initiale), consentement explicite. Pas d'affichage de données de santé.

### 2.6 FAQ

| Archétype | Variantes observées | Pertinence | Notes MedSite |
|-----------|--------------------|------------| --------------|
| `FAQAccordion` | faq, faq-section (tous) | ✅ | Accordéon par défaut |
| `FAQPage` | faq-page (aspect, zippay) | ✅ | Page dédiée, groupes ("Consultation", "Remboursement", "Urgences") |

### 2.7 CTA

| Archétype | Variantes observées | Pertinence | Notes MedSite |
|-----------|--------------------|------------| --------------|
| `CTABanner` | cta-section (zippay), product-cta (scalar) | ✅ | Bandeau "Prendre rendez-vous" avec Doctolib / Cal.com |
| `CTACard` | cta-card (zippay), cta (metafi) | ✅ | Encart en bas de section |

### 2.8 Contact

| Archétype | Variantes observées | Pertinence | Notes MedSite |
|-----------|--------------------|------------| --------------|
| `ContactForm` | contact-form (aspect, zippay), contact (scalar) | ✅ | Nom + email + téléphone + message (PAS de champ "symptômes" → RGPD) |
| `ContactSection` | contact-section (metafi) | ✅ | Adresse + carte + horaires + téléphone + email |
| `ContactHero` | contact-hero (aspect), support-hero | ✅ | Header de page contact |

### 2.9 Blog / Articles

| Archétype | Variantes observées | Pertinence | Notes MedSite |
|-----------|--------------------|------------| --------------|
| `BlogGrid` | blog-grid (metafi, zippay), blog-posts (scalar), post-grid (aspect) | ✅ | Liste d'articles santé |
| `BlogFeatured` | blog-featured, featured-post | ✅ | Article mis en avant |
| `BlogPost` | blog-post (aspect, metafi, zippay) | ✅ | Page d'article individuelle |
| `BlogHeader` | blog-header (aspect, zippay) | ✅ | Header de la section blog |

### 2.10 Tarifs (ex-Pricing)

| Archétype | Variantes observées | Pertinence | Notes MedSite |
|-----------|--------------------|------------| --------------|
| `PricingTable` | pricing, pricing-table (aspect, lumen) | ⚠️ | À adapter : **tableau des actes + tarif sécu + dépassement** |
| `ComparisonPlan` | comparison-plan (zippay) | ❌ | Concept SaaS pas pertinent ici |
| `FeePricing` | feature-pricing (metafi) | 🟡 | Acte par acte avec descriptif court |

### 2.11 Horaires d'ouverture (spécifique MedSite — à créer)

| Archétype | Pertinence | Notes |
|-----------|------------|-------|
| `OpeningHours` | ✅ | Tableau 7 jours + pause déjeuner, fermeture exceptionnelle, jours fériés |
| `OpeningHoursCompact` | ✅ | Widget latéral sur les pages contact/accueil |

### 2.12 Localisation / Carte

| Archétype | Pertinence | Notes |
|-----------|------------|-------|
| `LocationMap` | ✅ | Google Maps embed ou alternative OpenStreetMap, avec itinéraire + transports en commun + parking |

### 2.13 Partenaires / Affiliations (adaptation `logos`)

| Archétype | Variantes observées | Pertinence | Notes MedSite |
|-----------|--------------------|------------| --------------|
| `PartnerLogos` | logos, partner-logos (tous) | 🟡 | Mutuelles acceptées, établissements affiliés (CHU, cliniques), organismes (Ordre des médecins, ARS) |

### 2.14 Galerie (à créer)

| Archétype | Pertinence | Notes |
|-----------|------------|-------|
| `PracticeGallery` | ✅ | Photos du cabinet, salle d'attente, équipement |
| `BeforeAfter` | 🟡 | Esthétique, orthodontie — avec consentement patient écrit |

### 2.15 Hors scope MedSite

| Archétype | Raison du rejet |
|-----------|-----------------|
| `Dashboard`, `product-dashboard`, `product-logs` | Concept SaaS produit, inutile |
| `Integrations`, `compatibility`, `all-integrations` | Pas de notion d'intégration pour un site praticien |
| `AIAutomation` | Sujet non pertinent et à risque RGPD santé |
| `WorldMap` | Un praticien = un lieu, pas besoin de carte monde |
| `OpenPositions`, `job-openings`, `careers-hero` | 🟡 possible pour cabinets qui recrutent — bloc à archiver, pas prioritaire |
| `Roadmap` | Concept produit tech |
| `LegalArticle` | Remplacé par pages statiques `mentions-légales` / `politique-confidentialité` avec template générique MedSite |

---

## 3. Shortlist pour `medical-classic` (thème prioritaire)

**Blocs à construire en priorité (Phase 5 bis)** — 12 blocs couvrant la home + les pages standards d'un praticien :

| # | Bloc | Pages qui l'utilisent | Source MIT probable |
|---|------|----------------------|---------------------|
| 1 | `HeroSplit` | home | shadcn blocks > Hero > split image |
| 2 | `ServicesGrid` | home, services | shadcn blocks > Features > grid |
| 3 | `AboutHero` | about | shadcn blocks > Hero > centered |
| 4 | `PractitionerCard` | about, home | shadcn blocks > Team > card (adapté) |
| 5 | `OpeningHours` | home, contact | à écrire (spécifique médical) |
| 6 | `LocationMap` | contact | Vercel Templates > map embed |
| 7 | `TestimonialsGrid` | home, about | shadcn blocks > Testimonials > grid |
| 8 | `FAQAccordion` | home, faq | shadcn blocks > FAQ > accordion |
| 9 | `ContactForm` | contact | shadcn blocks > Contact > form |
| 10 | `CTABanner` | home, services | shadcn blocks > CTA > banner |
| 11 | `FeePricing` | tarifs | shadcn blocks > Pricing > simple (adapté en tableau d'actes) |
| 12 | `PartnerLogos` | about | shadcn blocks > Logos > row |

**Composition `medical-classic` de la page home :**

```
1. HeroSplit        → titre, baseline, photo praticien, CTA Doctolib
2. ServicesGrid     → 6 actes phares
3. AboutHero        → mini-bio + lien "En savoir plus"
4. OpeningHours     → horaires + téléphone urgence
5. TestimonialsGrid → 3 avis patients
6. FAQAccordion     → 4-6 questions fréquentes
7. CTABanner        → "Prendre RDV" Doctolib
8. LocationMap      → adresse + carte
```

**Pages standards pré-générées** : `/`, `/a-propos`, `/services`, `/tarifs`, `/contact`, `/faq`, `/blog` (optionnel), `/mentions-legales`, `/politique-de-confidentialite`.

---

## 4. État d'implémentation

| Phase | Statut | Livrable |
|-------|--------|----------|
| 2 — Scaffold | ✅ | `packages/templates` + registry + ThemeStyle + renderer |
| 3 — DB | ✅ (caduque) | `site_settings.templateId` + `pages.content` déjà présents |
| 4 — Rendu dynamique | ✅ | Route `apps/web/src/app/(tenant)/p/[slug]` |
| 5 bis — 12 blocs | ✅ | hero-split, services-grid, about-hero, practitioner-card, opening-hours, location-map, testimonials-grid, faq-accordion, contact-form, cta-banner, fee-pricing, partner-logos (+ placeholder) |
| 6 bis — 5 thèmes | ✅ | medical-classic, warm-wellness, modern-clinic, minimal-pro, family-practice |
| 7 — Back-office Payload | ✅ | 13 Blocks alignés, 5 options templateId, endpoint `/api/apply-template-preset`, seed migré |
| 8 — SEO + galerie + doc | ✅ | JSON-LD dans 4 blocs, `TemplateGallery` dans admin, `authoring.md` |

À faire hors cycle (nice-to-have) :
- Lighthouse CI sur les 6 slugs × 3 tenants
- E2E Playwright qui charge chaque slug et snapshot-teste
- Preview Payload Live Preview branché sur `apps/web?draft=true`
- Screenshots statiques pour la galerie admin (en production, pas un bug gradient)

---

## 5. Notes de conformité et qualité

- **Vocabulaire médical** : "rendez-vous" (jamais "booking"), "praticien", "consultation", "acte médical", "patient" — à homogénéiser dans les props de chaque bloc.
- **RGPD** : aucun champ santé dans les formulaires publics, mentions légales et politique RGPD générées automatiquement par MedSite.
- **Accessibilité** : objectif WCAG AA minimum — contraste, navigation clavier, `aria-*`, lecteurs d'écran.
- **SEO** : chaque bloc expose un contrat JSON-LD via `@medsite/seo` (ex. `ServicesGrid` → `Service[]` schema.org, `TestimonialsGrid` → `Review[]`, `OpeningHours` → `openingHoursSpecification`).
- **Perf** : Lighthouse ≥ 95 — `next/image` partout, animations en dynamic import, pas de JS tiers bloquant.
- **i18n** : props textuelles en français par défaut, structure prête pour multi-langue plus tard (next-intl si besoin).
