---
description: Audit initial du projet à la première session Claude Code. Découvre la stack, remplit les `<À REMPLIR>` de CLAUDE.md, initialise /docs/.
argument-hint: (aucun argument)
---

**Commande exécutée à la toute première session sur ce projet.**

Pipeline :

## Phase 1 — Discovery

Explore le repo et identifie :

1. **Package manager et runtime**
   - `package.json` : scripts, dépendances principales
   - `pnpm-workspace.yaml`, `yarn.lock`, `package-lock.json`, `bun.lockb` → manager
   - `.nvmrc`, `engines.node` → version Node
   - Si Bun ou Deno → adapter

2. **Framework(s)**
   - `next.config.*` → Next.js (App Router ou Pages Router ?)
   - `astro.config.*` → Astro
   - `remix.config.*` ou `vite.config.*` + `@remix-run` → Remix
   - `svelte.config.*` → SvelteKit
   - `nuxt.config.*` → Nuxt
   - Framework backend séparé ?

3. **CMS / Data layer**
   - `@payloadcms/*` → Payload
   - `@sanity/*`, `sanity.config.*` → Sanity
   - `@directus/*` → Directus
   - `@strapi/*` → Strapi
   - ORM : Drizzle, Prisma, TypeORM, Mongoose
   - Raw DB : pg, mysql2, sqlite3, etc.

4. **Structure du monorepo**
   - `pnpm-workspace.yaml` ou `turbo.json` ou `nx.json`
   - Liste des apps/packages

5. **Styling**
   - `tailwind.config.*` → Tailwind
   - `*.module.css` → CSS modules
   - `styled-components` / `@emotion` → CSS-in-JS
   - Design system : shadcn, Radix, Headless UI, Ark UI, maison

6. **Tests**
   - `vitest.config.*`, `jest.config.*`, `playwright.config.*`, `cypress.config.*`
   - Dossier `tests/`, `__tests__/`, `*.spec.*`, `*.test.*`
   - Couverture actuelle si visible (rapport récent)

7. **CI / CD**
   - `.github/workflows/`, `.gitlab-ci.yml`, `bitbucket-pipelines.yml`
   - Hosting : `vercel.json`, `netlify.toml`, `wrangler.toml`, `fly.toml`, `Dockerfile`

8. **Qualité existante**
   - `.eslintrc.*` → config lint
   - `tsconfig.json` : strict activé ou non ?
   - Hooks pre-commit : `.husky/`, `lefthook.yml`
   - `.editorconfig`, `.prettierrc`

9. **Sensibilités particulières**
   - Tables `audit_logs`, `gdpr_*`, mentions "HDS", "RGPD", "compliance" dans docs ou code → projet à compliance renforcée
   - `stripe-*`, `Stripe.` → paiements
   - `tenant_id`, `workspace_id`, `org_id` dans le schéma → multi-tenant
   - Mention de "medical", "health", "patient" → données santé

10. **Conventions de commits et git**
    - Lire les 20 derniers commits pour voir le style
    - Conventional Commits ? Libre ? Traduction équipe ?

## Phase 2 — Remplissage CLAUDE.md

Mettre à jour `CLAUDE.md` en remplaçant tous les `<À REMPLIR>` par les valeurs découvertes.

**Ne pas inventer**. Si une info est ambiguë → laisser `<À CLARIFIER AVEC L'ÉQUIPE>` et demander en fin de session.

Sections à compléter :
- Stack (toutes les lignes du tableau)
- Structure du repo (arborescence niveau 2-3)
- Conventions actuelles (honnêtement, même si loin de l'idéal)
- Commandes du projet (depuis `package.json` scripts)
- Variables d'environnement (depuis `.env.example` + `.env.production` si présent)

## Phase 3 — Création `/docs/`

Créer (si absents) :

```
/docs/
├── tech-debt.md         # initialisé par install-kit.sh, vérifier qu'il existe
├── ops/
│   └── runbook.md       # template si absent
├── testing/
│   └── strategy.md      # template : état actuel des tests + objectif
└── overlays.md          # indique quels overlays sont appliqués (aucun par défaut)
```

Si certains de ces fichiers existent déjà : ne pas écraser, juste signaler.

## Phase 4 — Recommandations overlays

Suggérer à l'utilisateur les overlays pertinents selon la stack détectée :

| Stack détectée | Overlay recommandé |
|---|---|
| Next.js + Payload | `overlays/nextjs-payload` |
| Astro + Payload | `overlays/astro-payload` |
| WordPress Headless + Next.js | `overlays/wp-nextjs` |
| Multi-tenant + Stripe + données santé | `overlays/medsite-saas` |
| Next.js + Payload + legacy / dette visible | `overlays/payload-legacy` |

Si aucun overlay ne colle parfaitement : rester en universel et proposer de construire un overlay custom plus tard.

## Phase 5 — Résumé pour l'utilisateur

En fin de session :

```
✅ Onboarding terminé

📋 Stack identifiée :
  - Framework : <X>
  - CMS : <Y> ou aucun
  - DB : <Z>
  - Monorepo : <oui/non>
  - Tests : <harness présent ou à ajouter>
  
⚠ Points d'attention :
  - <X points nécessitant clarification>

🎯 Prochaines étapes suggérées :
  1. Valider CLAUDE.md (sections remplies automatiquement)
  2. [Si pertinent] Appliquer overlay `<nom>`
  3. Premier `/review-pr HEAD` sur la dernière PR mergée pour calibrer
  
📚 Fichiers créés/mis à jour :
  - CLAUDE.md (complété)
  - /docs/tech-debt.md
  - /docs/ops/runbook.md
  - /docs/testing/strategy.md
  - /docs/overlays.md
```

## Règles

- **Aucun code modifié** pendant l'onboarding (sauf CLAUDE.md et /docs/).
- **Aucune dépendance installée**.
- **Aucun refacto proposé**.
- Juste : découverte + documentation + recommandations.
