# Chantier 12 — Sitemap dynamique par tenant

## But

Chaque tenant expose un `sitemap.xml` exhaustif et à jour : home, /a-propos, /actes/*, /blog/*, /faq, /contact, /rendez-vous, /p/*, mentions légales. Lastmod alimenté depuis `pages.updatedAt` / `blogPosts.updatedAt`. Objectif : indexation complète et fraîche dans Google Search Console.

## Pré-requis

- `apps/web/src/app/sitemap.ts` existe déjà et est partiellement fonctionnel — auditer ce qui manque
- `getTenant()` accessible côté RSC pour résoudre le tenant via host

## Périmètre exact

**Inclus :**
- Sitemap unique par hostname (un sitemap par tenant, distinct du sitemap marketing)
- Toutes les routes publiques listées avec `lastModified`, `changeFrequency`, `priority`
- Exclusion automatique des tenants `status` ∈ {suspended, cancelled} → sitemap vide
- Exclusion des pages avec `published = false` ou en draft Payload
- Sitemap marketing distinct sur `medsite.fr/sitemap.xml` (home marketing, pricing, faq, blog produit si présent)
- En-tête `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`

**Exclus :**
- Sitemap index multi-fichiers (un seul sitemap suffit < 50k URLs)
- Sitemap d'images / vidéos (V2)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/web/src/app/sitemap.ts` | modifié — refacto complet |
| `apps/web/src/app/marketing/sitemap.ts` | nouveau — sitemap marketing |
| `apps/web/src/lib/sitemap-helpers.ts` | nouveau — builders réutilisables |
| `apps/web/src/lib/sitemap-helpers.test.ts` | nouveau |
| `apps/web/e2e/sitemap.spec.ts` | nouveau ou étendu |

## Étapes d'implémentation

1. Auditer `apps/web/src/app/sitemap.ts` actuel : noter quelles routes sont déjà listées, quelles sont manquantes.
2. Extraire la logique en helpers purs testables (`buildTenantSitemap(tenantId)`, `buildMarketingSitemap()`).
3. Brancher sur la DB pour récupérer `pages`, `services`, `blogPosts`, `faqItems` du tenant + `updatedAt`.
4. Ajouter le filtrage par status tenant et published page.
5. Tester sur 3 tenants seedés : nombre d'URLs correspond aux pages publiées.
6. Soumettre les sitemaps à Google Search Console pour les domaines en prod (post-merge).

## Critères de done

- [ ] Tenant `medsite.fr/<slug>` ou `<slug>.medsite.fr` retourne un sitemap valide XML
- [ ] Tenant suspended/cancelled retourne un sitemap vide (mais pas 404)
- [ ] Marketing sitemap distinct et fonctionnel
- [ ] `lastmod` reflète bien `pages.updatedAt`
- [ ] Cache-Control présent
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts
- [ ] E2E valide le format XML et le nombre d'URLs sur un tenant seedé

## Risques connus

- Next.js 15 cache le sitemap par défaut — `revalidate` à régler explicitement.
- Hostname multi-tenant : `host` est dispo via `headers()` en RSC mais peut être `undefined` au build. Forcer `dynamic = 'force-dynamic'` sur la route sitemap.
- Pages draft de Payload : vérifier que le filtre `_status = 'published'` est bien appliqué.

## Tests à ajouter

- Unitaires : `buildTenantSitemap` avec fixtures (3 pages, 1 draft → 2 URLs)
- E2E : `GET /sitemap.xml` sur un tenant seedé retourne ≥ 5 URLs et `<lastmod>` valide ISO

## Estimation

0,5 jour.
