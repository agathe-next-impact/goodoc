# MedSite

**Plateforme SaaS multi-tenant de sites web pour professionnels de santé.**

Payload CMS 3 + Next.js 15 + PostgreSQL 16 + Drizzle ORM, dans un monorepo Turborepo.

## Architecture

```
apps/
  web/              Next.js 15 — sites publics praticiens
  admin/            Payload CMS 3 — back-office praticien
  platform/         Next.js — super admin (placeholder)

packages/
  config/           Configs partagées (TS, ESLint, Tailwind, env)
  db/               Drizzle ORM — schema + migrations
  ui/               Composants React partagés (shadcn/ui)
  seo/              Générateurs schema.org JSON-LD
  doctolib/         Intégration Doctolib (widget, CTA, fallback)
  email/            Templates React Email + Resend
  billing/          Stripe subscriptions
  analytics/        Plausible + score SEO
  types/            Types TypeScript + schémas Zod
```

## Prérequis

- **Node.js** >= 20
- **pnpm** >= 9
- **PostgreSQL** 16 (local ou distant)

## Démarrage rapide

```bash
# 1. Cloner et installer
pnpm install

# 2. Copier et compléter les variables d'environnement
cp .env.example .env.local

# 3. Générer et appliquer les migrations
pnpm db:generate
pnpm db:migrate

# 4. Lancer tous les apps en dev
pnpm dev
```

Les apps seront disponibles sur :
- `apps/web` → http://localhost:3003
- `apps/admin` → http://localhost:3001
- `apps/platform` → http://localhost:3002

## Commandes principales

| Commande | Description |
|---|---|
| `pnpm dev` | Lance tous les apps en mode dev (parallèle) |
| `pnpm build` | Build tous les packages + apps |
| `pnpm lint` | ESLint + vérification TypeScript |
| `pnpm typecheck` | Type-check uniquement |
| `pnpm test` | Tests unitaires (Vitest) |
| `pnpm test:e2e` | Tests end-to-end (Playwright) |
| `pnpm db:generate` | Génère les migrations Drizzle |
| `pnpm db:migrate` | Applique les migrations en attente |
| `pnpm db:seed` | Seed des données de dev |

## Documentation

- [CLAUDE.md](./CLAUDE.md) — conventions et contexte projet (lu automatiquement par Claude Code)
- [turbo.json](./turbo.json) — pipeline Turborepo

## Stack technique

- **Frontend** : Next.js 15 (App Router), React 19, Tailwind CSS 4, shadcn/ui
- **Backend / CMS** : Payload CMS 3 (sur Next.js)
- **Base de données** : PostgreSQL 16 + Drizzle ORM
- **Validation** : Zod
- **Emails** : React Email + Resend
- **Paiements** : Stripe
- **Stockage media** : Cloudflare R2
- **Analytics** : Plausible
- **Tests** : Vitest (unit) + Playwright (E2E)

## License

Proprietary — © MedSite
