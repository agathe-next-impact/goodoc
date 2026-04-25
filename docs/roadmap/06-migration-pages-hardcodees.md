# Chantier 06 — Migration des pages hardcodées vers le rendu dynamique

## But

Aujourd'hui, `apps/web/src/app/(tenant)/page.tsx`, `/actes`, `/a-propos`, `/contact`, `/blog`, etc. sont des pages React écrites en dur. Le système de templates ne s'applique réellement qu'à `/p/[slug]`. À l'issue de ce chantier, **tout le site public** est rendu via le registry — la route `/p/[slug]` devient la racine et la cohabitation disparaît.

## Pré-requis

- Chantiers 01 + 04 (rendu validé manuellement et automatiquement)
- Pages présentes dans la DB pour tous les tenants prod (sinon fallback nécessaire)

## Périmètre exact

**Inclus :**
- Suppression des fichiers hardcodés sous `apps/web/src/app/(tenant)` :
  - `page.tsx` (home)
  - `actes/`, `a-propos/`, `contact/`, `rendez-vous/`, `mentions-legales/`, `politique-de-confidentialite/`
- Création d'une route catch-all `apps/web/src/app/(tenant)/[[...slug]]/page.tsx` qui :
  - mappe `/` → slug `home`
  - mappe `/<slug>` → slug correspondant
  - 404 si la page n'existe pas
- Décommissionnement de la route sandbox `/p/[slug]` (déplacée à la racine)
- Migration `site-header` et `site-footer` :
  - soit en blocs de page
  - soit gardés comme composants de layout mais pilotés par `siteSettings`
- Lien "Prendre rendez-vous" dans le header câblé sur `practitioner.bookingMode` (Doctolib / Cal.com / contact)

**Exclus :**
- Migration des routes sous `/admin/onboarding` (chantier 05)
- Migration `/blog/[slug]` (rester en collection custom pour l'instant)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/web/src/app/(tenant)/[[...slug]]/page.tsx` | nouveau |
| `apps/web/src/app/(tenant)/page.tsx` | supprimé |
| `apps/web/src/app/(tenant)/actes/` | supprimé |
| `apps/web/src/app/(tenant)/a-propos/` | supprimé |
| `apps/web/src/app/(tenant)/contact/` | supprimé (sauf `action.ts` réutilisé pour `contact-form` block) |
| `apps/web/src/app/(tenant)/p/` | supprimé (déplacé à la racine) |
| `apps/web/src/app/(tenant)/rendez-vous/` | supprimé OU gardé selon décision Doctolib |
| `apps/web/src/app/(tenant)/mentions-legales/` | converti en page DB par tenant |
| `apps/web/src/app/(tenant)/politique-de-confidentialite/` | idem |
| `apps/web/src/lib/queries.ts` | éventuellement, simplifier |
| `apps/web/src/components/site-header.tsx` | adapté pour lire `siteSettings` |
| `apps/web/src/app/sitemap.ts` | itère sur la table `pages` au lieu des routes hardcodées |

## Étapes d'implémentation

### 1. Route catch-all

```tsx
// apps/web/src/app/(tenant)/[[...slug]]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  registerBuiltInBlocks,
  registerBuiltInTemplates,
  SectionRenderer,
  type SectionNode,
} from '@medsite/templates'
import { getPublishedPageBySlug } from '@/lib/queries'
import { getTenantOrNull } from '@/lib/tenant'

registerBuiltInBlocks()
registerBuiltInTemplates()

type RouteProps = {
  params: Promise<{ slug?: string[] }>
}

function resolveSlug(segments?: string[]): string {
  if (!segments || segments.length === 0) return 'home'
  return segments.join('/')
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const tenant = await getTenantOrNull()
  if (!tenant) return {}
  const slug = resolveSlug((await params).slug)
  const page = await getPublishedPageBySlug(tenant.tenant.id, slug)
  if (!page) return {}
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
  }
}

export default async function Page({ params }: RouteProps) {
  const tenant = await getTenantOrNull()
  if (!tenant) notFound()
  const slug = resolveSlug((await params).slug)
  const page = await getPublishedPageBySlug(tenant.tenant.id, slug)
  if (!page) notFound()
  return <SectionRenderer sections={normalize(page.content)} />
}

function normalize(raw: unknown): SectionNode[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((i) =>
    i && typeof i === 'object' && 'blockType' in i ? [i as SectionNode] : [],
  )
}
```

### 2. Mapping slug ↔ route

Aucun mapping manuel nécessaire si on respecte la règle « slug DB = path URL ». Les presets ont déjà `home`, `a-propos`, `services`, `contact`, `faq`, `tarifs` qui correspondent à des URLs naturelles.

### 3. Plan de migration prudent

1. Créer `[[...slug]]/page.tsx` mais en dossier dupliqué `__dyn` pour test
2. Tester sur les 3 tenants dev en parallèle des routes hardcodées
3. Une fois validé, supprimer les routes hardcodées une par une, en validant à chaque fois
4. Supprimer `/p/[slug]` en dernier
5. Run E2E (chantier 04) + Lighthouse (chantier 03) pour valider

### 4. Layout : header & footer

Le `(tenant)/layout.tsx` actuel rend `<SiteHeader>` et `<SiteFooter>`. Deux options :

- **A** — Les garder comme layout components, alimentés par `siteSettings.logoUrl`, `tenant.practitioner` etc. Simple, rapide.
- **B** — Les transformer en blocs `header` / `footer` avec un schéma propre. Plus de flexibilité mais plus de travail.

Recommandation : **A** pour cette V1, **B** plus tard si le besoin apparaît.

## Critères de done

- [ ] `pnpm dev` rend les 3 tenants sur `/`, `/a-propos`, `/services`, `/contact`, `/faq`, `/tarifs`
- [ ] Les anciennes URLs renvoient toujours 200 (compat slugs)
- [ ] La route `/p/[slug]` peut être supprimée sans casser le E2E
- [ ] `app/sitemap.ts` génère les URLs depuis la table `pages` du tenant
- [ ] Lighthouse ≥ 95 maintenu sur les nouvelles URLs

## Risques connus

- Une page peut être en `isDraft=true` sans `isPublished` — le 404 doit s'appliquer en mode normal mais pas en mode draft (cf chantier 02).
- Conflits avec sous-dossiers existants (ex. `/blog/`, `/admin/`) — ces routes prennent priorité sur le catch-all si elles existent. À garder pour blog notamment.
- Mentions légales / politique de confidentialité : aujourd'hui hardcodées avec template générique. Il faut les seeder dans `pages` pour chaque tenant existant via une migration ou un script `pnpm tsx scripts/backfill-legal-pages.ts`.

## Tests à ajouter

- E2E : 6 slugs × 3 tenants en SSR (déjà couvert par chantier 04 si on adapte les URLs)
- Unit : `resolveSlug([])` → `'home'`, `resolveSlug(['a-propos'])` → `'a-propos'`, etc.

## Estimation

1,5 jour.
