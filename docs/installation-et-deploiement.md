# MedSite — Procédure détaillée d'installation locale et de déploiement

> Ce document décrit de bout en bout comment installer MedSite sur un poste de développement, puis comment déployer la plateforme en production. Il est prévu pour qu'un·e ingénieur·e qui découvre le projet puisse le rendre opérationnel sans autre source d'information.

---

## Sommaire

1. [Prérequis](#1-prérequis)
2. [Vue d'ensemble de l'architecture](#2-vue-densemble-de-larchitecture)
3. [Installation locale étape par étape](#3-installation-locale-étape-par-étape)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Configuration des services externes](#5-configuration-des-services-externes)
6. [Multi-tenant et résolution des hôtes en local](#6-multi-tenant-et-résolution-des-hôtes-en-local)
7. [Row-Level Security PostgreSQL](#7-row-level-security-postgresql)
8. [Commandes utiles du quotidien](#8-commandes-utiles-du-quotidien)
9. [Tests et qualité](#9-tests-et-qualité)
10. [Déploiement en production](#10-déploiement-en-production)
11. [DNS, domaines et certificats](#11-dns-domaines-et-certificats)
12. [CRON jobs et tâches planifiées](#12-cron-jobs-et-tâches-planifiées)
13. [Webhooks Stripe](#13-webhooks-stripe)
14. [Sécurité en production](#14-sécurité-en-production)
15. [Monitoring, logs et alertes](#15-monitoring-logs-et-alertes)
16. [Procédures de rollback et de disaster recovery](#16-procédures-de-rollback-et-de-disaster-recovery)
17. [Checklist Go-Live](#17-checklist-go-live)
18. [Dépannage (FAQ technique)](#18-dépannage-faq-technique)

---

## 1. Prérequis

### Outils à installer sur le poste

| Outil | Version minimale | Rôle | Vérification |
|-------|-----------------|------|--------------|
| **Node.js** | `>= 20.x` LTS | Runtime JavaScript | `node --version` |
| **pnpm** | `>= 9.x` (idéalement 10.0) | Gestionnaire de paquets monorepo | `pnpm --version` |
| **Docker Desktop** | récent | Lance PostgreSQL en local | `docker --version` |
| **Git** | `>= 2.x` | Contrôle de version | `git --version` |
| **Stripe CLI** | `>= 1.19` | Test des webhooks en local | `stripe --version` |
| **PostgreSQL client** (optionnel) | 16 | `psql` pour diagnostiquer la base | `psql --version` |

> **pnpm** : installer avec `corepack enable && corepack prepare pnpm@10.0.0 --activate` (Node >= 20 inclut Corepack).
> **Stripe CLI** : `brew install stripe/stripe-cli/stripe` (macOS), `scoop install stripe` (Windows) ou télécharger depuis https://github.com/stripe/stripe-cli/releases.

### Comptes externes à créer

| Service | Usage | URL d'inscription |
|---------|-------|-------------------|
| **Stripe** | Paiements, abonnements, Billing Portal | https://dashboard.stripe.com/register |
| **Resend** | Emails transactionnels (onboarding, facturation, alertes) | https://resend.com |
| **Cloudflare R2** | Stockage S3-compatible des médias (images, PDFs) | https://dash.cloudflare.com/sign-up |
| **Plausible** (optionnel) | Analytics respectueuses de la vie privée | https://plausible.io |
| **Google Cloud** (optionnel) | Clé API Google Maps pour la carte contact | https://console.cloud.google.com |
| **Neon** ou **Supabase** (prod) | PostgreSQL managé | https://neon.tech |
| **Vercel** | Hébergement des apps Next.js | https://vercel.com |

---

## 2. Vue d'ensemble de l'architecture

MedSite est un **monorepo Turborepo** géré par **pnpm workspaces**. Il contient trois applications Next.js 15 et neuf packages partagés :

```
medsite/
├── apps/
│   ├── web/        → Port 3003 — sites publics des praticiens (Next.js 15, App Router)
│   ├── admin/      → Port 3001 — back-office Payload CMS 3 (un tenant = un praticien)
│   └── platform/   → Port 3002 — super-admin équipe interne (placeholder)
├── packages/
│   ├── config/     → Schéma Zod des variables d'env, configs TS/ESLint/Tailwind partagées
│   ├── db/         → Schéma Drizzle ORM, migrations SQL, seed, politiques RLS
│   ├── ui/         → Composants React shadcn/ui partagés
│   ├── seo/        → Générateurs JSON-LD schema.org, helpers `generateMetadata`
│   ├── doctolib/   → Widget iframe, CTA et chaîne de fallback Doctolib
│   ├── email/      → Templates React Email + client Resend
│   ├── billing/    → Stripe subscriptions, webhooks, scripts setup, CRON
│   ├── analytics/  → Intégration Plausible + calcul de score SEO
│   └── types/      → Types TS et schémas Zod partagés (réexporte drizzle-zod)
├── docker-compose.yml   → PostgreSQL 16 local
├── turbo.json           → Pipeline Turborepo (dépendances de tâches, cache)
├── pnpm-workspace.yaml  → Déclaration des workspaces
└── .env.local           → Variables d'environnement locales (non commité)
```

**Flux applicatif multi-tenant :**

1. Un visiteur arrive sur `dr-sophie-martin.medsite.fr` ou `cabinet-dupont.fr` (domaine personnalisé).
2. Le `middleware.ts` de `apps/web` extrait l'hôte et détermine le `tenantId` :
   - sous-domaine → lookup dans la table `tenants` par `slug`
   - domaine personnalisé → lookup dans la table `domains` par `hostname`
3. Le header `x-tenant-id` est ajouté à la requête, propagé aux Server Components.
4. Drizzle exécute `SET LOCAL app.current_tenant_id = '<uuid>'` en début de transaction.
5. PostgreSQL RLS garantit qu'aucune ligne d'un autre tenant ne peut être lue ou modifiée.

> Voir [`apps/web/src/middleware.ts`](../apps/web/src/middleware.ts) et [`packages/db/rls.sql`](../packages/db/rls.sql).

---

## 3. Installation locale étape par étape

### Étape 3.1 — Cloner le dépôt

```bash
git clone <url-du-repo> medsite
cd medsite
```

### Étape 3.2 — Installer les dépendances

```bash
pnpm install
```

Cette commande :
- installe toutes les dépendances dans `node_modules/` (hoisté) et `packages/*/node_modules/` / `apps/*/node_modules/`
- compile les dépendances natives autorisées listées dans `package.json > pnpm.onlyBuiltDependencies` (sharp, esbuild, swc, unrs-resolver)

**Durée attendue :** 1 à 3 minutes sur un poste moderne avec cache pnpm chaud.

**Si `pnpm install` échoue :**
- Vérifier que Node >= 20 est bien actif : `node --version`
- Purger le store pnpm : `pnpm store prune`
- Supprimer `node_modules` et `pnpm-lock.yaml` **seulement en dernier recours** (lockfile garantit la reproductibilité)

### Étape 3.3 — Copier le fichier d'environnement

```bash
cp .env.example .env.local   # .env.example se trouve a la racine du repo
```

> `.env.example` n'est pas encore présent dans le repo ; utiliser comme modèle le fichier `.env.local` actuel ou le bloc « Exemple complet » de la [section 4.7](#47-exemple-complet-envlocal).

Ouvrir `.env.local` dans l'éditeur et renseigner les valeurs. Au minimum, pour un démarrage local, les variables suivantes doivent être définies (les valeurs réelles Stripe/Resend/R2 peuvent être des *placeholders* de test si on ne touche pas à ces flux) :

- `NODE_ENV=development`
- `NEXT_PUBLIC_APP_URL=http://localhost:3003`
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `DATABASE_URL` (cohérent avec les trois précédentes)
- `PAYLOAD_SECRET` : générer avec `openssl rand -base64 32`
- `STRIPE_SECRET_KEY=sk_test_...` (peut être un faux préfixé `sk_test_` pour les écrans qui n'appellent pas Stripe)
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `RESEND_API_KEY=re_...`
- `CLOUDFLARE_R2_*` (voir [§5.3](#53-cloudflare-r2))

> La validation Zod de `packages/config/src/env.ts` refuse le démarrage si une variable est manquante ou ne respecte pas son format (`sk_`, `whsec_`, `re_`, URL valide, `PAYLOAD_SECRET` >= 32 caractères).

### Étape 3.4 — Démarrer PostgreSQL (Docker)

```bash
docker compose up -d
```

Ce qui se passe :
- tire l'image `postgres:16`
- crée le conteneur `medsite-db` exposant `5432`
- persiste les données dans le volume Docker `pgdata`
- lance un healthcheck `pg_isready` toutes les 5 s

**Vérifier que la base est prête :**

```bash
docker compose ps
# STATUS doit contenir "healthy"

# Optionnel : connexion psql
docker compose exec db psql -U postgres -d medsite -c "SELECT version();"
```

**Sans Docker**, installer PostgreSQL 16 nativement et créer manuellement la base :

```bash
createdb medsite
psql -d medsite -c "CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';"
```

### Étape 3.5 — Générer et appliquer les migrations Drizzle

```bash
# Générer le SQL à partir du schéma TypeScript (si modifications du schéma)
pnpm db:generate

# Appliquer toutes les migrations en attente sur la base ciblée par DATABASE_URL
pnpm db:migrate
```

Les fichiers SQL générés vivent dans `packages/db/drizzle/` et sont **versionnés** — ne jamais les modifier à la main, générer une nouvelle migration à la place.

**Vérifier :**
```bash
docker compose exec db psql -U postgres -d medsite -c "\dt"
# Doit lister : tenants, practitioners, addresses, opening_hours, services, articles,
# reviews, media, domains, users, plans, subscriptions, email_events, etc.
```

### Étape 3.6 — Appliquer les politiques Row-Level Security

> À faire **une seule fois** par base, après la première migration réussie.

```bash
docker compose exec -T db psql -U postgres -d medsite < packages/db/rls.sql
```

Cela active RLS sur toutes les tables `tenant`-scopées et installe la policy `tenant_isolation` qui filtre sur `current_setting('app.current_tenant_id')`.

### Étape 3.7 — Seed des données de développement

```bash
pnpm db:seed
```

Crée trois tenants réalistes dans la base :
- `dr-sophie-martin` — médecin généraliste, Paris, avec Doctolib
- `cabinet-dupont` — cabinet dentaire, Lyon, avec CTA Doctolib + Cal.com
- `emilie-rousseau` — psychologue, Bordeaux, contact form uniquement

Chaque tenant est peuplé avec : praticien, adresse, horaires d'ouverture, 3–5 actes, 2 articles de blog, avis patients, médias.

### Étape 3.8 — Lancer les trois apps en dev

```bash
pnpm dev
```

Turborepo lance `next dev` pour les trois apps en parallèle :

| App | URL locale | Rôle |
|-----|-----------|------|
| `@medsite/web` | http://localhost:3003 | Sites publics praticiens |
| `@medsite/admin` | http://localhost:3001 | Payload CMS back-office |
| `@medsite/platform` | http://localhost:3002 | Super-admin (placeholder) |

**Premier accès :**
- http://localhost:3003 → landing marketing (rewrite middleware)
- http://dr-sophie-martin.localhost:3003 → site praticien (voir §6)
- http://localhost:3001/admin → première connexion à Payload, créer le compte superadmin

### Étape 3.9 — Vérification finale

```bash
pnpm typecheck    # aucun erreur TS
pnpm lint         # aucun warning
pnpm test         # tous les tests unitaires passent
```

Si les trois passent sans erreur, **l'installation locale est opérationnelle**.

---

## 4. Variables d'environnement

Toutes les variables sont définies dans `.env.local` à la racine et validées au démarrage par le schéma Zod de [`packages/config/src/env.ts`](../packages/config/src/env.ts). Une variable manquante ou mal formée produit un message d'erreur listant tous les problèmes.

### 4.1 Application

| Variable | Format | Obligatoire | Description |
|----------|--------|-------------|-------------|
| `NODE_ENV` | `development` \| `production` \| `test` | oui (défaut `development`) | Environnement d'exécution |
| `NEXT_PUBLIC_APP_URL` | URL absolue (`https://medsite.fr`) | oui | URL publique ; utilisée pour canonicals, sitemaps, liens emails |

### 4.2 Base de données

| Variable | Format | Obligatoire | Description |
|----------|--------|-------------|-------------|
| `POSTGRES_USER` | chaîne | oui (Docker) | Utilisé par docker-compose pour initialiser le conteneur |
| `POSTGRES_PASSWORD` | chaîne non vide | oui (Docker) | Mot de passe superuser |
| `POSTGRES_DB` | chaîne | oui (Docker) | Nom de la base créée par Docker |
| `DATABASE_URL` | URL PostgreSQL | oui | `postgresql://user:pass@host:5432/dbname` — doit correspondre aux 3 ci-dessus |

### 4.3 Payload CMS

| Variable | Format | Obligatoire | Description |
|----------|--------|-------------|-------------|
| `PAYLOAD_SECRET` | chaîne `>= 32` car. | oui | Secret de signature des JWT Payload. Générer avec `openssl rand -base64 32`. **Ne jamais réutiliser entre environnements.** |

### 4.4 Stripe

| Variable | Format | Obligatoire | Description |
|----------|--------|-------------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` ou `sk_live_...` | oui | Clé secrète API — Dashboard Stripe > Developers > API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | oui | Signing secret du webhook — obtenu en créant l'endpoint |

### 4.5 Resend

| Variable | Format | Obligatoire | Description |
|----------|--------|-------------|-------------|
| `RESEND_API_KEY` | `re_...` | oui | Clé API Resend. Dashboard > API Keys |

### 4.6 Cloudflare R2

| Variable | Format | Obligatoire | Description |
|----------|--------|-------------|-------------|
| `CLOUDFLARE_R2_ACCESS_KEY` | chaîne | oui | Access key du token R2 |
| `CLOUDFLARE_R2_SECRET_KEY` | chaîne | oui | Secret access key du token R2 |
| `CLOUDFLARE_R2_BUCKET` | chaîne (`medsite-media`) | oui | Nom du bucket R2 |
| `CLOUDFLARE_R2_ENDPOINT` | URL | oui | `https://<account-id>.r2.cloudflarestorage.com` (**pas** l'URL publique) |
| `CLOUDFLARE_R2_PUBLIC_URL` | URL (`https://media.medsite.fr`) | oui | URL publique CDN pour servir les médias |

> ⚠️ `ENDPOINT` et `PUBLIC_URL` sont deux choses distinctes. L'endpoint est l'API S3, l'URL publique est le domaine CDN en lecture seule. Voir la note [memory/todo_r2_endpoint.md](#) — le plugin S3 historique utilisait à tort `PUBLIC_URL` comme endpoint.

### 4.7 Variables optionnelles

| Variable | Format | Description |
|----------|--------|-------------|
| `PLAUSIBLE_API_KEY` | chaîne | Clé API Plausible (uniquement en production) |
| `CRON_SECRET` | chaîne | Secret Bearer pour authentifier les requêtes CRON Vercel |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | chaîne | Clé Google Maps pour les cartes sur les pages contact/accueil |

### 4.8 Exemple complet `.env.local`

```env
# ─── Runtime ──────────────────────────────────────────────────
NODE_ENV=development

# ─── Application ──────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3003

# ─── Database (Docker + Drizzle) ──────────────────────────────
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=medsite
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medsite

# ─── Payload CMS ──────────────────────────────────────────────
# openssl rand -base64 32
PAYLOAD_SECRET=remplacer-par-un-secret-32-caracteres-minimum

# ─── Stripe ───────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# ─── Resend ───────────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# ─── Cloudflare R2 ────────────────────────────────────────────
CLOUDFLARE_R2_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_R2_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_R2_BUCKET=medsite-media
CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://media.medsite.fr

# ─── Optionnel ────────────────────────────────────────────────
PLAUSIBLE_API_KEY=
CRON_SECRET=un-secret-aleatoire-pour-vercel-cron
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```

---

## 5. Configuration des services externes

### 5.1 Stripe

**Étape 1 — Créer un compte et récupérer les clés test.**

Dashboard > Developers > API keys → copier `sk_test_...` dans `STRIPE_SECRET_KEY`.

**Étape 2 — Initialiser les produits (une seule fois, environnements test ET live).**

```bash
pnpm --filter @medsite/billing setup:stripe
```

Ce script (`packages/billing/src/scripts/setup-stripe.ts`) crée :
- 3 produits : **Essentiel**, **Pro**, **Premium**
- 3 prix récurrents mensuels : 59 €, 119 €, 199 €
- Frais de mise en service : 199 €, 299 €, 0 €
- Coupon `LAUNCH50` : -50 % pendant 3 mois

**Reporter ensuite** les IDs de prix retournés par le script dans la table `plans` (colonne `stripePriceId`) via le dashboard Payload ou une migration de seed.

**Étape 3 — Configurer le webhook.**

Voir [section 13](#13-webhooks-stripe) pour la configuration locale et production.

### 5.2 Resend

1. Créer un compte sur https://resend.com
2. Dashboard > API Keys → générer une clé, la coller dans `RESEND_API_KEY`
3. Dashboard > Domains → ajouter `medsite.fr`
4. Configurer les enregistrements DNS fournis par Resend :
   - SPF (`TXT`)
   - DKIM (`TXT` avec 3 clés)
   - DMARC (`TXT` `_dmarc.medsite.fr`)
5. Attendre la validation (quelques minutes à 24h). Les emails seront envoyés depuis `noreply@medsite.fr`.

> En développement, sans domaine validé, Resend accepte l'envoi depuis `onboarding@resend.dev` — suffisant pour les tests.

### 5.3 Cloudflare R2

1. **Créer le bucket** : Dashboard Cloudflare > R2 > *Create bucket* → nom `medsite-media`, région Europe (WEUR).
2. **Activer l'accès public** : onglet *Settings* > *Public access* > *Connect domain* → ajouter `media.medsite.fr` ; créer l'enregistrement CNAME demandé dans le DNS.
3. **Créer un API token** : dossier *R2* > *Manage R2 API Tokens* > *Create API token* :
   - Permissions : *Object Read & Write*
   - TTL : illimité (ou rotation annuelle)
   - Scope : `medsite-media` uniquement
   - Récupérer `Access Key ID` → `CLOUDFLARE_R2_ACCESS_KEY`, `Secret Access Key` → `CLOUDFLARE_R2_SECRET_KEY`
4. **Récupérer l'endpoint S3-compatible** : le dashboard affiche `https://<account-id>.r2.cloudflarestorage.com` → `CLOUDFLARE_R2_ENDPOINT`.
5. **URL publique** : `https://media.medsite.fr` (ce que vous avez configuré en étape 2) → `CLOUDFLARE_R2_PUBLIC_URL`.

### 5.4 Plausible (optionnel)

1. Créer un site sur https://plausible.io/sites
2. Domaine : `medsite.fr` (et chaque domaine tenant si tracking par site)
3. Récupérer la clé API dans *Account Settings* > *API Keys* → `PLAUSIBLE_API_KEY`
4. Aucun script à installer manuellement : `packages/analytics` injecte la balise `<Script>` Plausible côté front.

### 5.5 Google Maps (optionnel)

1. Console Google Cloud > *APIs & Services* > activer **Maps JavaScript API** et **Places API**
2. *Credentials* > *Create credentials* > *API key*
3. Restreindre la clé :
   - *HTTP referrers* : `medsite.fr/*`, `*.medsite.fr/*`, `localhost:3003/*`
   - *API restrictions* : Maps JavaScript + Places uniquement
4. Coller la clé dans `NEXT_PUBLIC_GOOGLE_MAPS_KEY`

---

## 6. Multi-tenant et résolution des hôtes en local

### 6.1 Principe

Le middleware `apps/web/src/middleware.ts` s'exécute en **Edge Runtime** à chaque requête HTTP. Il :

1. Lit l'header `host` (`dr-sophie-martin.localhost:3003`, `medsite.fr`, `cabinet-dupont.fr`…)
2. Décide du type d'hôte :
   - **Apex/www marketing** (`medsite.fr`, `www.medsite.fr`, `localhost:3003`) → rewrite vers `/marketing/*`
   - **Sous-domaine tenant** (`slug.medsite.fr` ou `slug.localhost:3003`) → ajoute `x-tenant-slug`
   - **Domaine personnalisé** (`cabinet-dupont.fr`) → ajoute `x-tenant-host`, lookup en RSC
   - **Admin** (`admin.medsite.fr`) → hors scope `apps/web`, servi par `apps/admin`
3. Le helper `getTenant()` dans `apps/web/src/lib/tenant.ts` fait le lookup DB en Server Component et met en cache via `unstable_cache`.

> Le middleware ne touche jamais à la base : en Edge Runtime, seules les fonctions HTTP et l'API Web sont disponibles. Tout accès DB vit dans les RSC ou les Server Actions.

### 6.2 Sous-domaines `*.localhost`

Les navigateurs modernes résolvent `*.localhost` sur `127.0.0.1` sans modification `/etc/hosts`. Les trois tenants seedés sont donc accessibles immédiatement :

- http://dr-sophie-martin.localhost:3003
- http://cabinet-dupont.localhost:3003
- http://emilie-rousseau.localhost:3003

### 6.3 Simuler un domaine personnalisé en local

Éditer `/etc/hosts` (macOS/Linux) ou `C:\Windows\System32\drivers\etc\hosts` (Windows) :

```
127.0.0.1  cabinet-dupont.test
```

Puis visiter http://cabinet-dupont.test:3003 — le middleware détectera un hôte non-`medsite.fr` et déclenchera le lookup par `domains.hostname`. Il faut que l'entrée correspondante existe dans la base (`pnpm db:seed` crée un mapping pour `cabinet-dupont.fr` — l'adapter à `cabinet-dupont.test` si besoin).

---

## 7. Row-Level Security PostgreSQL

La table `tenants` est **partagée** ; toutes les autres tables portant un `tenant_id` sont **isolées par RLS**.

### 7.1 Politique appliquée

Pour chaque table `tenant`-scopée :

```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON <table>
  USING       (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK  (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
```

Le fichier source : [`packages/db/rls.sql`](../packages/db/rls.sql).

### 7.2 Côté application

Dans chaque transaction, Drizzle doit exécuter :

```sql
SET LOCAL app.current_tenant_id = '<uuid-du-tenant>';
```

avant toute requête. C'est géré par le wrapper `withTenant()` exposé par `@medsite/db`.

### 7.3 Limitation connue

Les **table owners** bypassent RLS (`BYPASSRLS`). Le rôle utilisé par l'application en runtime doit donc être **différent** du rôle qui exécute migrations + seed. En production, créer un rôle `medsite_app` avec `NOBYPASSRLS` et le référencer dans `DATABASE_URL`. En dev, on utilise `postgres` pour simplifier (RLS moins strict).

---

## 8. Commandes utiles du quotidien

### 8.1 Développement

```bash
pnpm dev                # Lance web + admin + platform en parallèle
pnpm dev --filter=@medsite/web   # Un seul app
pnpm typecheck          # TypeScript sans emit
pnpm lint               # ESLint max-warnings=0
pnpm lint --fix         # Correction automatique
```

### 8.2 Base de données

```bash
pnpm db:generate        # Génère une migration à partir du schéma TS
pnpm db:migrate         # Applique les migrations en attente
pnpm db:seed            # Seed dev (3 tenants)
pnpm --filter @medsite/db db:studio   # Drizzle Studio (GUI) sur https://local.drizzle.studio
```

### 8.3 Build

```bash
pnpm build                      # Build tous les packages + apps
pnpm build --filter=@medsite/web  # Build un app avec ses deps
pnpm clean                      # rm .turbo .next dist et node_modules
```

### 8.4 Stripe

```bash
# Initialiser les produits (une seule fois par env)
pnpm --filter @medsite/billing setup:stripe

# Écouter les webhooks en local (voir §13.1)
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Rejouer un événement spécifique
stripe events resend evt_xxx
```

### 8.5 Docker

```bash
docker compose up -d          # Démarrer la base
docker compose down           # Arrêter (conserve le volume)
docker compose down -v        # Arrêter + supprimer le volume (⚠️ perte de données)
docker compose logs -f db     # Suivre les logs Postgres
docker compose exec db psql -U postgres -d medsite
```

<<<<<<< HEAD
---
=======
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
>>>>>>> fd446727045209aef87fae75404cee50ee338cc5

## 9. Tests et qualité

### 9.1 Tests unitaires

```bash
pnpm test                              # Tous les packages + apps
pnpm --filter @medsite/seo test        # Un package
pnpm --filter @medsite/web test:watch  # Mode watch
```

- **Framework** : Vitest
- **Workspace** : déclaré dans `vitest.workspace.ts` à la racine
- **Co-location** : `feature.test.ts` à côté de `feature.ts`
- **Coverage cible** : 80 % sur `packages/*`, 60 % sur `apps/*`
- **Multi-tenant** : chaque test d'isolation utilise **au moins 2 tenants** pour vérifier l'étanchéité

### 9.2 Tests E2E

```bash
# Pré-requis : base seeded + pnpm dev actif
pnpm test:e2e

# UI mode (navigateur)
pnpm --filter @medsite/web test:e2e --ui

# Un seul test
pnpm --filter @medsite/web test:e2e booking.spec.ts
```

Playwright est configuré dans `apps/web/playwright.config.ts` avec trois navigateurs (Chromium, Firefox, WebKit).

### 9.3 Lighthouse

`lighthouserc.json` à la racine définit les seuils :
- Performance ≥ 95
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

À exécuter avec :

```bash
npx @lhci/cli autorun
```

### 9.4 Qualité du code

- **TypeScript strict** (`strict`, `noUncheckedIndexedAccess`)
- **ESLint** : 0 warning toléré (flag `--max-warnings 0`)
- **Pas de `any` implicite**, pas de `@ts-ignore` sans commentaire justificatif
- **Named exports** uniquement (sauf `page.tsx`, `layout.tsx`, `route.ts` pour Next)

---

## 10. Déploiement en production

### 10.1 Choix recommandé : Vercel + Neon

| Composant | Service | Justification |
|-----------|---------|---------------|
| Next.js apps | Vercel | Support natif Next 15, Edge Runtime, Cron, domaines wildcard |
| PostgreSQL | Neon | Serverless, scale-to-zero, branching par environnement, proche de Vercel |
| Médias | Cloudflare R2 | 0 € egress, CDN intégré |
| Emails | Resend | Gratuit jusqu'à 3k/mois, API simple |

### 10.2 Préparer Neon

1. Créer un projet Neon, région **Europe (Frankfurt)**.
2. Branche **`main`** = production ; créer les branches **`preview`** et **`staging`** pour les environnements respectifs.
3. Récupérer la connection string complète (`postgresql://...?sslmode=require`) → `DATABASE_URL` prod.
4. Créer un rôle `medsite_app` non-superuser pour l'application runtime :
   ```sql
   CREATE ROLE medsite_app WITH LOGIN PASSWORD '...' NOBYPASSRLS;
   GRANT CONNECT ON DATABASE medsite TO medsite_app;
   GRANT USAGE ON SCHEMA public TO medsite_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO medsite_app;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO medsite_app;
   ```
5. Appliquer les migrations **avant le premier déploiement** :
   ```bash
   DATABASE_URL="postgresql://owner:pwd@host/medsite?sslmode=require" pnpm db:migrate
   ```
6. Appliquer les politiques RLS :
   ```bash
   psql "$DATABASE_URL" -f packages/db/rls.sql
   ```
7. **Dans `DATABASE_URL` utilisé par Vercel**, pointer sur le rôle `medsite_app` (pas le owner).

### 10.3 Créer les trois projets Vercel

> Chaque app est un projet Vercel distinct pointant sur le même repo, avec un `Root Directory` différent.

#### Projet A — `medsite-web` (sites publics)

| Paramètre | Valeur |
|-----------|--------|
| Framework preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | `cd ../.. && pnpm build --filter=@medsite/web` |
| Install Command | `pnpm install --frozen-lockfile` |
| Output Directory | (défaut `.next`) |
| Node version | 20.x |
| Regions | `cdg1` (Paris) |

**Variables d'environnement** : copier **toutes** les variables de `.env.local`, en veillant à :
- `NEXT_PUBLIC_APP_URL=https://medsite.fr`
- `DATABASE_URL` utilise le rôle `medsite_app`
- `STRIPE_SECRET_KEY=sk_live_...` (en Production Environment)
- Marquer `NEXT_PUBLIC_*` comme `Available at Build Time`

**Domaines** :
- `medsite.fr`
- `www.medsite.fr`
- `*.medsite.fr` (wildcard pour sous-domaines tenants)
- Tous les domaines personnalisés ajoutés par les praticiens (via l'admin panel → Vercel API)

#### Projet B — `medsite-admin` (back-office Payload)

| Paramètre | Valeur |
|-----------|--------|
| Framework preset | Next.js |
| Root Directory | `apps/admin` |
| Build Command | `cd ../.. && pnpm build --filter=@medsite/admin` |
| Install Command | `pnpm install --frozen-lockfile` |

**Variables d'environnement** : mêmes que `medsite-web` (elles partagent la base et les intégrations).

**Domaine** : `admin.medsite.fr`.

#### Projet C — `medsite-platform` (super-admin interne)

| Paramètre | Valeur |
|-----------|--------|
| Framework preset | Next.js |
| Root Directory | `apps/platform` |
| Build Command | `cd ../.. && pnpm build --filter=@medsite/platform` |
| Install Command | `pnpm install --frozen-lockfile` |

**Domaine** : `platform.medsite.fr`, protégé par Vercel Password Protection ou authentification interne.

### 10.4 Variables d'environnement par scope

Dans chaque projet Vercel, configurer 3 environnements :

| Environment | Usage | DATABASE_URL | Stripe |
|-------------|-------|--------------|--------|
| **Production** | branche `main` | Neon branche `main` | `sk_live_*`, webhook live |
| **Preview** | PRs + branches | Neon branche `preview` | `sk_test_*`, webhook test |
| **Development** | `vercel dev` local | Neon branche `preview` ou local | `sk_test_*` |

### 10.5 Premier déploiement

```bash
git push origin main
```

Vercel détecte le push, build les trois projets en parallèle. Surveiller :

- **Build logs** : `cd ../.. && pnpm build --filter=…` ne doit pas timeout (> 45 min = problème)
- **Runtime logs** : après déploiement, visiter `/` et vérifier qu'aucune erreur `parseEnv` ne remonte

### 10.6 Déploiements suivants

- **Branches feature** → Preview deployment automatique sur `*-git-<branch>-<team>.vercel.app`
- **Merge sur `main`** → Production deployment

---

## 11. DNS, domaines et certificats

### 11.1 Enregistrements DNS principaux (`medsite.fr`)

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| `A` ou `ALIAS` | `@` | `76.76.21.21` (Vercel) | 3600 |
| `CNAME` | `www` | `cname.vercel-dns.com` | 3600 |
| `CNAME` | `*` | `cname.vercel-dns.com` | 3600 |
| `CNAME` | `admin` | `cname.vercel-dns.com` | 3600 |
| `CNAME` | `platform` | `cname.vercel-dns.com` | 3600 |
| `CNAME` | `media` | `<r2-id>.r2.cloudflarestorage.com` | 3600 |
| `TXT` | `@` | Resend SPF | 3600 |
| `TXT` | `resend._domainkey` | Resend DKIM | 3600 |
| `TXT` | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@medsite.fr` | 3600 |

> Le wildcard `*.medsite.fr` + son certificat TLS sont gérés automatiquement par Vercel (ACME).

### 11.2 Domaine personnalisé d'un praticien

Lorsqu'un praticien configure `www.cabinet-dupont.fr` dans son back-office :

1. Le praticien ajoute dans son DNS :
   ```
   www    CNAME   cname.vercel-dns.com
   @      A       76.76.21.21
   ```
2. L'admin panel appelle l'API Vercel pour ajouter le domaine au projet `medsite-web`.
3. Vercel émet automatiquement un certificat Let's Encrypt.
4. Le champ `domains.verified` passe à `true` via un callback de vérification (CRON ou webhook).

### 11.3 Ordre d'exécution

1. Ajouter le CNAME côté DNS du praticien **avant** d'ajouter le domaine à Vercel
2. Sinon Vercel ne pourra pas faire la validation HTTP et laissera le certificat en erreur

---

## 12. CRON jobs et tâches planifiées

### 12.1 Jobs existants

| Job | Endpoint | Schedule | Rôle |
|-----|----------|----------|------|
| `trial-expiry` | `POST /api/cron/trial-expiry` | `0 8 * * *` (08:00 UTC) | Email J-3 avant fin d'essai, suspension si J0 dépassé |
| `payment-retry` | (intégré au webhook Stripe) | — | Retry automatique via `invoice.payment_failed` |

Code source : [`packages/billing/src/cron/trial-expiry.ts`](../packages/billing/src/cron/trial-expiry.ts) — route invoquée depuis [`apps/admin/src/app/api/cron/trial-expiry/route.ts`](../apps/admin/src/app/api/cron/trial-expiry/route.ts).

### 12.2 Configuration Vercel Cron

Dans `apps/admin/vercel.json` :

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

Vercel envoie automatiquement le header `Authorization: Bearer $CRON_SECRET` lors de l'appel. Le handler refuse toute requête sans ce header valide.

### 12.3 Tester un CRON manuellement

```bash
curl -X POST https://admin.medsite.fr/api/cron/trial-expiry \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 13. Webhooks Stripe

### 13.1 En local

1. Lancer `apps/admin` : `pnpm dev` (port 3001)
2. Dans un autre terminal :
   ```bash
   stripe login
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```
3. Stripe CLI affiche un `whsec_...` temporaire → le coller dans `.env.local` sous `STRIPE_WEBHOOK_SECRET`.
4. Déclencher des événements de test :
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger invoice.paid
   stripe trigger invoice.payment_failed
   ```

### 13.2 En production

1. Dashboard Stripe > *Developers* > *Webhooks* > *Add endpoint*
2. URL : `https://admin.medsite.fr/api/webhooks/stripe`
3. Événements à écouter :
   - `checkout.session.completed` — nouvelle souscription
   - `invoice.paid` — paiement réussi
   - `invoice.payment_failed` — tentative échouée → entre en dunning
   - `customer.subscription.updated` — changement de plan, passage d'état
   - `customer.subscription.deleted` — résiliation
4. Copier le *Signing secret* (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET` (env Production)
5. Tester avec *Send test event* → doit renvoyer 200

> Le handler dans `packages/billing/src/webhook-handler.ts` **vérifie obligatoirement la signature** avec `stripe.webhooks.constructEvent(body, sig, secret)`. Les requêtes non signées sont rejetées avec 400.

---

## 14. Sécurité en production

### 14.1 Secrets

- `PAYLOAD_SECRET` : 32+ caractères, généré avec `openssl rand -base64 32`, **différent** entre environnements
- Rotation recommandée : annuelle, ou immédiate en cas de suspicion de fuite
- Stockage : Vercel env vars (chiffrées au repos) ; jamais dans le repo

### 14.2 Base de données

- Connexion TLS obligatoire (`?sslmode=require` dans `DATABASE_URL`)
- Rôle `medsite_app` avec `NOBYPASSRLS` pour le runtime
- Rôle owner utilisé **uniquement** pour migrations et seed
- Backups Neon : point-in-time restore 7 j sur plan gratuit, 30 j en payant

### 14.3 En-têtes HTTP

Définis dans `apps/web/next.config.ts` :

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

En compléter avec un `Content-Security-Policy` strict en production (non activé par défaut — à activer une fois les sources tierces validées : Stripe.js, Plausible, Google Maps, Doctolib iframe).

### 14.4 Paiements

- **Jamais** de données carte côté serveur : tout passe par Stripe Checkout et le Billing Portal
- Webhook Stripe : vérification de signature obligatoire, rejette si body modifié
- `STRIPE_SECRET_KEY` restreinte : créer une [*Restricted API key*](https://dashboard.stripe.com/apikeys) avec seulement les scopes nécessaires (Customers, Subscriptions, Checkout, Invoices, Webhooks)

### 14.5 PII et logs

- **Jamais** logger noms, emails, téléphones des patients
- Utiliser un helper `redactPII()` si besoin de tracer une requête
- Sentry / Vercel Logs : configurer le filtre `beforeSend` pour stripper les champs sensibles

### 14.6 Protection CSRF et rate limiting

- Server Actions Next 15 : token CSRF intégré
- Rate limiting : à configurer via middleware (avec Upstash Redis ou Vercel KV) sur :
  - `/api/webhooks/*` (peu utile, Stripe signe)
  - Formulaires de contact (anti-spam)
  - Endpoints auth Payload (anti-bruteforce)

---

## 15. Monitoring, logs et alertes

### 15.1 Sources de logs par service

| Service | Dashboard | Usage |
|---------|-----------|-------|
| **Vercel** | `vercel.com/<team>/<project>/logs` | Logs runtime (stdout/stderr) par fonction |
| **Neon** | `console.neon.tech/app/projects/<id>/monitoring` | Métriques CPU/connexions, slow query log |
| **Stripe** | Dashboard > Developers > Logs / Events | Appels API, livraison webhooks |
| **Resend** | Dashboard > Emails | Délivrabilité, bounces, opens |
| **Cloudflare R2** | Dashboard > R2 > Metrics | Volume stocké, requêtes, erreurs |
| **Plausible** | Dashboard | Analytics anonymes + conversions |

### 15.2 Alertes recommandées

- **Vercel** : alerte si > 5 % d'erreurs 5xx sur 5 minutes
- **Neon** : alerte si CPU > 80 % pendant 10 minutes
- **Stripe** : alerte sur échecs de livraison de webhook (`webhook_attempt_failed`)
- **Resend** : alerte si taux de bounce > 2 %

### 15.3 Vérifications après chaque déploiement

1. Visiter un site praticien : `https://dr-sophie-martin.medsite.fr` → 200, contenu complet
2. Vérifier JSON-LD via [Rich Results Test](https://search.google.com/test/rich-results)
3. Vérifier le webhook Stripe : Dashboard > Webhooks > dernière tentative = 200
4. Vérifier un email transactionnel : envoyer un test depuis le back-office
5. Vérifier la métrique Lighthouse (Vercel affiche un score automatique)

---

## 16. Procédures de rollback et de disaster recovery

### 16.1 Rollback applicatif (Vercel)

Chaque déploiement Vercel est **immuable**. Pour revenir à une version précédente :

```
Dashboard Vercel > Deployments > [version précédente] > "Promote to Production"
```

Effet instantané (< 10 s), aucun redéploiement nécessaire.

### 16.2 Rollback de migration DB

Drizzle ne génère pas de *down migrations* par défaut. Deux stratégies :

1. **Rollback non-destructif** : écrire une nouvelle migration qui inverse la précédente (recommandé pour les schémas en prod).
2. **Point-in-time restore Neon** : créer une nouvelle branche depuis un instant T antérieur, swapper la connection string, puis résoudre les écarts.

> ⚠️ Ne **jamais** `DROP COLUMN` en prod sans un déploiement en deux étapes (dual-write puis cleanup).

### 16.3 Restauration complète d'urgence

1. **Neon** : *Projects* > *Restore* → point-in-time dans les 7/30 j
2. **R2** : versioning non activé par défaut ; activer `Versioning` dans les settings du bucket pour conserver les anciennes versions des médias
3. **Secrets compromis** :
   - Régénérer `PAYLOAD_SECRET` → invalide tous les JWT, déconnexion globale
   - Régénérer `STRIPE_SECRET_KEY` → rotation dans Stripe + Vercel
   - Régénérer tokens R2, Resend, Plausible

---

## 17. Checklist Go-Live

À valider avant la mise en production :

### Code
- [ ] `pnpm typecheck` passe
- [ ] `pnpm lint` passe (0 warning)
- [ ] `pnpm test` passe (couverture ≥ cibles)
- [ ] `pnpm test:e2e` passe sur les 3 navigateurs
- [ ] Lighthouse ≥ 95 sur toutes les catégories (via `lighthouserc.json`)
- [ ] Aucun `console.log` ou `TODO` laissé en prod
- [ ] Aucune variable d'env hardcodée

### Infrastructure
- [ ] Base Neon créée, branches `main`/`preview` en place
- [ ] Migrations appliquées (`pnpm db:migrate`)
- [ ] RLS appliquée (`psql ... -f packages/db/rls.sql`)
- [ ] Rôle `medsite_app` (NOBYPASSRLS) créé et utilisé par l'app
- [ ] Bucket R2 créé avec domaine CDN configuré
- [ ] Domaine Resend validé (SPF + DKIM + DMARC verts)
- [ ] Produits Stripe créés (`pnpm --filter @medsite/billing setup:stripe`)
- [ ] Webhook Stripe production configuré + signing secret en env

### Vercel
- [ ] 3 projets créés (`web`, `admin`, `platform`)
- [ ] Toutes les variables d'env renseignées en Production
- [ ] Wildcard `*.medsite.fr` assigné à `medsite-web`
- [ ] `admin.medsite.fr` assigné à `medsite-admin`
- [ ] CRON `trial-expiry` planifié (`vercel.json`)
- [ ] `CRON_SECRET` défini et partagé entre Vercel et l'app

### Validation fonctionnelle
- [ ] Un tenant test accessible sur `<slug>.medsite.fr`
- [ ] JSON-LD validé via Rich Results Test pour chaque type de page
- [ ] Formulaire de contact → email reçu via Resend
- [ ] Parcours Stripe Checkout → souscription créée, webhook reçu 200
- [ ] Isolation multi-tenant testée (connexion tenant A ne voit pas tenant B)
- [ ] Upload d'image dans Payload → fichier visible sur `media.medsite.fr`
- [ ] Sitemap accessible à `<tenant>/sitemap.xml`

### Sécurité
- [ ] Headers HTTP vérifiés (curl -I)
- [ ] `PAYLOAD_SECRET` >= 32 caractères, unique à la prod
- [ ] Aucune clé `sk_test_*` dans l'env Production
- [ ] SSL valide sur tous les domaines configurés

---

## 18. Dépannage (FAQ technique)

### `pnpm install` échoue avec `ERR_PNPM_UNSUPPORTED_ENGINE`
Node < 20. Installer Node 20 LTS via nvm, volta ou fnm.

### `pnpm dev` : « Invalid environment variables »
La validation Zod liste les variables fautives. Vérifier `.env.local` :
- `PAYLOAD_SECRET` doit faire ≥ 32 caractères
- `STRIPE_SECRET_KEY` doit commencer par `sk_`
- `STRIPE_WEBHOOK_SECRET` par `whsec_`
- `RESEND_API_KEY` par `re_`
- Les URLs doivent être absolues et valides

### `pnpm db:migrate` : `ECONNREFUSED 127.0.0.1:5432`
Le conteneur Postgres n'est pas lancé : `docker compose up -d`.

### Sous-domaine `*.localhost` ne résout pas
Anciens navigateurs ou Safari : ajouter dans `/etc/hosts` :
```
127.0.0.1  dr-sophie-martin.localhost
127.0.0.1  cabinet-dupont.localhost
127.0.0.1  emilie-rousseau.localhost
```

### Payload admin : « PAYLOAD_SECRET mismatch »
Le secret a changé entre deux runs. Soit restaurer l'ancien, soit réinitialiser la base (`docker compose down -v && pnpm db:migrate && pnpm db:seed`).

### Webhook Stripe en local ne se déclenche pas
- `stripe listen` doit tourner en parallèle
- Le `whsec_...` affiché par Stripe CLI est **différent** du webhook prod — bien mettre celui-là dans `.env.local`
- L'app `admin` doit écouter sur `3001` (route `/api/webhooks/stripe`)

### Build Vercel échoue : « Cannot find module `@medsite/db` »
Vérifier que `Build Command` commence par `cd ../.. && pnpm build --filter=...`. Le build local au dossier `apps/web` ne voit pas les workspaces.

### Deployment Vercel : `Function Size Limit Exceeded`
Les fonctions serverless ont une limite de 50 Mo. Vérifier que `sharp` (image processing) n'est pas bundlé inutilement — il doit rester en `dependencies` avec `serverExternalPackages`.

### RLS bloque tous les accès en prod
La variable de session `app.current_tenant_id` n'est pas settée. Vérifier que `withTenant()` est bien appelé avant chaque requête Drizzle, et que le rôle utilisé n'a pas `BYPASSRLS` (sinon on ne voit rien du problème en dev, tout casse en prod).

### Lighthouse Performance < 95
Causes fréquentes :
- Image non passée par `next/image` → LCP dégradé
- JSON-LD trop volumineux dans `<head>` → bloque le TTFB
- Font custom non `display: swap` → CLS
- Doctolib iframe non-lazy → INP dégradé

### Erreur `ECONNRESET` vers Neon
Neon ferme les connexions inactives. Utiliser `postgres` (le client) avec `idle_timeout: 20, connect_timeout: 10` et un pool serverless-friendly.

---

## Annexes

- [`CLAUDE.md`](../CLAUDE.md) — conventions de code et règles projet
- [`turbo.json`](../turbo.json) — pipeline Turborepo
- [`packages/db/rls.sql`](../packages/db/rls.sql) — politiques RLS complètes
- [`packages/config/src/env.ts`](../packages/config/src/env.ts) — schéma Zod des variables d'env
- [`docker-compose.yml`](../docker-compose.yml) — base Postgres locale
