---
description: Audit global du projet sur un domaine (opt-in, long). Scan complet du repo, pas limité au diff. À utiliser pour faire un état des lieux trimestriel ou avant un changement majeur.
argument-hint: <domain> — typescript | perf | a11y | security | design-system | all
---

Audit global — **domaine : $ARGUMENTS** (défaut : all).

⚠ **Cette commande scan l'ensemble du repo**, pas seulement le diff. C'est long et produit beaucoup d'output. À lancer :

- Trimestriellement pour état des lieux
- Avant une migration majeure (ex. TypeScript strict, migration framework)
- Avant une mise en production importante
- Pour préparer un audit externe

## Pipeline selon domain

### Si `typescript` ou `all`
`typescript-guardian` en mode global :
- Scan tous les `.ts/.tsx/.mts/.cts`
- Top 20 fichiers avec le plus de `any` / `as any`
- Fichiers avec `@ts-ignore` ou `@ts-expect-error`
- Types exportés sans signature explicite
- Plan de migration vers strict si non-strict

### Si `perf` ou `all`
`core-web-vitals-optimizer` + `bundle-auditor` en mode global :
- Lighthouse CI sur pages canari (home + pages principales)
- Top 10 pages avec scores les plus bas
- Analyse bundle complète (`pnpm analyze` ou équivalent)
- Identification des libs > 30 KB gzip
- Doublons de dépendances

### Si `a11y` ou `all`
`accessibility-auditor` en mode global :
- axe-core sur toutes les pages publiques
- Top 20 violations par page
- Heatmap par composant
- Composants sans keyboard nav
- Images sans alt

### Si `security` ou `all`
`security-auditor` en mode global :
- Scan secrets avec gitleaks (ou équivalent)
- Endpoints sans validation Zod
- Endpoints sans rate limit
- Dépendances avec vulnérabilités (pnpm audit)
- Actions GitHub non épinglées
- Variables PUBLIC_* suspectes
- Headers sécurité manquants

### Si `design-system` ou `all`
`design-system-curator` en mode global :
- Composants dupliqués (heuristique nom + code)
- Classes arbitraires Tailwind les plus fréquentes
- Couleurs en dur dans CSS
- Inventaire des composants par dossier

## Output

Fichier généré : `/docs/audits/audit-<domain>-<YYYY-MM-DD>.md`

Format :

```markdown
# Audit <domain> — <date>

## Executive summary
- <3-5 points clés>
- Top 3 priorités d'action

## Findings détaillés

### <Catégorie 1>
<items avec localisation, impact, effort estimé>

### <Catégorie 2>
...

## Plan d'action recommandé
1. [CRITICAL] <item> — à traiter avant prochain deploy
2. [HIGH] <item> — prochain sprint
3. [MED] <item> — prochain trimestre
4. [LOW] <items> — au fil de l'eau

## Dette ajoutée à tech-debt.md
<N items ajoutés>
```

## Règles

- **Ne rien corriger automatiquement**. Documenter, prioriser, proposer.
- Tous les findings hors du niveau "hygiène" sont ajoutés à `tech-debt.md` via `tech-debt-tracker`.
- Le rapport doit être **actionnable** : chaque item a une localisation, un impact, un effort estimé.
- Executive summary partageable avec le management / client (pas trop technique).

## Budget temps

- Un audit `all` complet peut prendre 30-60 min d'exécution (nombreux tool calls).
- Si le projet est très gros (>100 routes, >500 composants), découper en domain par domain.
- Possibilité d'exécuter en tâche de fond et consulter le résultat plus tard.
