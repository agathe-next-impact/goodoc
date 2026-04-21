# MedSite — Installation, configuration et deploiement

## Prerequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | >= 20.x |
| pnpm | >= 9.x |
| PostgreSQL | 16 |
| Git | 2.x |

Comptes externes necessaires :

- **Stripe** — paiements et abonnements (https://dashboard.stripe.com)
- **Resend** — emails transactionnels (https://resend.com)
- **Cloudflare R2** — stockage media S3-compatible (https://dash.cloudflare.com)
- **Plausible** (optionnel) — analytics respectueuses de la vie privee (https://plausible.io)
- **Google Maps** (optionnel) — cartes interactives (https://console.cloud.google.com)

---

## 1. Installation locale

### Cloner le depot et installer les dependances

```bash
git clone <url-du-repo> medsite
cd medsite
pnpm install
```

### Creer le fichier d'environnement

Copier le modele et remplir les valeurs :

```bash
cp .env.example .env.local   # .env.example se trouve a la racine du repo
```

### Initialiser la base de donnees

```bash
# Creer la base de donnees PostgreSQL
createdb medsite_dev

# Appliquer les migrations Drizzle
pnpm db:migrate

# Inserer les donnees de test (3 tenants realistes)
pnpm db:seed
```

### Lancer le projet en developpement

```bash
pnpm dev
```

Cela demarre en parallele :
- `apps/web` sur http://localhost:3003 (site public praticien)
- `apps/admin` sur http://localhost:3001 (back-office Payload CMS)

Pour acceder aux tenants de test en local, utiliser les sous-domaines :
- http://dr-sophie-martin.localhost:3003
- http://cabinet-dupont.localhost:3003
- http://emilie-rousseau.localhost:3003

---

## 2. Variables d'environnement

Toutes les variables sont validees au demarrage par un schema Zod (`packages/config/src/env.ts`).
Si une variable est manquante ou invalide, l'application affiche une erreur explicite.

### Variables obligatoires

#### Application

| Variable | Format | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_APP_URL` | URL (`https://medsite.fr`) | URL publique de la plateforme. Utilisee pour les URL canoniques, sitemaps, liens dans les emails. |
| `NODE_ENV` | `development`, `production` ou `test` | Environnement d'execution. Defaut : `development`. |

#### Base de donnees

| Variable | Format | Description |
|----------|--------|-------------|
| `DATABASE_URL` | URL PostgreSQL | Chaine de connexion. Ex : `postgresql://user:pass@host:5432/medsite` |

#### Payload CMS

| Variable | Format | Description |
|----------|--------|-------------|
| `PAYLOAD_SECRET` | Chaine >= 32 caracteres | Secret pour la signature des JWT. Generer avec `openssl rand -hex 32`. |

#### Stripe (paiements)

| Variable | Format | Description |
|----------|--------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` ou `sk_live_...` | Cle secrete API Stripe. Trouvable dans Dashboard > Developers > API keys. |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Secret du webhook Stripe. Obtenu lors de la creation du endpoint webhook. |

**Configurer le webhook Stripe :**

1. Aller dans Dashboard Stripe > Developers > Webhooks
2. Ajouter un endpoint : `https://admin.medsite.fr/api/webhooks/stripe`
3. Evenements a ecouter :
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copier le signing secret (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`

**Initialiser les produits Stripe (une seule fois) :**

```bash
pnpm --filter @medsite/billing setup:stripe
```

Ce script cree dans Stripe :
- 3 produits (Essentiel, Pro, Premium)
- 3 prix recurrents mensuels (59€, 119€, 199€)
- Les frais de mise en service (199€, 299€, 0€)
- Le coupon `LAUNCH50` (50% pendant 3 mois)

Reporter ensuite les IDs de prix Stripe dans la table `plans` de la base.

#### Resend (emails)

| Variable | Format | Description |
|----------|--------|-------------|
| `RESEND_API_KEY` | `re_...` | Cle API Resend. Dashboard > API Keys. |

**Configuration du domaine d'envoi :**

1. Aller sur https://resend.com/domains
2. Ajouter le domaine `medsite.fr`
3. Configurer les enregistrements DNS (SPF, DKIM, DMARC)
4. Les emails seront envoyes depuis `noreply@medsite.fr`

#### Cloudflare R2 (stockage media)

| Variable | Format | Description |
|----------|--------|-------------|
| `CLOUDFLARE_R2_ACCESS_KEY` | Chaine | Access key ID du token R2. |
| `CLOUDFLARE_R2_SECRET_KEY` | Chaine | Secret access key du token R2. |
| `CLOUDFLARE_R2_BUCKET` | Chaine (`medsite-media`) | Nom du bucket R2. |
| `CLOUDFLARE_R2_ENDPOINT` | URL | Endpoint S3-compatible. Format : `https://<account-id>.r2.cloudflarestorage.com` |
| `CLOUDFLARE_R2_PUBLIC_URL` | URL (`https://media.medsite.fr`) | URL publique CDN pour servir les media. |

**Configuration R2 :**

1. Dashboard Cloudflare > R2 > Creer un bucket `medsite-media`
2. Activer l'acces public via domaine personnalise (`media.medsite.fr`)
3. Creer un token API R2 avec permissions de lecture/ecriture
4. L'`ENDPOINT` est `https://<account-id>.r2.cloudflarestorage.com` (pas l'URL publique)
5. L'`PUBLIC_URL` est `https://media.medsite.fr` (l'URL de lecture publique)

### Variables optionnelles

| Variable | Format | Description |
|----------|--------|-------------|
| `PLAUSIBLE_API_KEY` | Chaine | Cle API Plausible pour les analytics. Renseignee uniquement en production. |
| `CRON_SECRET` | Chaine | Secret pour authentifier les requetes CRON (header `Authorization: Bearer <secret>`). |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Chaine | Cle API Google Maps pour les cartes interactives sur les pages contact et accueil. |

### Exemple complet `.env.local`

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3003

# Base de donnees
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medsite_dev

# Payload CMS
PAYLOAD_SECRET=votre-secret-de-32-caracteres-minimum-ici

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY=votre-access-key
CLOUDFLARE_R2_SECRET_KEY=votre-secret-key
CLOUDFLARE_R2_BUCKET=medsite-media
CLOUDFLARE_R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://media.medsite.fr

# Optionnel
PLAUSIBLE_API_KEY=
CRON_SECRET=un-secret-pour-les-cron-jobs
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```

---

## 3. Commandes utiles

### Developpement

```bash
pnpm dev                # Demarrer tous les apps en mode dev
pnpm typecheck          # Verification TypeScript (sans emit)
pnpm lint               # ESLint sur tous les packages
pnpm test               # Tests unitaires (Vitest)
pnpm test:e2e           # Tests E2E (Playwright)
```

### Base de donnees

```bash
pnpm db:generate        # Generer les fichiers de migration Drizzle
pnpm db:migrate         # Appliquer les migrations en attente
pnpm db:seed            # Inserer les donnees de dev (3 tenants de test)
```

### Build

```bash
pnpm build              # Build de tous les packages et apps
pnpm clean              # Supprimer les caches et artefacts de build
```

### Stripe

```bash
# Initialiser les produits/prix (une seule fois)
pnpm --filter @medsite/billing setup:stripe

# Ecouter les webhooks Stripe en local
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

---

## 4. Architecture des applications

```
apps/
  web/       → Port 3000 — Sites publics des praticiens (Next.js 15)
  admin/     → Port 3001 — Back-office Payload CMS (praticien)
  platform/  → Super admin dashboard (equipe interne)

packages/
  db/        → Schema Drizzle ORM, migrations, seed
  config/    → TypeScript, ESLint, Tailwind, validation env
  ui/        → Composants React partages (shadcn/ui)
  seo/       → Generateurs JSON-LD schema.org, meta helpers
  doctolib/  → Widget iframe, CTA, fallback Doctolib
  email/     → Templates React Email + envoi via Resend
  billing/   → Stripe abonnements, webhooks, CRON
  analytics/ → Integration Plausible
  types/     → Types TypeScript et schemas Zod partages
```

---

## 5. Deploiement en production

### Option recommandee : Vercel

Chaque application (`apps/web`, `apps/admin`, `apps/platform`) est deployee comme un projet Vercel separe.

#### apps/web (site public)

1. Creer un projet Vercel pointe sur le repo, root directory : `apps/web`
2. Framework preset : Next.js
3. Build command : `pnpm build --filter=@medsite/web`
4. Configurer toutes les variables d'environnement dans les settings Vercel
5. Domaines :
   - `medsite.fr` et `www.medsite.fr` (marketing)
   - `*.medsite.fr` (wildcard pour les sous-domaines tenants)
   - Domaines personnalises via les DNS des praticiens

#### apps/admin (back-office)

1. Creer un projet Vercel, root directory : `apps/admin`
2. Build command : `pnpm build --filter=@medsite/admin`
3. Domaine : `admin.medsite.fr`
4. Configurer les memes variables d'environnement

#### Base de donnees

Utiliser un PostgreSQL 16 manage :
- **Neon** (recommande pour Vercel) — https://neon.tech
- **Supabase** — https://supabase.com
- **AWS RDS** — pour plus de controle

Appliquer les migrations avant le premier deploiement :

```bash
DATABASE_URL=postgresql://... pnpm db:migrate
```

#### Integration Neon (pas a pas)

Le driver actuel (`drizzle-orm/postgres-js` + `postgres`, voir `packages/db/src/index.ts`)
est compatible Neon sans changement de code. Le flag `prepare: false` est deja
en place, ce qui est requis par le pooler Neon (PgBouncer transaction mode).

1. **Creer le projet Neon**
   - Region proche du deploiement Vercel (ex. `eu-central-1` pour Frankfurt).
   - Postgres 16.
   - Garder la branche `main` pour la prod ; creer une branche `preview` pour les
     Preview deployments (ou utiliser l'integration Vercel qui cree une branche par PR).

2. **Recuperer deux connection strings**
   - **Pooled** (pour l'app) — host `...-pooler....neon.tech`. A utiliser dans
     `DATABASE_URL` sur Vercel.
   - **Direct / unpooled** (pour les migrations) — host sans `-pooler`. A utiliser
     pour `drizzle-kit migrate` depuis CI ou local.
   - Toujours inclure `?sslmode=require`.

3. **Configurer les variables Vercel**
   ```
   DATABASE_URL           = <pooled>  --sslmode=require   # scope Production + Preview
   DATABASE_MIGRATE_URL   = <direct>  --sslmode=require   # utilise en CI uniquement
   ```

4. **Appliquer migrations + RLS**
   ```bash
   # Depuis la machine qui deploie ou un step CI dedie
   DATABASE_URL="$DATABASE_MIGRATE_URL" pnpm db:migrate
   psql "$DATABASE_MIGRATE_URL" -f packages/db/rls.sql
   ```

5. **Rôle applicatif tenant-scoped**
   Creer le role Postgres utilise par l'app (non-superuser, RLS applique) :
   ```sql
   CREATE ROLE medsite_app LOGIN PASSWORD '<strong-password>';
   GRANT USAGE ON SCHEMA public TO medsite_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO medsite_app;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public
     GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO medsite_app;
   ```
   Puis utiliser cet utilisateur dans la connection string `DATABASE_URL` (pas le
   superuser Neon, qui bypasse RLS).

6. **Integration Vercel <-> Neon (optionnel mais recommande)**
   - Installer l'integration depuis le Marketplace Vercel.
   - Cree automatiquement `DATABASE_URL` (pooled) et `DATABASE_URL_UNPOOLED` (direct).
   - Cree une branche Neon isolee par Preview deployment -> aucun risque de polluer la prod.

7. **Option Edge runtime (plus tard, non requis aujourd'hui)**
   Le middleware `apps/web/src/middleware.ts` est explicitement edge-safe et
   n'appelle pas la DB — donc le driver `postgres-js` actuel reste valide. Si un
   jour une route Edge a besoin de query Postgres, basculer vers
   `@neondatabase/serverless` + `drizzle-orm/neon-serverless` uniquement sur
   cette route ; garder `postgres-js` pour le reste et les migrations.

### CRON Jobs (Vercel Cron)

Ajouter dans `vercel.json` du projet admin :

```json
{
  "crons": [
    {
      "path": "/api/cron/trial-expiry",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Ce job s'execute chaque jour a 8h :
- Envoie un email d'alerte 3 jours avant l'expiration de l'essai
- Suspend les tenants dont l'essai a expire

Proteger avec `CRON_SECRET` : Vercel envoie automatiquement le header `Authorization: Bearer <CRON_SECRET>`.

### DNS et domaines

#### Sous-domaines praticiens (`*.medsite.fr`)

Ajouter un enregistrement DNS wildcard :
```
*.medsite.fr    CNAME   cname.vercel-dns.com
```

#### Domaines personnalises des praticiens

Chaque praticien qui configure un domaine personnalise doit ajouter :
```
www.exemple.fr    CNAME   cname.vercel-dns.com
```

Puis dans le dashboard Vercel, ajouter le domaine au projet `apps/web`.
Le champ `customDomain` dans la table `tenants` est mis a jour et `domainVerified` passe a `true` apres verification DNS.

---

## 6. Securite en production

- **PAYLOAD_SECRET** : generer avec `openssl rand -hex 32`, ne jamais reutiliser entre environnements
- **Webhook Stripe** : toujours verifier la signature (`stripe.webhooks.constructEvent`) — le code refuse les webhooks non signes
- **Pas de donnees de carte** cote serveur — tout passe par Stripe Checkout et le Billing Portal
- **PII** : ne jamais logger les noms, emails ou telephones des patients
- **CSP** : les headers de securite sont configures dans `next.config.ts`
- **CSRF** : protection sur toutes les mutations (Server Actions Next.js)
- **Rate limiting** : a configurer au niveau Vercel ou via middleware sur les endpoints sensibles (`/api/webhooks`, contact form)
- **Variables d'environnement** : ne jamais les commiter — utiliser `.env.local` (gitignore) ou les settings Vercel

---

## 7. Monitoring et maintenance

### Verifier que tout fonctionne

```bash
# Typecheck complet
pnpm typecheck

# Lint complet
pnpm lint

# Tests unitaires (202 tests)
pnpm test

# Tests E2E (necessite la base seeded et le dev server)
pnpm test:e2e
```

### Apres un deploiement

1. Verifier que les migrations ont ete appliquees (`pnpm db:migrate`)
2. Tester un site praticien (hero, actes, contact form)
3. Verifier le webhook Stripe (Dashboard > Webhooks > Logs)
4. Verifier les emails (Resend > Logs)
5. Verifier les analytics Plausible (si configure)

### Logs utiles

- **Vercel** : Dashboard > Logs (par projet)
- **Stripe** : Dashboard > Developers > Logs
- **Resend** : Dashboard > Emails
- **Cloudflare R2** : Dashboard > R2 > Metrics
