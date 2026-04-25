# Chantier 05 — Wizard d'onboarding praticien

## But

Guider le praticien à travers 5 étapes après inscription pour produire un site fonctionnel en moins de 10 minutes : choix du template, infos perso, adresse + horaires, branding (couleurs/logo), publication. Stocker la progression dans `tenants.onboardingStep`.

## Pré-requis

- Chantiers 01 + 02 (preview), idéalement 03 et 04
- `tenants.onboardingStep` existe déjà (`integer default 1`)
- `TemplateGallery` réutilisable depuis le wizard

## Périmètre exact

**Inclus :**
- 5 routes Next.js dans `apps/admin/src/app/(payload)/onboarding/[step]`
- Redirection automatique vers `/admin/onboarding/<currentStep>` à la connexion tant que `onboardingStep < 6`
- Étape 1 : choix template → POST `/api/apply-template-preset` → bump `onboardingStep` à 2
- Étape 2 : infos praticien (form qui POST sur Payload Practitioners endpoint)
- Étape 3 : adresse + horaires (Addresses + OpeningHours)
- Étape 4 : branding (SiteSettings : primaryColor / logo upload)
- Étape 5 : preview + bouton « Publier » qui passe `tenants.status` à `active` (si essai démarré) et marque `onboardingStep = 6`
- Indicateur de progression en haut (5 dots / step labels)

**Exclus :**
- Possibilité de revenir en arrière (skip-only forward dans cette V1)
- Onboarding multi-praticien (cabinet à plusieurs) — V1 = 1 praticien

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/admin/src/app/(payload)/onboarding/layout.tsx` | nouveau — shell + step indicator |
| `apps/admin/src/app/(payload)/onboarding/[step]/page.tsx` | nouveau — dispatcher |
| `apps/admin/src/components/onboarding/step-1-template.tsx` | nouveau |
| `apps/admin/src/components/onboarding/step-2-practitioner.tsx` | nouveau |
| `apps/admin/src/components/onboarding/step-3-address.tsx` | nouveau |
| `apps/admin/src/components/onboarding/step-4-branding.tsx` | nouveau |
| `apps/admin/src/components/onboarding/step-5-publish.tsx` | nouveau |
| `apps/admin/src/app/api/onboarding/advance/route.ts` | nouveau — bump step |
| `apps/admin/src/middleware.ts` | nouveau OU modifié — redirige vers onboarding |
| `apps/admin/src/components/practitioner-dashboard.tsx` | + bannière « onboarding incomplet » si step < 6 |

## Étapes d'implémentation

### 1. Middleware de redirection

```ts
// apps/admin/src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (path.startsWith('/admin/onboarding') || path.startsWith('/api')) {
    return NextResponse.next()
  }
  // Lookup user + tenant.onboardingStep — via cookie Payload + DB
  // Si step < 6 → redirect /admin/onboarding/<step>
  // (à implémenter avec un appel léger au serveur ou via header injecté)
}

export const config = { matcher: '/admin/:path*' }
```

### 2. Shell wizard

Layout avec indicateur 1 → 5, bouton « Suivant » en bas, sauvegarde + bump à chaque submit.

### 3. Endpoint advance

```ts
// apps/admin/src/app/api/onboarding/advance/route.ts
// POST { step: number }
// Vérifie auth, met à jour tenants.onboardingStep
```

### 4. Réutiliser TemplateGallery

Étape 1 importe `<TemplateGallery>` mais avec un override : après application, redirige vers `/admin/onboarding/2` au lieu d'afficher le résumé.

### 5. Branding step

Champs : color picker `primaryColor` (HEX), `secondaryColor`, upload `logo` (utilise Media collection), choix de police (whitelist Google Fonts). Persister dans `siteSettings`.

### 6. Publish step

Affiche un iframe vers `apps/web/p/home` du tenant, bouton « Publier mon site » qui POST `/api/onboarding/advance` avec step=6 et passe `tenants.status` à `active`.

## Critères de done

- [ ] Un nouveau praticien créé manuellement en DB est redirigé vers `/admin/onboarding/1` à la connexion
- [ ] Les 5 étapes se complètent en < 10 min sur un parcours de test
- [ ] À la fin, `pages.content` est rempli, `siteSettings.primaryColor` set, `tenants.onboardingStep = 6`
- [ ] Le site public rend correctement avec les choix faits
- [ ] `pnpm typecheck && pnpm lint` passe

## Risques connus

- Payload utilise déjà ses propres routes admin sous `/(payload)/admin`. La route `/onboarding` doit être hors de ce groupe pour éviter l'auth Payload globale ET éviter les conflits de styles. Solution : groupe dédié `/(onboarding)`.
- Le lookup du `onboardingStep` en middleware demande une connexion DB → ne PAS faire en Edge Runtime ; utiliser un cookie léger « onboarding-done » mis à jour par l'API + un check serveur dans le layout admin.
- L'upload de logo via Media nécessite R2 configuré — bloquant en dev sans clés. Prévoir un fallback URL texte.

## Tests à ajouter

- E2E : parcours complet d'un nouveau praticien step 1 → 5
- Unitaire : `advance` rejette si step demandé < step actuel (anti-régression)

## Estimation

2 jours.
