# MedSite — Plateforme SaaS multi-tenant pour professionnels de santé

> Ce fichier est chargé automatiquement par Claude Code au démarrage d'une session. Il définit le contexte projet, les conventions et les règles de travail.
>
> Sections complétées par `/onboard` le 2026-04-25.

## Domaine

MedSite (repo `goodoc`) — SaaS qui génère des sites web vitrines pour médecins/professionnels de santé. Multi-tenant (un compte = un site), tenant principal résolu par hostname/sous-domaine. Intégrations Stripe (abonnement), Doctolib (prise de rendez-vous), Cloudflare R2 (médias), Resend (email), Plausible (analytics).

**Sensibilités** : données santé (mention "medical/patient" dans le code), facturation Stripe, multi-tenant strict (RLS Postgres) — toute évolution de schéma DB ou de middleware doit considérer l'isolation tenant.

## Mode de fonctionnement

Ce kit applique par défaut un **mode legacy-friendly** :

1. **Audit = diff courant** par défaut. Les agents ne scannent pas tout le repo sauf demande explicite (`/audit-global`).
2. **Boy Scout Rule** : le code nouvellement ajouté respecte les conventions cibles. Le code modifié est amélioré localement sans refacto massive. Le code non touché est laissé tranquille.
3. **Dette technique trackée** : voir `/docs/tech-debt.md`. L'agent `tech-debt-tracker` alimente ce fichier sans forcer les corrections.
4. **Nouveautés = cible stricte** : tout nouveau fichier, route, endpoint, composant respecte les conventions documentées ici.

## 1. Stack

| Couche | Technologie | Version | Notes |
| --- | --- | --- | --- |
| Runtime | Node | `>=20` (CI sur 20) | |
| Package manager | pnpm | `10.0.0` (workspaces) | |
| Langage | TypeScript | `5.7.3` | mode strict : **oui** (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`) |
| Framework | Next.js | `15.5.15` (App Router, React 19) | 3 apps : `web`, `admin`, `platform` |
| Styling | Tailwind CSS | `3.4.17` | config partagée via `packages/config/tailwind.config.ts` |
| CMS / Data | Payload CMS + Drizzle ORM | Payload `3.11.0`, Drizzle `0.38.4` | Payload monté sous `apps/admin` ; `packages/db` expose les schemas Drizzle |
| Database | PostgreSQL | `16` | RLS activé (`packages/db/rls.sql`), Neon en prod (URL pooled vs direct) |
| Tests | Vitest + Playwright | Vitest `2.1.8`, Playwright `1.49.1` | E2E dans `apps/web/e2e/`, couverture non mesurée |
| Monorepo | Turborepo + pnpm workspaces | Turbo `2.3.3` | `apps/*` + `packages/*` |
| CI | GitHub Actions | `.github/workflows/ci.yml` | typecheck, lint, unit, e2e (Postgres service) |
| Hosting | Vercel (apps Next) + Neon (DB) + Cloudflare R2 (médias) + Resend (email) | | cf. `globalEnv` dans `turbo.json` |

## 2. Structure du repo

```
goodoc/
├── apps/
│   ├── admin/          # Payload CMS (port 3001) — back-office, génération de types Payload
│   ├── platform/       # Espace tenant / dashboard médecin (port 3002)
│   └── web/            # Front public multi-tenant + marketing (port 3003) — middleware host→tenant
├── packages/
│   ├── analytics/      # Plausible wrapper
│   ├── billing/        # Stripe (abonnement, webhooks)
│   ├── config/         # tsconfig.base.json, tailwind config, env Zod (env.ts)
│   ├── db/             # Drizzle schemas, migrations, RLS, seed
│   ├── doctolib/       # Intégration Doctolib (prise de RDV)
│   ├── email/          # Resend templates
│   ├── seo/            # Générateurs schema.org JSON-LD (avantage compétitif principal)
│   ├── templates/      # Système de blocs/templates pour les sites médecin (Phases 2-8 — voir docs/roadmap/)
│   ├── types/          # Types partagés ; re-exporte les schemas drizzle-zod depuis @medsite/db
│   └── ui/             # Composants Goodoc partagés (consommés par web + platform)
├── docs/
│   ├── roadmap/        # 22 chantiers du système de templates
│   ├── audits/ ops/ testing/ releases/ security/ design-system/
│   ├── tech-debt.md  overlays.md  installation-et-deploiement.md
│   └── ops/runbook.md
├── prompts/            # Prompts FR numérotés (workflow : `claude "$(cat prompts/NN-…md)"`)
├── docker-compose.yml  # Postgres 16 local
├── turbo.json          # déclare globalEnv (DATABASE_URL, PAYLOAD_SECRET, STRIPE_*, R2_*, …)
└── pnpm-workspace.yaml
```

## 3. Conventions actuelles — à documenter honnêtement

### Conventions du projet telles qu'elles sont

- **TypeScript mode** : strict full (`strict: true`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, `noImplicitReturns`). Pas de `declaration: true` dans la base — casse les types inférés `drizzle-zod`.
- **Style de code** : ESLint flat config par app/package (`eslint.config.mjs`) + `eslint-config-next`. Pas de Prettier explicite, mais Next/ESLint impose le style. `next lint --max-warnings 0` (zéro warning toléré).
- **Validation** : Zod aux frontières (env validé au boot via `packages/config/src/env.ts`, schemas `drizzle-zod` exposés par `@medsite/types`).
- **Direction des dépendances** : `@medsite/types` → `@medsite/db` (les types re-exportent les schemas drizzle-zod, pas l'inverse).
- **Routing tenant** : middleware Next 15 edge-safe — parsing hostname uniquement, lookup DB déféré aux RSC via `getTenant()`. Marketing géré par rewrite vers `/marketing/*` (pas `_marketing` — `_folder` est privé en Next 15).
- **Commits** : libre, mais récents `fix:`/`feat:` ponctuels. Pas de Conventional Commits enforced. Préfixer quand le changement le mérite.
- **Branches** : trunk-based (`main` = branche par défaut CI). Pas de git-flow.
- **Tests** : recommandés mais non bloquants — pas de coverage gate, plusieurs packages sans tests. E2E Playwright sur `apps/web` (chromium + webkit).

### Conventions cibles (pour tout nouveau code)

- TypeScript strict : zéro `any` en green lines, signatures explicites sur fonctions exportées
- Validation des données externes via un schema validator (Zod, Valibot, etc.) aux frontières
- Tests sur tout nouveau flow critique
- Commits explicites avec message descriptif
- Accessibilité WCAG 2.2 AA sur composants UI
- Pas de secret en clair, secrets via variables d'environnement

## 4. Commandes du projet

```bash
# Dev (lance les 3 apps Next en parallèle : admin :3001, platform :3002, web :3003)
pnpm dev
# Cibler une app : pnpm --filter @medsite/web dev

# DB locale (Postgres 16 via docker-compose, lit .env.local)
docker compose up -d db
pnpm db:generate     # Drizzle: génère les migrations depuis le schema
pnpm db:migrate      # applique les migrations
pnpm db:seed         # seed dev

# Payload (admin) — types & migrations CMS
pnpm --filter @medsite/admin generate:types
pnpm --filter @medsite/admin payload:migrate:create
pnpm --filter @medsite/admin payload:migrate

# Build
pnpm build

# Lint / Typecheck (zéro warning toléré côté Next lint)
pnpm lint
pnpm typecheck

# Tests
pnpm test                                 # vitest (unit) — tous packages
pnpm --filter @medsite/web test:e2e       # playwright (chromium + webkit)
```

## 5. Variables d'environnement

Source de vérité : [`.env.example`](.env.example) (validation Zod au boot dans `packages/config/src/env.ts` — process crash si manquant/malformé). Copier vers `.env.local` (gitignored).

| Variable | Obligatoire | Notes |
| --- | --- | --- |
| `NODE_ENV` | oui | `development` / `production` / `test` |
| `NEXT_PUBLIC_APP_URL` | oui | URL publique exposée au browser (pas de secret) |
| `DATABASE_URL` | oui | Postgres 16 local ou Neon **pooled** en prod |
| `DATABASE_MIGRATE_URL` | prod uniquement | Neon **direct/unpooled** — utilisé seulement par `pnpm db:migrate` et `psql < packages/db/rls.sql`, jamais par l'app |
| `PAYLOAD_SECRET` | oui | ≥ 32 chars, `openssl rand -hex 32`, ne jamais réutiliser entre envs (rotation invalide les sessions admin) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | oui | `sk_test_…` en dev, `sk_live_…` en prod ; whsec récupéré au moment de créer le webhook Stripe |
| `RESEND_API_KEY` | oui | domaine `medsite.fr` doit être validé SPF/DKIM/DMARC dans Resend avant prod |
| `CLOUDFLARE_R2_ACCESS_KEY` / `_SECRET_KEY` / `_BUCKET` / `_ENDPOINT` / `_PUBLIC_URL` | oui | token R2 scope-bucket ; ⚠ TODO documenté en mémoire : le storage plugin S3 utilise pour l'instant `_PUBLIC_URL` comme endpoint au lieu de `_ENDPOINT` |
| `PLAUSIBLE_API_KEY` | optionnel | uniquement si `@medsite/analytics` est activé |
| `CRON_SECRET` | requis dès qu'un endpoint cron (trial-expiry, payment-retry) est exposé | `openssl rand -hex 32` ; Vercel Cron envoie `Authorization: Bearer <…>` |

`turbo.json` déclare ces vars dans `globalEnv` — les ajouter là quand on en introduit une nouvelle, sinon Turbo cache invalide silencieusement.

## 6. Règles impératives pour Claude

1. **Audit = diff courant** par défaut. Audit global uniquement sur `/audit-global`.
2. **Nouveau code respecte la cible**. Pas de justification "pour rester cohérent avec l'existant".
3. **Code modifié** : Boy Scout Rule — amélioration locale si faisable sans cascade.
4. **Ne jamais désactiver silencieusement** un test, un type check, un lint rule pour "faire passer". Toujours expliquer et discuter.
5. **Dette détectée hors scope** : noter dans `/docs/tech-debt.md`, ne pas bloquer la PR.
6. **Critical findings** (secret en clair, faille sécurité avérée) : **toujours signalés** même hors scope, même sur code legacy non touché.
7. **Secrets** : jamais committés, `.env.local` gitignored.
8. **Commits** : un commit = un changement logique, message clair.

## 7. Subagents disponibles

Voir `.claude/agents/`. Catégories :

- **engineering** — TypeScript, DevOps, pont framework (overlay)
- **performance** — Core Web Vitals, bundle, cache
- **design** — UI, accessibilité, design system
- **security** — secrets, validation, headers, supply chain
- **testing** — stratégie de tests, E2E
- **project-management** — sprint, release, dette technique

## 8. Slash-commands disponibles

- `/onboard` — audit initial, remplissage de ce fichier
- `/review-pr` — revue multi-agent du diff
- `/audit-global` — audit global (opt-in, long)
- `/migrate-pattern` — migration incrémentale d'un pattern hérité vers cible
- `/release-check` — checklist pré-déploiement

## 9. Ce kit est universel — overlays recommandés

Ce kit est volontairement stack-agnostique. Pour plus de puissance, appliquer un **overlay** dédié à ta stack :

- Astro + Payload
- Next.js + Payload
- WordPress Headless + Next.js
- SaaS santé (HDS, RGPD renforcé, multi-tenant)
- Etc.

Un overlay ajoute des agents stack-spécifiques (framework, CMS, paiement, multi-tenant) et peut remplacer certains agents universels par leur version spécialisée. Voir `/docs/overlays.md` (sera rempli si un overlay est appliqué).
