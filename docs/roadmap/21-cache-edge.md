# Chantier 21 — Cache fin par bloc + edge config

## But

Optimiser la latence et le coût hosting Vercel : passer du SSR systématique à un mix ISR + cache edge granulaire. Pages tenant servies en majorité depuis le cache CDN, invalidation ciblée à chaque édition Payload (revalidateTag par bloc/page).

## Pré-requis

- Templates stables
- Pages éditables via Payload (déjà OK)
- Trafic suffisant pour justifier l'effort (à vérifier via Plausible — sinon reporter)

## Périmètre exact

**Inclus :**
- Toutes les pages tenant publiques en `revalidate = 3600` (1 h) par défaut
- Tags par tenant et par page : `tenant:<id>`, `page:<id>`, `block:<blockType>:<id>`
- Hook Payload `afterChange` sur Pages, Services, BlogPosts, FaqItems, Testimonials, SiteSettings → `revalidateTag('tenant:<id>')`
- Hook plus fin sur édition d'un bloc spécifique → `revalidateTag('block:<id>')`
- `cache-control: s-maxage=3600, stale-while-revalidate=86400` sur les routes publiques
- Pages dynamiques (preview, admin) restent en `force-dynamic`
- Sitemap revalide à chaque update tenant

**Exclus :**
- Cache R2 médias (déjà géré par Cloudflare)
- Compute edge (Edge Runtime sur les RSC) — V2

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/web/src/app/(tenant)/page.tsx` | modifié — revalidate + tags |
| `apps/web/src/app/(tenant)/blog/[slug]/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/actes/[slug]/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/p/[slug]/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/faq/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/contact/page.tsx` | modifié — DYNAMIC car form |
| `apps/web/src/lib/cache-tags.ts` | nouveau — helpers `tenantTag`, `pageTag`, `blockTag` |
| `apps/admin/src/collections/Pages.ts` | modifié — afterChange hook |
| `apps/admin/src/collections/Services.ts` | modifié |
| `apps/admin/src/collections/BlogPosts.ts` | modifié |
| `apps/admin/src/collections/FaqItems.ts` | modifié |
| `apps/admin/src/collections/Testimonials.ts` | modifié |
| `apps/admin/src/collections/SiteSettings.ts` | modifié |
| `apps/admin/src/lib/revalidate.ts` | nouveau — appelle `apps/web/api/revalidate` |
| `apps/web/src/app/api/revalidate/route.ts` | nouveau — endpoint protégé par token |
| `docs/ops/runbook.md` | modifié — section cache |

## Étapes d'implémentation

1. Helpers de tags dans `apps/web/src/lib/cache-tags.ts`.
2. Annoter chaque page publique avec `export const revalidate = 3600` et `unstable_cache(fetch, [...], { tags: [...] })` autour des fetches DB.
3. Endpoint `apps/web/api/revalidate` protégé par `REVALIDATE_TOKEN` (ajouter aux env), accepte `POST { tags: string[] }` et appelle `revalidateTag`.
4. Hook Payload générique : `afterChange` callback qui détermine les tags à invalider et POST l'endpoint.
5. Logger les revalidations en dev pour debug.
6. Ajouter `REVALIDATE_TOKEN` dans `turbo.json` `globalEnv`.

## Critères de done

- [ ] Edition d'une page Pages dans Payload → la page publique correspondante est rafraîchie en < 5 s
- [ ] Page tenant servie depuis le cache (`x-vercel-cache: HIT`) sur visite répétée
- [ ] Aucune fuite cross-tenant (tenant A modifie sa page, tenant B reste en cache)
- [ ] Pages dynamiques (`/contact` qui POST le form) restent dynamiques
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts
- [ ] Runbook ops documente le mécanisme

## Risques connus

- Sur-invalidation : un afterChange large invalide tout le tenant à chaque édition mineure. Démarrer large (tenant), affiner en `block` au besoin.
- Form contact : si page mise en cache, le CSRF token expire. Solution : form en `'use client'` qui POST en API route, pas le form en RSC.
- Hook Payload qui appelle un endpoint Next : si Payload est down, l'invalidation échoue silencieusement. Logger les erreurs et alerter.

## Tests à ajouter

- Unitaire : `tenantTag(id)` produit le bon string
- Intégration : POST `/api/revalidate` avec tags valides → 200 ; sans token → 401
- E2E : édition Payload simulée → page publique reflète le changement < 5 s (tricky en CI, peut rester manuel)

## Estimation

1 jour.
