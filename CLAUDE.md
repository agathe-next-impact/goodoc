# CLAUDE.md — MedSite SaaS Platform

## Project Identity

**Name:** MedSite — Plateforme SaaS de sites web pour professionnels de santé
**Stack:** Payload CMS 3.11 + Next.js 15.5 + React 19 + PostgreSQL 16 + TypeScript 5.7
**Monorepo:** Turborepo 2.x with pnpm 10 workspaces
**Node:** >=20.x | **pnpm:** >=9.x (repo uses 10.0.0)
**Deployment docs:** `docs/installation-et-deploiement.md` | **Local DB:** `docker-compose.yml` (Postgres 16)

## Architecture Overview

```
apps/
  web/              → Next.js 15 public-facing practitioner sites  (port 3003)
  admin/            → Payload CMS 3 admin panel (practitioner back-office, port 3001)
  platform/         → Super admin dashboard — internal ops, UI-only,
                      no direct DB access, port 3002
packages/
  db/               → Drizzle ORM schema, migrations, seed, RLS policies (rls.sql)
  config/           → Shared TypeScript, ESLint, Tailwind configs + Zod-validated env
  ui/               → Shared React component library (shadcn/ui based)
  seo/              → Schema.org JSON-LD generators, meta helpers
  doctolib/         → Doctolib integration (widget, CTA, fallback logic)
  email/            → React Email templates + Resend integration
  billing/          → Stripe subscriptions, webhooks, portal, cron jobs
  analytics/        → ⚠ STUB — Plausible + SEO score planned, not implemented yet
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
- Timestamps: `createdAt` and `updatedAt` on every table (no soft deletes — hard delete only)
- UUIDs (v7) for all primary keys via `uuidv7` package — never auto-increment integers
- RLS policies live in `packages/db/rls.sql` (practitioners, addresses, opening_hours, services, pages, etc.)

### API & Data Flow
- Server Components by default — Client Components only when interactivity is required
- Server Actions for mutations (forms, toggles, status changes)
- `unstable_cache` + `revalidateTag` for data caching — never `fetch` cache headers
- API routes only for webhooks (Stripe, Doctolib) and external integrations
- All data fetching in `lib/queries/` — components never call DB directly

### Multi-Tenant Resolution
- Middleware at `apps/web/src/middleware.ts` resolves tenant from hostname on every request
- Custom domain → forwards `x-tenant-custom-domain` header
- Subdomain (slug.medsite.fr) → forwards `x-tenant-slug-candidate` + `x-tenant-host` headers
- Admin routes (admin.medsite.fr) → Payload CMS with tenant context from session
- Tenant context available via `getTenant()` helper in Server Components

### Admin / Payload CMS
- 11 collections in `apps/admin/src/collections/`: Users, Practitioners, Addresses,
  OpeningHours, Services, Pages, BlogPosts, ContactMessages, FaqItems, Testimonials, Media
- Auth handled natively by Payload (session-based) — no next-auth or custom session layer
- Platform app (`apps/platform`) is UI-only for super admin ops — does NOT hit the DB directly

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
- Vitest for unit tests, Playwright for E2E (`apps/web/e2e/`: accessibility, multi-tenant, SEO, tenant-site)
- Test files colocated: `feature.test.ts` next to `feature.ts`
- Multi-tenant tests: always test with 2+ tenants to verify isolation
- SEO tests: validate JSON-LD output against schema.org with `schema-dts`
- CI (`.github/workflows/ci.yml`) runs typecheck + lint + unit + E2E against Postgres 16
- ⚠ No coverage tooling configured yet — don't rely on a threshold, add c8/v8 if needed

### Billing & Cron
- Stripe integration in `packages/billing/` (service, webhook handler)
- Cron jobs in `packages/billing/src/cron/`: `trial-expiry.ts`, `payment-retry.ts`
- Invoke via scheduled runner (not wired to a specific scheduler in-repo — see deploy docs)

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
CLOUDFLARE_R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
```

Full list and Zod schema: `packages/config/src/env.ts`.

### Database host (Neon)
- Production DB = Neon Postgres 16. Driver stays on `drizzle-orm/postgres-js`
  (no code change needed — `prepare: false` is already set, which is required
  by Neon's PgBouncer pooler).
- `DATABASE_URL` → **pooled** endpoint (`...-pooler....neon.tech`) for the app.
- Migrations (`pnpm db:migrate`) + `packages/db/rls.sql` run against the
  **direct / unpooled** endpoint — never the pooled one.
- App connects as a non-superuser tenant-scoped role so RLS actually applies
  (superuser bypasses RLS).
- Vercel ↔ Neon integration auto-provisions a Neon branch per Preview deployment.
- Full step-by-step: `docs/installation-et-deploiement.md` §5 "Integration Neon".

## i18n
No i18n framework installed (no `next-intl` / `next-i18next`). Copy is authored
directly in components (FR primary). If multi-locale is needed later, introduce
`next-intl` at the app boundary rather than per-package.

## When Working on This Project

1. Always read the relevant package README before modifying it
2. Run `pnpm typecheck` before committing — CI will reject type errors
3. New database fields → create migration → update Zod schema → update types
4. New public page → add JSON-LD → add to sitemap → add E2E test
5. Any Doctolib change → test with AND without Doctolib URL configured
6. Any SEO change → validate with Rich Results Test before merging
7. New Payload collection → add to `apps/admin/src/collections/` + Drizzle schema + RLS policy
8. Touching billing cron → update `packages/billing/src/cron/` and verify scheduler wiring in deploy docs
