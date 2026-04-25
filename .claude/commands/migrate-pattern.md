---
description: Migration incrémentale d'un pattern hérité vers le pattern cible. À utiliser pour traiter un item de la dette technique sans big-bang.
argument-hint: <pattern> [scope: file | dir | all] [target path]
---

Migration d'un pattern spécifique : **$ARGUMENTS**

Exemples :
- `/migrate-pattern typescript-strict src/legacy/api.ts` — passer un fichier en strict
- `/migrate-pattern consolidate-cards` — consolider les composants Card dupliqués
- `/migrate-pattern fetch-to-zod-validated src/api/` — ajouter validation Zod aux endpoints

## Philosophie

La migration se fait par **petits incréments** pour :
- Ne jamais bloquer le reste du développement
- Permettre rollback facile si ça casse
- Valider à chaque étape (tests + preview)
- Livrer dès que possible (pas d'attente "tout migré ou rien")

## Pipeline type

### 1. Cadrage

- Identifier le **pattern cible** (state actuel souhaité)
- Identifier le **pattern source** (ce qu'on veut quitter)
- Lister les **occurrences** (grep + estimation volume)
- Estimer **l'effort** par occurrence et total
- Identifier les **risques** (API qui change, types qui casse, tests manquants)

### 2. Plan proposé à l'utilisateur

Présenter un plan en **étapes validables** :

```
Migration : <pattern source> → <pattern cible>

Volume : 23 fichiers, ~400 lignes impactées
Risques : types de retour d'API changent, besoin de tests avant de migrer

Plan proposé :
  Étape 1 (low risk) : ajouter les schémas Zod sans les brancher — 1h
  Étape 2 (medium)   : brancher les schémas sur 3 endpoints les moins utilisés — 2h
  Étape 3            : observer 1 semaine, ajuster
  Étape 4            : migrer les 20 endpoints restants par batchs de 5 — 4h total
  Étape 5            : retirer l'ancien pattern, nettoyer — 1h

Validation à chaque étape avant de passer à la suivante.
```

### 3. Exécution étape par étape

Chaque étape produit **1 commit propre** avec :
- Le code migré pour cet incrément
- Les tests mis à jour / ajoutés
- Un message de commit explicite (`refactor(scope): migrate X to Y — step 2/5`)
- L'entry correspondante dans `/docs/tech-debt.md` marquée comme avancée

### 4. Validation continue

Après chaque étape :
- `pnpm typecheck` vert
- `pnpm test` vert
- `pnpm build` vert
- Smoke test manuel si changement visible
- Demander validation humaine avant l'étape suivante

### 5. Finalisation

Quand toutes les étapes sont faites :
- Documenter le pattern cible dans `CLAUDE.md` si c'est devenu la nouvelle convention
- Marquer l'item comme resolved dans `/docs/tech-debt.md`
- Changelog mis à jour si impact visible

## Patterns fréquents

### `typescript-strict`

Activer progressivement le mode strict sur un fichier ou sous-dossier :

1. `tsconfig.strict.json` avec `include` limité au scope
2. Lancer `tsc --noEmit` et fixer les erreurs
3. Étendre le scope
4. Quand le projet entier passe : merger dans `tsconfig.json` principal

### `consolidate-cards` (ou autre consolidation de composants)

1. Créer le composant cible unique avec tous les variants nécessaires
2. Remplacer progressivement les usages (1 page à la fois)
3. Quand 0 usage de l'ancien : supprimer

### `fetch-to-zod-validated`

1. Créer les schémas Zod pour les payloads actuels
2. Parser en "warn" (log si shape inattendue, mais ne pas throw) pour observer
3. Passer en "strict" (throw si invalide)
4. Retirer les types `as X` devenus inutiles

### `any-eradication` (sur fichier ciblé)

1. Identifier le fichier avec le plus de `any`
2. Typer une fonction à la fois, tester chaque fois
3. Si cascade importante : s'arrêter, documenter la cascade, demander validation

## Anti-patterns

- Big-bang : "je migre tout en une PR" — risque énorme
- Pas de tests avant migration — filet de sécurité manquant
- Migration sans validation intermédiaire — rollback difficile
- Forcer une migration non demandée — priorité business compte

## Output

Pendant l'exécution : log de chaque étape validée.

Après : résumé synthétique dans la PR, update `/docs/tech-debt.md`.
