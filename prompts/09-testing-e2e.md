# Prompt 09 — Stratégie de tests et E2E

## Contexte
Le MVP approche de sa complétion. Tu mets en place la stratégie de tests complète : unitaires (Vitest), intégration (Vitest + test containers), et E2E (Playwright).

## Objectif
Garantir la fiabilité du système multi-tenant, la validité du SEO, le bon fonctionnement de l'intégration Doctolib, et la sécurité de l'isolation des données.

## Instructions

### 1. Configuration Vitest (`vitest.config.ts` racine)

```typescript
export default defineConfig({
  test: {
    workspace: [
      'packages/*/vitest.config.ts',
      'apps/*/vitest.config.ts',
    ],
    coverage: {
      provider: 'v8',
      thresholds: {
        'packages/*': { statements: 80, branches: 75 },
        'apps/*': { statements: 60, branches: 55 },
      },
    },
  },
})
```

### 2. Tests unitaires critiques

#### packages/seo
- Chaque générateur JSON-LD testé avec les 3 segments (spécialiste, paramédical, bien-être)
- Validation des @id cohérents entre pages (le Physician est le même partout)
- Validation du JSON-LD contre `schema-dts` types
- Test du mapping spécialité → schemaOrgType (toutes les entrées + fallback default)
- Test des meta generators (title patterns, description truncation)
- Test des cas limites : bio vide, pas de photo, pas de prix, pas d'avis, pas de Doctolib

#### packages/doctolib
- Extraction de slug : 15+ formats d'URL (www, sans www, avec params, avec ancre, URL invalide, URL non-Doctolib)
- Résolution bookingMode : toutes les combinaisons (doctolib seul, alternative seul, les deux, aucun)
- Rendu BookingCta : chaque combinaison bookingMode × context (hero, header, service, sticky, footer)
- Widget : attributs iframe corrects (allowpaymentrequest, loading, title)

#### packages/billing
- Webhook handler : chaque type d'événement Stripe (mock Stripe events)
- Cycle de vie abonnement : trial → active → suspended → cancelled
- Calcul prorata upgrade/downgrade

#### packages/db
- Schémas Zod : validation avec données valides et invalides
- Helpers de query : tenant isolation (ne retourne jamais de données cross-tenant)

### 3. Tests d'intégration (avec test database)

Utiliser Testcontainers pour lancer un PostgreSQL éphémère :

```typescript
import { PostgreSqlContainer } from '@testcontainers/postgresql'

beforeAll(async () => {
  const container = await new PostgreSqlContainer().start()
  process.env.DATABASE_URL = container.getConnectionUri()
  await runMigrations()
  await seed()
})
```

Tests critiques :
- **Isolation multi-tenant** : créer 2 tenants, insérer des données pour chacun, vérifier qu'une requête avec tenant_id A ne retourne JAMAIS de données de B
- **RLS enforcement** : vérifier que les politiques RLS bloquent les accès cross-tenant même avec des requêtes directes
- **Cascade delete** : supprimer un tenant → toutes ses données sont supprimées
- **Unique constraints** : slug unique, domain unique, email unique

### 4. Tests E2E Playwright (`apps/web/e2e/`)

#### Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'pnpm dev',
    port: 3003,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
  ],
})
```

#### Scénarios E2E

**1. Parcours patient sur un site praticien avec Doctolib**
```
→ Accéder à sophie-martin.localhost:3003
→ Vérifier le hero section (nom, spécialité, CTA "Prendre RDV")
→ Vérifier que le bouton CTA pointe vers Doctolib
→ Naviguer vers /actes
→ Cliquer sur un acte
→ Vérifier le CTA contextuel "Prendre RDV pour {acte}"
→ Naviguer vers /contact
→ Remplir et soumettre le formulaire
→ Vérifier le message de confirmation
→ Vérifier que le JSON-LD est présent sur chaque page visitée
```

**2. Parcours patient sur un site praticien SANS Doctolib**
```
→ Accéder à emilie-rousseau.localhost:3003
→ Vérifier que le CTA est "Me contacter" (pas "Prendre RDV")
→ Vérifier qu'il n'y a PAS d'iframe Doctolib
→ Vérifier que le sticky bar mobile affiche "Appeler" + "Écrire"
→ Naviguer vers /contact
→ Vérifier le formulaire de contact
```

**3. SEO validation**
```
→ Pour chaque page de chaque tenant de test :
  → Vérifier la présence de <script type="application/ld+json">
  → Parser le JSON-LD et vérifier les champs obligatoires
  → Vérifier le <title> et la <meta name="description">
  → Vérifier les balises Open Graph
  → Vérifier la présence de canonical URL
  → Vérifier les balises alt sur toutes les images
→ Accéder à /sitemap.xml et vérifier les URLs
→ Accéder à /robots.txt et vérifier la structure
```

**4. Isolation multi-tenant**
```
→ Accéder à sophie-martin.localhost:3003
→ Vérifier que le contenu est celui de Sophie Martin
→ Accéder à dupont-kine.localhost:3003
→ Vérifier que le contenu est celui de Cabinet Dupont
→ Aucune donnée croisée
```

**5. Responsive et accessibilité**
```
→ Pour chaque page :
  → Tester en viewport mobile (375px)
  → Vérifier le menu burger
  → Vérifier le sticky bar
  → Tester la navigation clavier (Tab à travers tous les éléments interactifs)
  → Vérifier les contrastes (via axe-playwright)
```

**6. Performance (Lighthouse CI)**
```
→ Pour la page d'accueil de chaque tenant :
  → Lighthouse performance ≥ 90
  → Lighthouse accessibility ≥ 95
  → Lighthouse SEO ≥ 95
  → Lighthouse best practices ≥ 90
  → LCP < 2.5s
```

### 5. CI Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI
on: [push, pull_request]
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test --coverage

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: medsite_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
    steps:
      - run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e

  lighthouse:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - run: pnpm build
      - run: pnpm start &
      - uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: lighthouserc.json
```

### 6. Lighthouse CI config (`lighthouserc.json`)

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://sophie-martin.localhost:3003/",
        "http://sophie-martin.localhost:3003/actes",
        "http://sophie-martin.localhost:3003/a-propos"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

## Contraintes
- Les tests ne doivent JAMAIS dépendre de services externes (Stripe, Doctolib, Google Maps) — tout est mocké
- Les fixtures de test utilisent les mêmes données que le seed (3 tenants réalistes)
- Le pipeline CI doit s'exécuter en moins de 10 minutes
- Les tests E2E doivent fonctionner en parallèle (pas de dépendance entre scénarios)
- Chaque PR doit passer TOUS les tests avant merge
