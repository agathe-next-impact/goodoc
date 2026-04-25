# Chantier 13 — Open Graph automatique

## But

Chaque page tenant expose des balises Open Graph et Twitter Card complètes (`og:title`, `og:description`, `og:image`, `og:type`, `twitter:card`, etc.) avec une image OG **générée dynamiquement** à la volée via Next.js `ImageResponse` à partir des données du tenant (nom praticien, spécialité, photo). Objectif : partage propre sur LinkedIn, WhatsApp, Twitter/X, Slack.

## Pré-requis

- `generateMetadata()` existe sur toutes les pages tenant
- `@medsite/seo` expose des helpers OG partiels — auditer ce qui est présent

## Périmètre exact

**Inclus :**
- Helper `buildOgMetadata({ tenant, page, override? })` qui retourne un `Metadata.openGraph + Metadata.twitter`
- Route `apps/web/src/app/(tenant)/og/route.tsx` qui génère une image OG 1200×630 via `ImageResponse` (fond aux couleurs du thème, nom + spécialité + photo praticien si dispo, logo MedSite discret)
- Cache 24 h sur l'image OG (`Cache-Control: public, max-age=86400`)
- Fallback statique si génération échoue : `apps/web/public/og-default.png`
- Application sur 4 types de pages : home, blog/[slug], actes/[slug], page custom /p/[slug]

**Exclus :**
- OG par bloc (toujours page-level)
- Personnalisation profonde de l'image (template fixe V1)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/web/src/app/(tenant)/og/route.tsx` | nouveau — ImageResponse |
| `packages/seo/src/build-og-metadata.ts` | nouveau |
| `packages/seo/src/__tests__/build-og-metadata.test.ts` | nouveau |
| `packages/seo/src/index.ts` | modifié — export |
| `apps/web/src/app/(tenant)/page.tsx` | modifié — generateMetadata |
| `apps/web/src/app/(tenant)/blog/[slug]/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/actes/[slug]/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/p/[slug]/page.tsx` | modifié |
| `apps/web/public/og-default.png` | nouveau — fallback |

## Étapes d'implémentation

1. Définir le template visuel de l'image OG (Figma ou maquette ASCII) : titre, sous-titre, photo, badge spécialité.
2. Implémenter la route `og/route.tsx` avec `ImageResponse` ; query params `?type=home&title=…&subtitle=…&photo=…`.
3. Implémenter `buildOgMetadata()` qui produit le bon URL OG selon le type de page et `tenant.slug`.
4. Câbler `generateMetadata()` sur les 4 types de pages.
5. Tester avec [opengraph.xyz](https://www.opengraph.xyz) et le validateur Twitter sur 3 URLs.

## Critères de done

- [ ] Toutes les pages tenant ont `og:image` pointant vers une URL valide qui sert une image 1200×630
- [ ] Twitter Card type `summary_large_image` validée
- [ ] LinkedIn affiche correctement le partage sur 1 URL test
- [ ] Fallback fonctionne si génération échoue (capter via try/catch)
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts
- [ ] Cache-Control posé

## Risques connus

- `ImageResponse` Edge Runtime : pas tous les nodes JSX supportés ; tester en local avant.
- Fonts custom : embarquer en TTF dans `public/` ou utiliser `Inter` chargé via fetch.
- Photo praticien depuis R2 : doit être accessible publiquement (CORS).

## Tests à ajouter

- Unitaire : `buildOgMetadata` produit les bons champs selon page type
- E2E : `GET /og?type=home&…` retourne `Content-Type: image/png` et 1200×630
- Manuel : 3 URLs validées sur opengraph.xyz

## Estimation

0,5 jour.
