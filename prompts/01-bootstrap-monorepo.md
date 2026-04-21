# Prompt 01 — Bootstrap du monorepo

## Contexte
Tu initialises le projet MedSite, une plateforme SaaS multi-tenant de sites web pour professionnels de santé (spécialistes médicaux, paramédicaux, praticiens bien-être). Le projet utilise Payload CMS 3 comme backend/CMS, Next.js 15 App Router comme frontend, PostgreSQL 16 avec Drizzle ORM, le tout dans un monorepo Turborepo.

## Objectif
Créer la structure complète du monorepo avec toutes les configurations de base, prêt à accueillir le développement des features.

## Instructions

### 1. Initialiser le monorepo Turborepo + pnpm workspaces

```
medsite/
├── apps/
│   ├── web/          # Next.js 15 — sites publics praticiens
│   ├── admin/        # Payload CMS 3 — back-office praticien
│   └── platform/     # Next.js — super admin (placeholder)
├── packages/
│   ├── db/           # Drizzle ORM schema + migrations
│   ├── config/       # Configs partagées (TS, ESLint, Tailwind, env)
│   ├── ui/           # Composants React partagés (shadcn/ui)
│   ├── seo/          # Générateurs schema.org JSON-LD
│   ├── doctolib/     # Intégration Doctolib (widget, CTA, fallback)
│   ├── email/        # Templates React Email + Resend
│   ├── billing/      # Stripe subscriptions
│   ├── analytics/    # Plausible + score SEO
│   └── types/        # Types TypeScript + schémas Zod partagés
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.json     # Base config
├── .env.example
├── .gitignore
└── CLAUDE.md
```

### 2. Configurer le package.json racine
- Engine: node >=20, pnpm >=9
- Scripts: dev, build, lint, typecheck, test, db:generate, db:migrate, db:seed
- Turbo pipeline: build dépend de ^build, dev en parallèle

### 3. Configurer TypeScript (strict)
- `packages/config/tsconfig.base.json` : strict, noUncheckedIndexedAccess, paths aliases
- Chaque app/package étend cette base

### 4. Configurer ESLint
- `packages/config/eslint.config.mjs` : flat config ESLint 9
- Règles : no-default-export (sauf pages Next.js), prefer-const, no-unused-vars as error
- Plugin: @typescript-eslint, eslint-plugin-react, eslint-plugin-next

### 5. Configurer Tailwind CSS 4
- `packages/config/tailwind.config.ts` partagé
- Design tokens personnalisés pour la plateforme (couleurs médicales sobres)
- Intégration shadcn/ui

### 6. packages/config/env.ts — Validation des variables d'environnement
Créer un module Zod qui valide toutes les env vars au démarrage :
```typescript
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PAYLOAD_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  RESEND_API_KEY: z.string().startsWith('re_'),
  CLOUDFLARE_R2_ACCESS_KEY: z.string(),
  CLOUDFLARE_R2_SECRET_KEY: z.string(),
  CLOUDFLARE_R2_BUCKET: z.string(),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = envSchema.parse(process.env)
export type Env = z.infer<typeof envSchema>
```

### 7. .env.example
Créer le fichier avec toutes les variables et des commentaires explicatifs.

### 8. apps/web — Next.js 15 App Router
- `next.config.ts` avec : images (Cloudflare R2 domain), experimental (ppr si stable)
- `middleware.ts` placeholder pour la résolution multi-tenant
- `app/layout.tsx` minimal
- `app/page.tsx` placeholder

### 9. apps/admin — Payload CMS 3
- Initialiser Payload CMS 3 avec le template `blank`
- Configurer pour utiliser PostgreSQL via Drizzle (adapter `@payloadcms/db-postgres`)
- `payload.config.ts` avec : collections placeholder, upload vers R2, admin meta

### 10. Vérifications finales
- `pnpm install` doit fonctionner sans erreur
- `pnpm typecheck` doit passer
- `pnpm build` doit réussir (même si les apps sont vides)
- Créer un `README.md` racine expliquant le projet et comment démarrer

## Contraintes
- Pas de `npm` ni `yarn` — pnpm uniquement
- Pas de default exports sauf pages/layouts Next.js et payload.config.ts
- Tous les fichiers en TypeScript (jamais de .js/.jsx sauf configs)
- Pas de `any` — utiliser `unknown` + type guards si nécessaire
