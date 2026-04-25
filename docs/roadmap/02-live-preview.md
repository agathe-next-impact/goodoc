# Chantier 02 — Live Preview Payload

## But

Permettre au praticien d'éditer une page dans Payload et de voir le résultat rendu par `apps/web` en direct (panneau preview à droite de l'éditeur). Réduire la friction : plus besoin de sauvegarder + ouvrir un autre onglet.

## Pré-requis

- Chantier 01 validé (rendu OK sur les 6 slugs)
- Authentification Payload fonctionnelle (déjà en place)
- `apps/web` capable de servir une page tenant en mode draft

## Périmètre exact

**Inclus :**
- Configuration `admin.livePreview` dans `payload.config.ts` pour la collection `Pages`
- Endpoint `apps/web/src/app/api/preview/route.ts` qui accepte un token et active le mode draft
- Route `/p/[slug]` qui lit les drafts de Payload (versions activées) quand le mode draft est actif
- Sortie du mode preview via `clearDraftMode`

**Exclus :**
- Live preview pour les `globals` (SiteSettings, etc.)
- Preview multi-resolution (mobile/desktop split)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/admin/src/payload.config.ts` | + `admin.livePreview` config |
| `apps/admin/src/collections/Pages.ts` | + `admin.preview` URL |
| `apps/web/src/app/api/preview/route.ts` | nouveau |
| `apps/web/src/app/api/exit-preview/route.ts` | nouveau |
| `apps/web/src/app/(tenant)/p/[slug]/page.tsx` | lit drafts si `isDraftMode()` |
| `apps/web/src/lib/queries.ts` | nouvelle query `getPageDraftBySlug` |
| `.env.local` (.env.example aussi) | + `PREVIEW_SECRET` |

## Étapes d'implémentation

### 1. Endpoint preview côté apps/web

```ts
// apps/web/src/app/api/preview/route.ts
import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  const slug = url.searchParams.get('slug')
  if (secret !== process.env.PREVIEW_SECRET || !slug) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  const draft = await draftMode()
  draft.enable()
  return NextResponse.redirect(new URL(`/p/${slug}`, request.url))
}
```

### 2. Configuration côté Payload

Dans `Pages.ts` :

```ts
admin: {
  // …
  livePreview: {
    url: ({ data }) =>
      `${process.env.NEXT_PUBLIC_WEB_URL}/api/preview?secret=${process.env.PREVIEW_SECRET}&slug=${data.slug}`,
    breakpoints: [
      { name: 'mobile', width: 375, height: 667, label: 'Mobile' },
      { name: 'tablet', width: 768, height: 1024, label: 'Tablette' },
      { name: 'desktop', width: 1440, height: 900, label: 'Desktop' },
    ],
  },
},
```

### 3. Lecture des drafts

Modifier `getPublishedPageBySlug` ou créer `getPageBySlug` qui retire la clause `eq(pages.isPublished, true)` quand `draftMode().isEnabled` est vrai. Attention : ne JAMAIS exposer un draft sans `draftMode` activé (sinon fuite d'infos non publiées).

### 4. Variable d'env

`PREVIEW_SECRET` : générer avec `openssl rand -hex 32`. Ajouter au schéma Zod de `packages/config/src/env.ts` (optionnel pour le moment).

## Critères de done

- [ ] L'éditeur Payload affiche un panneau preview à droite
- [ ] Modifier un titre dans Payload met à jour la preview en < 1 s
- [ ] Quitter le mode preview (bouton bleu Next.js) revient au rendu publié
- [ ] Un draft non publié n'apparaît PAS sur l'URL publique
- [ ] `pnpm typecheck && pnpm lint && pnpm test` passe

## Risques connus

- Cross-origin : `apps/web` (`localhost:3003`) iframe-ée depuis `apps/admin` (`localhost:3001`) → `X-Frame-Options: SAMEORIGIN` actuel bloquera. Solution : remplacer par `Content-Security-Policy: frame-ancestors 'self' http://localhost:3001` pour les routes `/p/*`.
- `unstable_cache` peut servir une version stale en preview. Soit désactiver le cache si `draftMode().isEnabled`, soit utiliser `revalidatePath` à chaque save Payload.
- Payload Live Preview ne fonctionne que si l'URL est joignable depuis le navigateur du praticien — ne pas oublier de configurer `NEXT_PUBLIC_WEB_URL` côté admin.

## Tests à ajouter

- Unitaire : `getPageDraftBySlug` retourne un draft uniquement si `isDraft=true`
- Manuel : check fuite (incognito sans cookie draft → page non publiée → 404)

## Estimation

1 jour.
