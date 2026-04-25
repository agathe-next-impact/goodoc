# Chantier 07 — Upload d'images intégré dans les blocs

## But

Aujourd'hui les `imageFields` Payload demandent au praticien de coller une URL — friction inutile. Le but : un bouton "Choisir une image" qui ouvre la collection Media (déjà branchée à R2), sélectionne ou upload une image, et remplit automatiquement `{ url, alt, width, height }` dans le bloc.

## Pré-requis

- R2 configuré (les 5 variables `CLOUDFLARE_R2_*` valides)
- Collection `Media` Payload fonctionnelle
- Chantier 06 idéalement, mais pas bloquant

## Périmètre exact

**Inclus :**
- Composant Payload custom `ImagePicker` qui :
  - ouvre un drawer Payload pour sélectionner depuis Media
  - remplit `url` (depuis `media.sizes.url` ou `media.url`)
  - remplit `alt` (depuis `media.alt` ou champ texte)
  - remplit `width` et `height` (depuis `media.width/height`)
- Remplacement de `imageFields` (group avec 4 fields) par un seul field `type: 'relationship'` to `media` + un hook `beforeChange` qui résout en `{url, alt, width, height}`
- Garder une retrocompat : si l'ancienne forme `{ url, alt }` existe en DB, la respecter

**Exclus :**
- Recadrage / éditeur d'image dans Payload (utiliser ce que propose Sharp out of the box)
- CDN custom : on garde R2 + URL publique configurée

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/admin/src/components/image-picker.tsx` | nouveau |
| `apps/admin/src/collections/_page-blocks/_shared.ts` | refactor `imageFields` |
| `apps/admin/src/hooks/resolve-image.ts` | nouveau — hook beforeChange |
| `apps/admin/src/collections/_page-blocks/blocks.ts` | adapté pour le nouveau pattern |
| `packages/templates/src/blocks/_shared/schemas.ts` | (potentiellement) `imageSchema` accepte les deux shapes |

## Étapes d'implémentation

### 1. Approche choisie

Plutôt que d'écrire un composant custom de zéro (complexe avec Payload UI), utiliser le `type: 'upload'` natif de Payload en `relationship` to `media`, et **transformer côté serveur** au `beforeChange` pour que ce qui finit en DB respecte le shape `{url, alt, width, height}` attendu par les Zod templates.

```ts
// apps/admin/src/collections/_page-blocks/_shared.ts
export const imageFields: Field[] = [
  {
    name: 'media',
    type: 'upload',
    relationTo: 'media',
    label: 'Image',
    admin: { description: 'Sélectionnez ou uploadez une image.' },
  },
  // url, alt, width, height sont écrits par le hook
  { name: 'url', type: 'text', admin: { hidden: true } },
  { name: 'alt', type: 'text', admin: { hidden: true } },
  { name: 'width', type: 'number', admin: { hidden: true } },
  { name: 'height', type: 'number', admin: { hidden: true } },
]
```

### 2. Hook de résolution

```ts
// apps/admin/src/hooks/resolve-image.ts
import type { CollectionBeforeChangeHook } from 'payload'

const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? ''

/**
 * Walks `data.content` (page blocks) and resolves any `image.media`
 * relationship into a denormalized `{url, alt, width, height}` group.
 * Idempotent: if already resolved, leaves the data unchanged.
 */
export const resolveImagesInContent: CollectionBeforeChangeHook = async ({
  data,
  req,
}) => {
  if (!Array.isArray(data?.content)) return data
  for (const section of data.content) {
    await resolveSection(section, req.payload)
  }
  return data
}

async function resolveSection(section: Record<string, unknown>, payload: any) {
  // Cas image direct (hero-split, about-hero, practitioner-card.photo)
  await resolveOne(section, ['image', 'photo'], payload)
  // Cas array d'images (partner-logos.logos[].image)
  if (Array.isArray(section.logos)) {
    for (const logo of section.logos) await resolveOne(logo, ['image'], payload)
  }
}

async function resolveOne(parent: any, keys: string[], payload: any) {
  for (const key of keys) {
    const node = parent[key]
    if (!node?.media) continue
    const mediaId = typeof node.media === 'string' ? node.media : node.media.id
    if (!mediaId) continue
    const media = await payload.findByID({ collection: 'media', id: mediaId })
    if (!media) continue
    parent[key] = {
      ...node,
      url: `${R2_PUBLIC_URL}/${media.filename}`,
      alt: media.alt ?? node.alt ?? '',
      width: media.width,
      height: media.height,
    }
  }
}
```

### 3. Brancher le hook sur Pages

Dans `Pages.ts` :

```ts
hooks: {
  beforeChange: [injectTenantId, autoSlugFromTitle, resolveImagesInContent],
},
```

### 4. Compat Zod

Garder `imageSchema` simple : il continue à attendre `{ url, alt, width?, height? }`. Le hook s'assure que c'est ce qui est persisté. Le champ `media` est ignoré au render.

## Critères de done

- [ ] Dans Payload, sélectionner une image ouvre le drawer Media
- [ ] Après save, la DB contient bien `image: { url, alt, width, height, media: <id> }`
- [ ] Le rendu côté `apps/web` affiche l'image depuis R2
- [ ] Si on supprime la sélection, l'image disparaît du rendu
- [ ] Les pages seedées en mode preset (sans `media`) continuent à fonctionner
- [ ] `pnpm typecheck && pnpm lint && pnpm test` passe

## Risques connus

- Le hook tourne côté serveur Payload, sur Next.js — `payload.findByID` doit être dispo dans ce contexte (`req.payload` correct).
- Performance : pour une page avec 10 images, 10 lookups DB. Optimiser en groupant via `payload.find({ where: { id: { in: [...] }} })`.
- R2 public URL : la concaténation `${R2_PUBLIC_URL}/${filename}` doit matcher la convention de Payload `s3Storage` qui ajoute `prefix: 'media'` (donc `${url}/media/${filename}`). À vérifier.

## Tests à ajouter

- Unitaire : `resolveImagesInContent` sur un fixture de section avec `media: 'abc'` produit `url/alt/width/height`
- E2E : upload d'une image dans Payload → save → check apparaît sur la page publique

## Estimation

1 jour.
