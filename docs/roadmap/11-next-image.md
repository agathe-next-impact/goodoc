# Chantier 11 — Optimisation images via `next/image`

## But

Tous les rendus d'images dans `apps/web` (templates, blog, médias praticien) passent par `next/image` avec `sizes`, `priority` sur le hero LCP, et un loader R2 custom qui sert les variantes WebP/AVIF générées au build. Objectif Lighthouse : LCP < 2,5 s sur 3G, CLS < 0,1.

## Pré-requis

- R2 endpoint correctement configuré (cf. dette technique R2 — `R2_PUBLIC_URL` actuellement utilisé comme endpoint à corriger en `R2_ENDPOINT`)
- `apps/web/next.config.ts` autorise le bucket R2 dans `images.remotePatterns`
- Chantier 03 (Lighthouse CI) opérationnel pour mesurer

## Périmètre exact

**Inclus :**
- Audit grep `<img ` dans `apps/web/src` et `packages/templates/src/blocks/` → liste exhaustive des restes
- Remplacement par `<Image>` avec `sizes` adapté à chaque emplacement (hero full-width, card, avatar, thumbnail)
- Loader R2 custom dans `apps/web/src/lib/image-loader.ts` qui génère des URLs avec query `?w=<width>&q=<quality>&fmt=webp`
- Configuration `next.config.ts` : `images.deviceSizes`, `images.imageSizes`, `images.formats: ['image/avif', 'image/webp']`
- `priority` uniquement sur la 1re image hero de chaque page (LCP candidate)
- `placeholder="blur"` avec `blurDataURL` généré au seed pour les images de demo

**Exclus :**
- Pipeline serveur de redimensionnement custom (on s'appuie sur Vercel Image Optimization en prod)
- Migration des médias Payload existants (déjà OK car ils passent par Media collection)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/web/next.config.ts` | modifié |
| `apps/web/src/lib/image-loader.ts` | nouveau |
| `packages/templates/src/blocks/hero-split.tsx` | modifié |
| `packages/templates/src/blocks/about-hero.tsx` | modifié |
| `packages/templates/src/blocks/practitioner-card.tsx` | modifié |
| `packages/templates/src/blocks/testimonials-grid.tsx` | modifié |
| `packages/templates/src/blocks/partner-logos.tsx` | modifié |
| `packages/templates/src/blocks/services-grid.tsx` | modifié |
| `apps/web/src/app/(tenant)/blog/[slug]/page.tsx` | modifié |
| `apps/web/src/app/(tenant)/actes/[slug]/page.tsx` | modifié |

## Étapes d'implémentation

1. Grep `<img ` sur tout `apps/web` et `packages/templates`. Documenter chaque cas dans une table avant remplacement.
2. Implémenter le loader R2 (fonction pure `({ src, width, quality }) => string`).
3. Migrer bloc par bloc, ajouter `sizes` (ex. hero : `100vw`, cards : `(max-width: 768px) 100vw, 50vw`).
4. Ajouter `priority` sur la 1re `<Image>` du hero. Vérifier qu'il n'y en a qu'une par page.
5. Mesurer Lighthouse avant/après sur 3 pages échantillon (home tenant, blog/[slug], actes/[slug]).

## Critères de done

- [ ] Zéro `<img ` restant dans `apps/web/src` et `packages/templates/src/blocks` (sauf cas justifiés en commentaire : SVG inline, etc.)
- [ ] Lighthouse LCP < 2,5 s sur la home (mesure via #03)
- [ ] CLS < 0,1
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts
- [ ] E2E vérifie qu'aucun `<img>` natif n'est rendu sur la home

## Risques connus

- Vercel Image Optimization a un coût hors plan — vérifier la facturation prévisible.
- `priority` posé par erreur sur plusieurs images = pénalité LCP. Valider avec audit Lighthouse.
- Logos partenaires souvent trop petits pour Image (overhead) → garder `<img>` si < 96 px et documenter.

## Tests à ajouter

- Unitaire : loader R2 produit bien l'URL attendue avec divers params
- E2E : Playwright vérifie le `currentSrc` du LCP sur la home contient `webp` ou `avif`

## Estimation

0,5 jour.
