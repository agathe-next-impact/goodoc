# Chantier 09 — Drag & drop + workflow draft / publish

## But

Permettre de réordonner les blocs d'une page par drag & drop dans l'éditeur Payload (déjà natif côté Payload, à valider) et asseoir un workflow brouillon → preview → publication propre.

## Pré-requis

- Chantier 02 (Live Preview) idéalement
- `pages.versions.drafts: true` déjà présent dans la config Payload

## Périmètre exact

**Inclus :**
- Validation que le drag & drop natif Payload fonctionne sur le champ `content` (Blocks)
- Ajout d'un bouton « Aperçu brouillon » dans la collection Pages → ouvre `apps/web/<slug>?draft=true` (cf chantier 02)
- Bouton « Publier » qui passe `isDraft: false` et `isPublished: true` en une action
- Indicateur visuel dans la liste des pages : 🟢 publiée, 🟡 brouillon, ⚪ non publiée
- Cache invalidation automatique au publish (revalidateTag)

**Exclus :**
- Versionning Git-like des contenus (Payload Drafts couvre déjà rollback simple)
- Approbation multi-utilisateurs (workflow review)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/admin/src/collections/Pages.ts` | + admin.preview, + listSearchableFields, ajout colonne status |
| `apps/admin/src/app/api/revalidate/route.ts` | nouveau — webhook au save |
| `apps/admin/src/hooks/revalidate.ts` | nouveau — afterChange hook |

## Étapes d'implémentation

### 1. Drag & drop

Le Blocks field de Payload supporte le drag & drop **out of the box**. Test à faire en local :
- Ouvrir une page dans l'admin
- Saisir le handle à gauche d'un bloc
- Le glisser au-dessus / en dessous

Si OK, **aucun code à écrire**, juste la doc à mettre à jour pour l'utilisateur.

### 2. Bouton Aperçu

```ts
// Pages.ts > admin
preview: (doc) =>
  `${process.env.NEXT_PUBLIC_WEB_URL}/api/preview?secret=${process.env.PREVIEW_SECRET}&slug=${doc.slug}`,
```

Payload affiche automatiquement un bouton "Preview" en haut à droite.

### 3. Hook de revalidation

```ts
// apps/admin/src/hooks/revalidate.ts
import type { CollectionAfterChangeHook } from 'payload'

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  if (!doc.isPublished) return doc
  const tenantId = doc.tenantId
  // Hit le endpoint Next.js qui appelle revalidateTag(`tenant:<id>`)
  const url = `${process.env.NEXT_PUBLIC_WEB_URL}/api/revalidate`
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-revalidate-secret': process.env.REVALIDATE_SECRET ?? '',
    },
    body: JSON.stringify({ tags: [`tenant:${tenantId}`, `pages:${tenantId}`] }),
  }).catch(() => {})
  return doc
}
```

### 4. Endpoint revalidate

```ts
// apps/web/src/app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (request.headers.get('x-revalidate-secret') !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { tags } = await request.json()
  for (const tag of tags ?? []) revalidateTag(tag)
  return NextResponse.json({ ok: true, revalidated: tags })
}
```

### 5. Status visuel dans la liste

Custom column dans `defaultColumns` ou champ virtuel `status` calculé :

```ts
{
  name: 'status',
  type: 'text',
  virtual: true,
  hooks: {
    afterRead: [({ doc }) => {
      if (doc.isPublished) return '🟢 Publiée'
      if (doc.isDraft) return '🟡 Brouillon'
      return '⚪ Non publiée'
    }],
  },
  admin: { readOnly: true },
}
```

## Critères de done

- [ ] Drag & drop des blocs marche dans l'éditeur Payload (validé manuellement)
- [ ] Le bouton « Preview » dans la barre d'outils ouvre la page en mode draft
- [ ] Le bouton « Publier » bascule `isDraft: false` + `isPublished: true`
- [ ] Le cache Next.js est invalidé en < 5 s après publish
- [ ] La liste des pages affiche le status visuel
- [ ] `pnpm typecheck && pnpm lint && pnpm test` passe

## Risques connus

- Le `revalidateTag` ne fonctionne que sur la même app Next.js qui a écrit le cache → l'endpoint doit vivre dans `apps/web`, pas dans `apps/admin`.
- Si `REVALIDATE_SECRET` n'est pas configuré, on accepte les requêtes en silence — ne JAMAIS faire ça en prod ; le check doit refuser strictement.
- Drag & drop peut être laggy sur les pages avec 20+ blocs ; pas un blocker en V1.

## Tests à ajouter

- Unitaire : `revalidateAfterChange` ne fait rien si `isPublished: false`
- E2E : sauver une page en draft → URL publique → 404. Publier → URL publique → 200 sous 5 s.

## Estimation

0,5 jour.
