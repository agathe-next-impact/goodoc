# Stratégie de tests

## État actuel (2026-04-25)

- **Unit** : Vitest 2.1.8. Configs présentes dans `apps/web`, `packages/billing`, `packages/doctolib`, `packages/templates`. Workspace racine : `vitest.workspace.ts`. Plusieurs packages sans tests (analytics, config, db, email, seo, types, ui).
- **E2E** : Playwright 1.49.1 dans `apps/web/e2e/`. CI installe `chromium` + `webkit` avec un service Postgres 16. Lance `pnpm db:migrate && pnpm db:seed` avant les specs.
- **Couverture** : non mesurée. Pas de gate CI sur le pourcentage.
- **CI** : `.github/workflows/ci.yml` jobs `typecheck`, `lint`, `unit-tests`, `e2e-tests` (e2e dépend de typecheck + unit).
- **Lint** : `next lint --max-warnings 0` par app — aucune warning tolérée.

## Objectif (cible)

- Tout nouveau flow critique (billing/Stripe webhooks, RLS Postgres, multi-tenant routing, génération SEO) couvert par unit ou E2E avant merge.
- Maintenir le `--max-warnings 0` en lint sur le code modifié.
- Ne pas désactiver silencieusement un test ou un type check (cf. CLAUDE.md règle 4).

## Conventions

- Vitest : fichiers `*.test.ts` ou `*.spec.ts` co-localisés avec le code.
- Playwright : specs sous `apps/web/e2e/`, helpers dans `apps/web/e2e/helpers/` (à créer si besoin).
- Pas de mock DB pour les tests d'intégration billing/RLS — utiliser le service Postgres CI (cohérent avec la stratégie observée en CI).

## TODO

- Mesurer la couverture sur `packages/billing` et `packages/db` (zones critiques sécurité/argent).
- Smoke test E2E par app (`web`, `admin`, `platform`) — uniquement `web` couverte aujourd'hui.
- Fixtures de tenant pour tests RLS.
