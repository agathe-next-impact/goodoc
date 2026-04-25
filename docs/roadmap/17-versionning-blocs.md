# Chantier 17 — Versionning des blocs

## But

Permettre l'évolution d'un schema de bloc sans casser les pages existantes. Quand `hero-split` v1 devient v2 (nouveau champ obligatoire), les pages avec v1 continuent de rendre, et un mécanisme de migration permet de les pousser vers v2 sur action explicite. Garde-fou avant ouverture massive aux praticiens.

## Pré-requis

- Bibliothèque `@medsite/templates` stable
- Décision : versionning par bloc (pas par template entier)

## Périmètre exact

**Inclus :**
- Champ `version: string` (semver) dans le Zod schema de chaque bloc
- Stockage : chaque entrée `pages.content[i]` contient `{ blockType: 'hero-split', version: '1.0.0', data: {…} }`
- Registry étendu : `registerBlock({ type, version, schema, component, migrate? })` avec liste des versions disponibles
- Migration : `migrate?(oldData: PrevSchema): NewSchema` automatique au render si version stockée < version courante (warning console en dev)
- Endpoint `POST /api/admin/migrate-blocks?dryRun=true` qui liste les blocs à migrer (admin only)
- Endpoint `POST /api/admin/migrate-blocks?dryRun=false` qui applique
- Doc : guide auteur "comment versionner un bloc"

**Exclus :**
- Rollback (one-way migration only)
- Branchement par tenant (toutes les pages migrent ensemble)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `packages/templates/src/registry.ts` | modifié — version + migrate |
| `packages/templates/src/types.ts` | modifié — `BlockEntry` avec version |
| `packages/templates/src/migrate.ts` | nouveau |
| `packages/templates/src/__tests__/migrate.test.ts` | nouveau |
| `apps/admin/src/app/api/admin/migrate-blocks/route.ts` | nouveau |
| `apps/web/src/components/render-block.tsx` | modifié — applique migrate au runtime |
| `docs/templates/versionning.md` | nouveau — guide auteur |

## Étapes d'implémentation

1. Ajouter `version: '1.0.0'` au schema Zod de chaque bloc existant (set initiale).
2. Modifier `registerBlock` pour accepter une liste de versions et un `migrate` par version.
3. Au render, lookup par `blockType + version stockée` ; si version < latest, appliquer la chaîne `migrate` jusqu'à latest.
4. Endpoint admin qui parse toutes les `pages.content`, repère les blocs avec version < latest, et soit liste (dryRun) soit applique (UPDATE).
5. Test : créer un faux bloc v1, simuler v2 avec migrate, vérifier le rendu et la migration.

## Critères de done

- [ ] Tous les blocs existants ont `version: '1.0.0'`
- [ ] Endpoint dryRun retourne 0 blocs à migrer (état initial)
- [ ] Test : bloc fictif v1 → v2 avec champ ajouté, migrate produit le bon résultat
- [ ] Doc auteur publiée
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts

## Risques connus

- Migration au render : si la fonction `migrate` est lente, ralentit le SSR. Garder ces fonctions purement synchrones et triviales.
- Stockage version dans `pages.content` peut casser des consommateurs qui n'attendent pas le wrapper `{ blockType, version, data }` → audit avant.

## Tests à ajouter

- Unitaire : chain migrate v1 → v2 → v3 fonctionne
- Intégration : endpoint dryRun retourne le bon décompte

## Estimation

0,5 jour.
