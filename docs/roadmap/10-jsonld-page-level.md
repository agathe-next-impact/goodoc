# Chantier 10 — JSON-LD page-level

## But

Étendre l'injection JSON-LD au-delà de la home : chaque page tenant (services, blog, faq, contact, /p/[slug]) émet le ou les schemas pertinents, agrégés au niveau de la page et non par bloc, pour éviter les doublons et améliorer la richesse des résultats Google.

## Pré-requis

- `@medsite/seo` opérationnel avec ses 7 générateurs (Person, Physician, LocalBusiness, FAQPage, BlogPosting, BreadcrumbList, WebSite)
- Composant `<JsonLd>` disponible
- Pages tenant existantes dans `apps/web/src/app/(tenant)/`

## Périmètre exact

**Inclus :**
- Audit de chaque page tenant pour identifier le(s) schema(s) attendu(s)
- Helper `buildPageJsonLd({ pageType, tenant, data })` dans `@medsite/seo` qui retourne un tableau de schemas dédupliqués
- Injection unique par page via `<JsonLd graph={…}>` au niveau du layout ou du `page.tsx` (jamais dans les blocs eux-mêmes)
- BreadcrumbList systématique sur toutes les pages internes
- WebSite avec SearchAction sur la home si le tenant a un blog

**Exclus :**
- Refonte des générateurs eux-mêmes (déjà OK)
- Schemas spécifiques (Event, Recipe, Product…) — restent hors scope V1

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `packages/seo/src/build-page-jsonld.ts` | nouveau — agrégateur |
| `packages/seo/src/__tests__/build-page-jsonld.test.ts` | nouveau |
| `packages/seo/src/index.ts` | modifié — export |
| `apps/web/src/app/(tenant)/page.tsx` | modifié — utilise le helper |
| `apps/web/src/app/(tenant)/actes/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/actes/[slug]/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/blog/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/blog/[slug]/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/contact/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/p/[slug]/page.tsx` | modifié |

## Étapes d'implémentation

1. Définir un type `PageJsonLdInput` discriminé : `{ type: 'home' | 'article' | 'service' | 'service-list' | 'faq' | 'contact' | 'page', … }`.
2. Implémenter `buildPageJsonLd()` qui appelle les bons générateurs et retourne un graph `{ '@context': 'https://schema.org', '@graph': [...] }`.
3. Pour chaque page, retirer toute injection JSON-LD existante au niveau bloc (audit grep `application/ld+json`), remplacer par un seul appel page-level.
4. Tester sur `https://search.google.com/test/rich-results` au moins 3 pages échantillon.

## Critères de done

- [ ] Aucune page ne duplique un schema (vérifié via vue source)
- [ ] BreadcrumbList présent sur toutes les pages internes
- [ ] Test Rich Results passe sans erreur sur home, blog/[slug], actes/[slug], faq
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts
- [ ] Tests unitaires couvrent les 7 types de page

## Risques connus

- Doublon avec injection bloc : faire un grep exhaustif avant la refacto, sinon Google peut sanctionner.
- Pages `/p/[slug]` (templates) : le type dépend du slug — prévoir un mapping slug → pageType ou un champ `seoType` dans Pages.

## Tests à ajouter

- Unitaires : `buildPageJsonLd` pour chaque pageType
- E2E : assertion que chaque route tenant a exactement 1 balise `<script type="application/ld+json">`

## Estimation

0,5 jour.
