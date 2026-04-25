---
description: Revue multi-agent du diff en cours (ou d'une branche). Scope au diff par défaut, critical hors scope toujours signalés.
argument-hint: [branch | "HEAD"]
---

Revue multi-agent du diff : **$ARGUMENTS** (défaut : HEAD, soit le diff depuis la dernière commit pushée sur main).

## Passes

### 1. TypeScript (`typescript-guardian`)
- `any`, `as any`, `@ts-ignore` ajoutés en green lines → BLOQUANT
- Signatures exportées typées
- Validation Zod/équivalent aux frontières
- Types réinventés vs types générés existants

### 2. Frontend (`frontend-developer`)
- Code idiomatique au framework détecté (pas de mélange Next.js / Astro / Remix)
- Metadata / head présents sur nouvelles pages publiques
- Loading states sur fetch
- Pas de `console.log` oublié

### 3. Performance (`core-web-vitals-optimizer` + `bundle-auditor`)
- Pas de régression CWV significative
- Nouvelles dépendances justifiées (pas de doublon, pas de lib lourde injustifiée)
- Images avec dimensions explicites
- Pas de `cache: 'no-store'` injustifié

### 4. Accessibilité (`accessibility-auditor`)
- HTML sémantique sur nouveaux composants
- Labels, alt, focus visible
- Keyboard nav sur composants interactifs
- `prefers-reduced-motion` respecté si animation

### 5. Design system (`design-system-curator`)
- Pas de composant dupliqué créé (si variant existant faisait l'affaire)
- Tokens utilisés, pas de valeurs en dur récurrentes
- Respect de la structure `ui/` / `features/` / `layout/`

### 6. Sécurité (`security-auditor`)
- Endpoints : signature webhook + validation Zod + auth + rate limit
- Pas de secret en clair
- Pas de `dangerouslySetInnerHTML` avec input user non-sanitize
- CSP / headers préservés

### 7. Tests (`testing-strategist`)
- Nouveau flow critique → test associé
- Pas de test désactivé sans raison
- Pas de `it.skip`, `describe.only` committé

### 8. DevOps (`devops-generic`)
- `.env.example` à jour si nouvelle var ajoutée
- Pas de build cassé (quick vérif des scripts touchés)

## Mode legacy

Pour chaque pass :

- **In-scope** (dans le diff) : violations bloquantes doivent être fixées avant merge
- **Hors scope** : noté par `tech-debt-tracker` dans `/docs/tech-debt.md`
- **CRITICAL hors scope** (secret leak, fuite de données, endpoint public sans auth) : **toujours signalé**, ticket immédiat

## Synthèse finale

Format :

```
📋 Review PR — <branch>

Diff : <N> fichiers modifiés, +<X> -<Y> lignes

🔴 Critical (BLOQUANT)
  ...

🟠 Major (in scope, BLOQUANT)
  ...

🟡 Minor (in scope, discussion)
  ...

🔧 Dette technique ajoutée (hors scope)
  <liste des items ajoutés par tech-debt-tracker>

✅ Passes OK
  TypeScript, Sécurité, Performance, A11y, ...

Recommandation : <merge OK / à corriger / à discuter>
```

## Règles

- **Critical / Major in-scope** → bloquant pour merge
- **Critical hors scope** → ticket immédiat + flagged dans la review
- **Minor** → non-bloquant, suggestion
- **Dette** → toujours documentée, jamais forcée
