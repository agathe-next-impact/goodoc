# Chantier 22 — Export / import JSON tenant

## But

Permettre l'export complet des données d'un tenant (pages, services, blog, médias, settings) en un fichier JSON unique, et l'import inverse. Cas d'usage : portabilité des données (RGPD article 20), backup praticien, migration manuelle entre environnements (staging → prod), seed d'un nouveau tenant à partir d'un tenant template.

## Pré-requis

- Schemas DB stables
- Apps `apps/admin` et `apps/platform` opérationnelles
- Décision : R2 médias inclus dans l'export (URLs ou base64) ? Recommandation V1 : URLs publiques R2 conservées telles quelles, l'import suppose que les médias sont accessibles.

## Périmètre exact

**Inclus :**
- Endpoint `GET /api/admin/tenants/<id>/export` (super-admin only) → fichier JSON `medsite-tenant-<slug>-<date>.json`
- Endpoint `POST /api/admin/tenants/import` qui prend un JSON et crée un nouveau tenant (super-admin only)
- Endpoint `GET /api/platform/export` côté `apps/platform` accessible au praticien (RGPD) → JSON de son propre tenant uniquement
- Schema versionné (`{ schemaVersion: '1.0.0', exportedAt, tenant: {...}, pages: [...], services: [...], ... }`)
- Validation Zod stricte à l'import
- Mode "dry-run" qui retourne un rapport sans écrire
- UI bouton "Exporter mes données" dans `apps/platform/parametres`

**Exclus :**
- Import qui écrase un tenant existant (toujours créer un nouveau tenant V1)
- Export multi-tenant en lot
- Médias inclus en base64 (V2 si demandé)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/admin/src/app/api/admin/tenants/[id]/export/route.ts` | nouveau |
| `apps/admin/src/app/api/admin/tenants/import/route.ts` | nouveau |
| `apps/platform/src/app/api/export/route.ts` | nouveau |
| `apps/platform/src/app/parametres/page.tsx` | modifié — bouton export |
| `packages/db/src/exports/tenant-export.ts` | nouveau — sélecteur DB |
| `packages/db/src/exports/tenant-import.ts` | nouveau |
| `packages/db/src/exports/schema.ts` | nouveau — Zod schema export |
| `packages/db/src/exports/__tests__/round-trip.test.ts` | nouveau |
| `docs/ops/export-import.md` | nouveau |

## Étapes d'implémentation

1. Schema Zod `TenantExportV1` qui décrit la structure cible.
2. Helper `buildTenantExport(tenantId)` qui sélectionne toutes les données via Drizzle, construit l'objet, valide.
3. Helper `applyTenantImport(json)` qui valide, génère un nouveau `tenantId`, insère dans toutes les tables avec ID remappés.
4. Tests round-trip : export → import → ré-export → diff JSON = ∅ (modulo IDs et timestamps).
5. Endpoint admin protégé par rôle super-admin.
6. Endpoint plateforme protégé par session praticien (limite à son tenant).
7. UI parametres : bouton "Télécharger mes données" qui appelle l'endpoint et `<a download>` le fichier.

## Critères de done

- [ ] Export d'un tenant seedé produit un JSON valide selon Zod
- [ ] Import du même JSON sur une DB vide recrée un tenant fonctionnel (visite home → contenu identique)
- [ ] Round-trip test passe en CI
- [ ] Praticien peut télécharger ses données depuis `apps/platform/parametres`
- [ ] Endpoint admin import refusé pour rôle non super-admin (test 403)
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts
- [ ] Doc ops publiée

## Risques connus

- Tables avec FK vers `tenants.id` : ordre d'insertion strict requis (tenants → users → practitioners → pages → blocks…). Tester sur une vraie DB seedée.
- Médias R2 : l'URL stockée pointe vers le bucket source. Si on importe sur un autre projet R2, les images sont cassées. Documenter.
- Données sensibles dans l'export (emails patients via contact_messages) : peut-être les exclure par défaut, opt-in.

## Tests à ajouter

- Unitaire : Zod schema couvre tous les champs
- Intégration : round-trip sur tenant fixture
- E2E : praticien clique export → fichier téléchargé contient bien sa data

## Estimation

0,5 jour (peut déborder selon le nombre de tables — re-estimer après schema lock).
