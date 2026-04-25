# Chantier 03 — Lighthouse CI

## But

Garantir Performance / Accessibility / Best Practices / SEO ≥ 95 sur les 6 pages canoniques de chaque thème, en bloquant la PR si un seuil est cassé. `lighthouserc.json` existe déjà à la racine — il faut le brancher en CI et adapter les URLs.

## Pré-requis

- Chantier 01 (rendu OK validé)
- Build production fonctionnel (`pnpm build` passe)
- Base seedée disponible en CI (Postgres ephémère)

## Périmètre exact

**Inclus :**
- Workflow GitHub Actions `.github/workflows/lighthouse.yml`
- Mise à jour de `lighthouserc.json` avec les 18 URLs (3 tenants × 6 pages)
- Démarrage de Postgres + seed + serveur Next.js dans le job CI
- Blocage de la PR si un seuil < 95

**Exclus :**
- Lighthouse mobile uniquement (on lance les deux profils)
- Audit visuel (chantier 18)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `lighthouserc.json` | mise à jour des URLs + assertions |
| `.github/workflows/lighthouse.yml` | nouveau |
| `package.json` | + script `lighthouse:ci` |

## Étapes d'implémentation

### 1. Mettre à jour `lighthouserc.json`

```jsonc
{
  "ci": {
    "collect": {
      "url": [
        "http://dr-sophie-martin.localhost:3003/p/home",
        "http://dr-sophie-martin.localhost:3003/p/a-propos",
        "http://dr-sophie-martin.localhost:3003/p/services",
        "http://dr-sophie-martin.localhost:3003/p/contact",
        "http://dr-sophie-martin.localhost:3003/p/faq",
        "http://dr-sophie-martin.localhost:3003/p/tarifs"
      ],
      "numberOfRuns": 3,
      "settings": { "preset": "desktop" }
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

### 2. GitHub Actions

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on:
  pull_request:
    paths:
      - 'apps/web/**'
      - 'packages/templates/**'
      - 'packages/seo/**'
      - 'packages/ui/**'
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: medsite
        ports: ['5432:5432']
        options: --health-cmd pg_isready --health-interval 5s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:migrate
        env: { DATABASE_URL: postgresql://postgres:postgres@localhost:5432/medsite }
      - run: pnpm db:seed
        env: { DATABASE_URL: postgresql://postgres:postgres@localhost:5432/medsite }
      - run: pnpm build --filter=@medsite/web
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/medsite
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET_TEST }}
          NEXT_PUBLIC_APP_URL: http://localhost:3003
      - run: pnpm --filter @medsite/web start &
      - run: npx wait-on http://localhost:3003
      - run: npx @lhci/cli@0.13.x autorun
```

### 3. Script local

```json
// package.json
"scripts": {
  "lighthouse:ci": "lhci autorun"
}
```

## Critères de done

- [ ] Le workflow tourne sur une PR de test
- [ ] Les 4 scores ≥ 95 sur les 6 URLs
- [ ] Une régression intentionnelle (ex. `<img>` sans dimensions) fait bien échouer la CI
- [ ] Lien vers le rapport Lighthouse en commentaire automatique sur la PR

## Risques connus

- Le `host` `*.localhost` ne se résout pas automatiquement en CI Linux → ajouter à `/etc/hosts` ou utiliser `127.0.0.1` avec un header `Host` injecté côté Lighthouse.
- Premier run depuis Vercel cold start peut faire chuter Performance — utiliser `numberOfRuns: 3` et garder la médiane.
- Les images Unsplash peuvent ralentir le LCP en CI ; héberger sur R2 ou utiliser des fixtures locales.

## Tests à ajouter

Le workflow EST le test. Pas de unit test additionnel.

## Estimation

0,5 jour.
