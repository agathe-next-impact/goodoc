# Chantier 14 — Blocs additionnels (Gallery, Timeline, Video, Stats)

## But

Étendre la bibliothèque `@medsite/templates` avec 4 nouveaux blocs validés et intégrés au registry, à Payload, et à au moins 1 thème : `gallery` (galerie photos cabinet), `timeline` (parcours / formation praticien), `video` (vidéo de présentation YouTube/Vimeo), `stats` (chiffres clés type "5000 patients suivis").

## Pré-requis

- Système de blocs `@medsite/templates` opérationnel (Phases 2-8 closes)
- Convention bloc documentée (Zod schema + composant React + side-effect register dans `blocks/index.ts`)
- Mirror Payload (`apps/admin/src/collections/_page-blocks/blocks.ts`) à jour

## Périmètre exact

**Inclus :**
- 4 blocs nouveaux dans `packages/templates/src/blocks/` : `gallery.tsx`, `timeline.tsx`, `video.tsx`, `stats.tsx`
- Schema Zod pour chacun (validation des données)
- Mirror Payload : 4 blocs miroirs avec champs équivalents
- Au moins 1 preview screenshot dans `docs/templates/screenshots/`
- Intégration dans 2 thèmes existants minimum (un médical + un wellness)
- 2 nouvelles compositions de presets utilisant ces blocs (page /a-propos enrichie, page /clinique)

**Exclus :**
- Blocs interactifs avancés (formulaire custom, calendrier custom) — V2
- Player vidéo custom (on s'appuie sur iframe YouTube/Vimeo)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `packages/templates/src/blocks/gallery.tsx` | nouveau |
| `packages/templates/src/blocks/timeline.tsx` | nouveau |
| `packages/templates/src/blocks/video.tsx` | nouveau |
| `packages/templates/src/blocks/stats.tsx` | nouveau |
| `packages/templates/src/blocks/index.ts` | modifié — register |
| `packages/templates/src/__tests__/blocks/*.test.tsx` | nouveau (1 test par bloc) |
| `apps/admin/src/collections/_page-blocks/blocks.ts` | modifié — 4 mirrors |
| `packages/templates/src/themes/medical-classic.ts` | modifié — adopte 2 blocs |
| `packages/templates/src/themes/warm-wellness.ts` | modifié |
| `packages/templates/src/presets/pages.ts` | modifié — 2 nouveaux presets |
| `docs/templates/screenshots/gallery.png` | nouveau |
| `docs/templates/screenshots/timeline.png` | nouveau |
| `docs/templates/screenshots/video.png` | nouveau |
| `docs/templates/screenshots/stats.png` | nouveau |

## Étapes d'implémentation

1. **Gallery** : props `{ images: { src, alt, caption? }[], layout: 'grid' | 'masonry' }`. Lightbox simple via state local (pas de lib lourde).
2. **Timeline** : props `{ items: { year, title, description, icon? }[] }`. Verticale desktop, horizontale scrollable mobile.
3. **Video** : props `{ provider: 'youtube' | 'vimeo', videoId, title, thumbnail? }`. Lazy load via facade pattern (clic → embed) pour le LCP.
4. **Stats** : props `{ items: { value: string, label: string, icon? }[] }`. Animation count-up optionnelle (Intersection Observer).
5. Pour chaque bloc : Zod schema, composant React, side-effect register, mirror Payload, test unitaire de rendu.
6. Mettre à jour 2 thèmes pour intégrer ces blocs dans leurs presets.

## Critères de done

- [ ] 4 blocs registered et utilisables dans Payload
- [ ] Total blocs `@medsite/templates` = 17 (était 13)
- [ ] 2 thèmes utilisent ≥ 2 nouveaux blocs
- [ ] Tests unitaires (Vitest) pour chaque bloc : rendu de base + props variantes
- [ ] WCAG AA respecté (alt sur images gallery, transcripts pour video)
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts
- [ ] Screenshots ajoutés à la doc

## Risques connus

- Lightbox gallery : tentation d'ajouter une lib (yet-another-react-lightbox) → privilégier une implémentation minimale CSS+state pour bundle.
- Video facade : un mauvais lazy-load tue le LCP. Utiliser `loading="lazy"` + `<picture>` thumbnail.
- Stats count-up : Intersection Observer à débouncer ; vérifier que le SSR rend la valeur finale (no-flash).

## Tests à ajouter

- Unitaires : 4 specs (un par bloc), assertions de rendu et props
- E2E : 1 spec "page enrichie avec les 4 nouveaux blocs s'affiche correctement"

## Estimation

2 jours.
