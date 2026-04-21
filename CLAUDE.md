# CLAUDE.md — MedSite SaaS Platform

## Project Identity

**Name:** MedSite — Plateforme SaaS de sites web pour professionnels de santé
**Stack:** Payload CMS 3.x + Next.js 15 (App Router) + PostgreSQL 16 + TypeScript
**Monorepo:** Turborepo with pnpm workspaces
**Node:** >=20.x | **pnpm:** >=9.x

## Architecture Overview

```
apps/
  web/              → Next.js 15 frontend (public-facing practitioner sites)
  admin/            → Payload CMS 3 admin panel (practitioner back-office)
  platform/         → Super admin dashboard (internal ops)
packages/
  db/               → Drizzle ORM schema, migrations, seed
  config/           → Shared TypeScript, ESLint, Tailwind configs
  ui/               → Shared React component library (shadcn/ui based)
  seo/              → Schema.org JSON-LD generators, meta helpers
  doctolib/         → Doctolib integration (widget, CTA, fallback logic)
  email/            → React Email templates + Resend integration
  billing/          → Stripe subscriptions, webhooks, portal
  analytics/        → Plausible integration + SEO score calculator
  types/            → Shared TypeScript types & Zod schemas
```

## Core Conventions

### Code Style
- TypeScript strict mode everywhere (`"strict": true, "noUncheckedIndexedAccess": true`)
- Functional components only, no class components
- Named exports only (no default exports except Next.js pages/layouts)
- Zod for all runtime validation (API inputs, env vars, form data)
- Prefer `const` assertions and discriminated unions over enums
- Error handling: Result pattern (`{ success: true, data } | { success: false, error }`) for all service functions
- File naming: `kebab-case.ts` for files, `PascalCase` for components, `camelCase` for functions/variables

### Database
- All queries go through Drizzle ORM — never raw SQL except in migrations
- Multi-tenant: every table has a `tenantId` column (except system tables)
- PostgreSQL Row-Level Security (RLS) enforced at DB level — Drizzle connects with tenant-scoped role
- Timestamps: `createdAt` and `updatedAt` on every table, `deletedAt` for soft deletes
- UUIDs (v7) for all primary keys — never auto-increment integers

### API & Data Flow
- Server Components by default — Client Components only when interactivity is required
- Server Actions for mutations (forms, toggles, status changes)
- `unstable_cache` + `revalidateTag` for data caching — never `fetch` cache headers
- API routes only for webhooks (Stripe, Doctolib) and external integrations
- All data fetching in `lib/queries/` — components never call DB directly

### Multi-Tenant Resolution
- Middleware (`middleware.ts`) resolves tenant from hostname on every request
- Custom domain → lookup in `domains` table → set `x-tenant-id` header
- Subdomain (slug.medsite.fr) → extract slug → lookup in `tenants` table
- Admin routes (admin.medsite.fr) → Payload CMS with tenant context from session
- Tenant context available via `getTenant()` helper in Server Components

### SEO (Critical — Competitive Advantage)
- Every public page MUST have JSON-LD structured data (see `packages/seo/`)
- Schema.org types auto-selected from practitioner specialty mapping
- `generateMetadata()` in every page.tsx — never hardcoded meta tags
- Sitemap generated dynamically per tenant via `app/sitemap.ts`
- All images through `next/image` with explicit `width`, `height`, `alt`
- Target: Lighthouse 95+ on all 4 categories

### Doctolib Integration
- Doctolib has NO public API — integration via iframe widget + CTA buttons only
- Widget URL: `https://www.doctolib.fr/iframe/{slug}`
- Fallback chain: Doctolib iframe → Doctolib CTA button → Cal.com → Contact form
- `bookingMode` field computed automatically from available URLs
- iframe MUST include `allowpaymentrequest` attribute

### Testing
- Vitest for unit tests, Playwright for E2E
- Test files colocated: `feature.test.ts` next to `feature.ts`
- Multi-tenant tests: always test with 2+ tenants to verify isolation
- SEO tests: validate JSON-LD output against schema.org with `schema-dts`
- Minimum coverage: 80% on `packages/*`, 60% on `apps/*`

### Security
- Never log PII (patient names, emails, phone numbers)
- All env vars validated with Zod at startup (`packages/config/env.ts`)
- CSRF protection on all mutations
- Rate limiting on auth endpoints and contact forms
- CSP headers set in `next.config.ts`

## Key Commands

```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all packages + apps
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run pending migrations
pnpm db:seed          # Seed dev data (3 tenants, sample content)
pnpm test             # Run all tests
pnpm test:e2e         # Run Playwright E2E tests
pnpm lint             # ESLint + TypeScript check
pnpm typecheck        # TypeScript only (no emit)
```

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=...
NEXT_PUBLIC_APP_URL=https://medsite.fr
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
PLAUSIBLE_API_KEY=...
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_SECRET_KEY=...
CLOUDFLARE_R2_BUCKET=medsite-media
CLOUDFLARE_R2_PUBLIC_URL=https://media.medsite.fr
```

## When Working on This Project

1. Always read the relevant package README before modifying it
2. Run `pnpm typecheck` before committing — CI will reject type errors
3. New database fields → create migration → update Zod schema → update types
4. New public page → add JSON-LD → add to sitemap → add E2E test
5. Any Doctolib change → test with AND without Doctolib URL configured
6. Any SEO change → validate with Rich Results Test before merging
