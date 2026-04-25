# Dette technique

> Sévérité : CRITICAL (< 1 semaine) | HIGH (trimestre) | MED (au fil de l'eau) | LOW (opportuniste)
> Maintenu par l'agent `tech-debt-tracker`. Ajouts manuels OK aussi.

## Critical

### `apps/platform` n'est qu'un placeholder
- **Détecté** : 2026-04-25 (audit global pré-roadmap)
- **Symptôme** : `apps/platform/src/app/page.tsx` contient juste "Super admin — placeholder. Implementation to come.". L'app est démarrée par `pnpm dev` (port 3002) et figure dans `pnpm-workspace.yaml`, mais ne sert rien d'utile.
- **Risque** : impossible d'ouvrir aux early adopters — pas de dashboard, messages, gestion d'abonnement, support.
- **Action** : chantier [`docs/roadmap/00-platform-scope.md`](roadmap/00-platform-scope.md) (3 j). À traiter avant ou en parallèle du #05.

### Praticien connecté à Payload ne voit aucune collection
- **Détecté** : 2026-04-25 (vérification utilisateur)
- **Symptôme** : un user `practitioner` connecté à `apps/admin` voit la nav "Mon site" mais aucune collection (Profil, Actes, Pages, Horaires, Médias, Réglages) ne s'affiche / est éditable. Toutes les `access.read` retournent `false` parce que `user.tenantId` est null.
- **Cause** : (a) `packages/db/src/seed.ts` ne seed aucun compte Payload — les `email` du seed sont des infos métier de tenants, pas des comptes auth ; (b) le first-user wizard Payload crée le user avec `defaultValue: 'practitioner'` mais sans `tenantId` ; (c) `Practitioners.access.create = superAdminOnly` empêche un praticien de créer son propre profil.
- **Risque** : produit inutilisable pour un early adopter — bloquant pour la Phase 1.
- **Action** : chantier [`docs/roadmap/23-acces-praticien-payload.md`](roadmap/23-acces-praticien-payload.md) (1,5 j). Seed users + endpoint signup + ajustement access control.

### ~~R2 storage plugin mal configuré~~ — résolu / désuet
- **Détecté** : pré-2026 (mémoire bootstrap, CLAUDE.md §5)
- **Vérification 2026-04-25** : `apps/admin/src/payload.config.ts:117` utilise déjà `endpoint: process.env.CLOUDFLARE_R2_ENDPOINT`. Le warning de la mémoire datait d'une version antérieure du payload.config.
- **Action** : aucune. Mettre à jour CLAUDE.md §5 pour retirer la mention TODO et mettre à jour la mémoire bootstrap (`todo_r2_endpoint.md`).

## High

### Pas de coverage gate sur `packages/billing` ni `packages/db`
- **Détecté** : 2026-04-25
- **Symptôme** : aucune couverture mesurée, packages les plus sensibles (paiement Stripe + isolation tenant RLS) reposent sur ~ 3 specs Vitest chacun. Régression silencieuse possible.
- **Risque** : un bug paiement coûte de l'argent et casse la confiance ; un bug RLS = leak inter-tenant catastrophique en santé.
- **Action** : activer `vitest --coverage` et threshold 80 % lines / 70 % branches sur ces 2 packages, étendre les fixtures (mocks Stripe events, fixture multi-tenant pour RLS). 1 j.

### Aucun E2E sur `apps/admin` ni `apps/platform`
- **Détecté** : 2026-04-25
- **Symptôme** : seuls 4 specs Playwright dans `apps/web/e2e/`. Toutes les régressions admin (Payload, blocs, presets) ou platform (post-#00) passent sous le radar.
- **Risque** : casser silencieusement le parcours d'édition praticien.
- **Action** : ajouter à minima 1 spec smoke par app (login → dashboard, login → édition page → publish). Couvert partiellement par #04 (E2E templates) côté admin. 1 j résiduel post-#00 et #04.

### Audit sécurité formel manquant
- **Détecté** : 2026-04-25
- **Symptôme** : `docs/security/` est vide. Stack manipule données santé (RGPD article 9 — sensibles), facturation, multi-tenant. Aucun audit formel documenté.
- **Risque** : non-conformité RGPD, exposition juridique. HDS éventuellement requis selon la donnée stockée.
- **Action** : faire tourner `/security-review` sur la branche, produire `docs/security/audit-<date>.md`, traiter critical/high. Avant ouverture early adopters. 1 j initial + corrections.

## Medium

### Process migrations Payload non documenté
- **Détecté** : 2026-04-25
- **Symptôme** : `apps/admin` utilise `push: false` (correct pour prod) mais `docs/ops/runbook.md` ne décrit pas la procédure : générer migration, review, apply en prod via `DATABASE_MIGRATE_URL` (Neon direct, pas pooled). Dev nouveau qui touche un schema risque de pousser direct.
- **Risque** : migration mal appliquée, downtime ou corruption.
- **Action** : ajouter section "Migrations Payload" au runbook, avec checklist et commandes. ~ 2 h.

### Validation visuelle locale absente
- **Détecté** : roadmap #01 (déjà identifié)
- **Symptôme** : aucun outil pour visualiser l'état des 30 presets en local d'un coup → diffs visuels passent inaperçus jusqu'au merge.
- **Action** : chantier [`docs/roadmap/01-validation-visuelle.md`](roadmap/01-validation-visuelle.md). 0,5 j.

## Low

### Pas de sentinelle "TODO/FIXME" en CI
- **Détecté** : 2026-04-25
- **Symptôme** : aucun grep CI qui empêche les TODO de s'accumuler. Aujourd'hui repo propre (3 TODO, tous en docs), mais rien n'empêche la dérive.
- **Action** : ajout d'un step CI `grep -rn "TODO\|FIXME" apps packages | wc -l ; fail si > 5` ou similaire. 30 min, opportuniste.

## Resolved (archive 30 jours avant suppression)
