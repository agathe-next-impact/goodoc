# Prompt 03 — Middleware multi-tenant et résolution de tenant

## Contexte
Le schéma DB est en place. Tu travailles sur `apps/web/` pour implémenter la résolution multi-tenant. Chaque requête HTTP doit être associée à un tenant (praticien) en fonction du hostname.

## Objectif
Implémenter le middleware Next.js qui résout le tenant, le système de cache, et les helpers pour accéder au tenant dans les Server Components.

## Instructions

### 1. Middleware (`apps/web/middleware.ts`)

Le middleware intercepte chaque requête et résout le tenant :

```
Requête entrante → extraire hostname
  ├── admin.medsite.fr → laisser passer (Payload CMS)
  ├── platform.medsite.fr → laisser passer (super admin)
  ├── *.medsite.fr → extraire slug → lookup tenants table → set header x-tenant-id
  ├── custom-domain.fr → lookup domains table → set header x-tenant-id
  └── medsite.fr (racine) → landing page marketing (pas de tenant)
```

Logique détaillée :
1. Extraire le hostname de la requête
2. Si c'est le domaine racine (`medsite.fr`) → NextResponse.next() (landing page)
3. Si c'est un sous-domaine connu (admin, platform, api, www) → NextResponse.next()
4. Si c'est un sous-domaine `{slug}.medsite.fr` → lookup tenant par slug
5. Sinon → lookup tenant par customDomain
6. Si tenant trouvé ET status !== 'cancelled' → set header `x-tenant-id` + `x-tenant-slug`
7. Si tenant trouvé ET status === 'suspended' → rewrite vers `/suspended`
8. Si pas de tenant → rewrite vers `/not-found`

### 2. Cache de résolution (`lib/tenant-cache.ts`)

La résolution DB à chaque requête est trop coûteuse. Implémenter un cache LRU en mémoire :
- Clé : hostname
- Valeur : `{ tenantId, slug, status, templateId }` | null
- TTL : 60 secondes
- Invalidation : via revalidateTag('tenant:{slug}') lors des modifications

Utiliser un simple `Map` avec timestamp — pas de dépendance externe.

### 3. Helper getTenant() (`lib/tenant.ts`)

```typescript
import { headers } from 'next/headers'

export async function getTenant(): Promise<Tenant> {
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) throw new TenantNotFoundError()
  // Fetch full tenant data with practitioner, settings, address
  // Use unstable_cache with tag 'tenant:{id}'
}

export async function getTenantOrNull(): Promise<Tenant | null> {
  // Same but returns null instead of throwing
}
```

Le type `Tenant` retourné doit inclure :
- Données du tenant (id, slug, status, plan)
- Données du praticien (nom, spécialité, schemaOrgType, doctolibUrl, bookingMode)
- Adresse principale (rue, ville, CP, coordonnées GPS)
- Paramètres du site (template, couleurs, polices, logo)
- Horaires d'ouverture

### 4. Layout racine tenant (`apps/web/app/(tenant)/layout.tsx`)

Le layout tenant wrape toutes les pages du site public praticien :
- Appelle `getTenant()` pour charger le contexte
- Injecte les CSS custom properties (couleurs, polices) depuis `siteSettings`
- Rend le `<Header>` et `<Footer>` communs avec les données du praticien
- Fournit le tenant via React context (pour les Client Components qui en ont besoin)
- Injecte le script Plausible Analytics si configuré

### 5. Route groups

```
apps/web/app/
├── (marketing)/          # Landing page medsite.fr — pas de tenant
│   ├── layout.tsx
│   └── page.tsx
├── (tenant)/             # Sites praticiens — tenant résolu
│   ├── layout.tsx        # Layout avec header/footer praticien
│   ├── page.tsx          # Page d'accueil
│   ├── a-propos/
│   ├── actes/
│   │   ├── page.tsx      # Liste des actes
│   │   └── [slug]/
│   │       └── page.tsx  # Détail d'un acte
│   ├── blog/
│   ├── contact/
│   ├── rendez-vous/
│   └── mentions-legales/
├── suspended/page.tsx    # Page pour sites suspendus
├── not-found.tsx
├── sitemap.ts            # Sitemap dynamique par tenant
├── robots.ts             # Robots.txt par tenant
└── middleware.ts
```

### 6. Gestion des domaines en dev

En développement local, le middleware doit supporter :
- `localhost:3003` → landing page marketing
- `sophie-martin.localhost:3003` → tenant Dr Sophie Martin
- `dupont-kine.localhost:3003` → tenant Cabinet Dupont
- Header `x-tenant-override: {slug}` pour les tests E2E

### 7. Tests

Créer des tests pour :
- Résolution par sous-domaine (happy path)
- Résolution par domaine custom
- Tenant non trouvé → 404
- Tenant suspendu → page de suspension
- Cache hit / cache miss / cache invalidation
- Isolation : le tenant A ne peut pas accéder aux données du tenant B

## Contraintes
- Le middleware doit être RAPIDE (<10ms en cache hit) — pas de requête DB sur chaque page view en production
- Pas de `getServerSession` dans le middleware (trop lent) — la session est pour les routes admin uniquement
- Le helper `getTenant()` ne doit JAMAIS retourner de données d'un autre tenant
- Penser à la résolution en mode preview (Payload CMS draft mode)
