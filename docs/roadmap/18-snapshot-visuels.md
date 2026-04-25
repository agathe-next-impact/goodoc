# Chantier 18 — Snapshot tests visuels (Storybook + Chromatic ou Playwright screenshots)

## But

Bloquer en CI toute régression visuelle non intentionnelle sur les blocs et les 30 presets de pages. Workflow type : un dev change une CSS, la PR montre le diff visuel, l'équipe valide ou refuse.

## Pré-requis

- Bibliothèque blocs stable
- Choix outil : **Storybook + Chromatic** (UI riche, payant ~ $149/mois) OU **Playwright screenshots committed dans le repo** (gratuit, Git-friendly mais plus rugueux). Recommandation V1 : Playwright screenshots, pivot Chromatic si la base devient ingérable.

## Périmètre exact

**Inclus (option Playwright) :**
- Spec Playwright qui rend chaque bloc isolé sur une page de demo et screenshot
- Spec qui rend chaque preset (30) en viewport mobile + desktop et screenshot
- Screenshots committed dans `apps/web/e2e/__screenshots__/`
- CI : `playwright test --update-snapshots` désactivé sur main, `playwright test` compare et fail si diff > seuil
- Workflow PR : si diff intentionnel, dev relance localement avec `--update-snapshots` et commit

**Exclus :**
- Snapshot par browser × OS croisé (juste chromium-linux V1)
- Storybook (réservé V2 si la dette devient claire)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/web/e2e/visual/blocks.spec.ts` | nouveau |
| `apps/web/e2e/visual/presets.spec.ts` | nouveau |
| `apps/web/e2e/__screenshots__/**` | nouveau — généré |
| `apps/web/playwright.config.ts` | modifié — config snapshot threshold |
| `.github/workflows/ci.yml` | modifié — job visual depend e2e |
| `docs/testing/visual-snapshots.md` | nouveau — guide |

## Étapes d'implémentation

1. Créer une route `apps/web/src/app/(dev)/preview/[blockType]/page.tsx` (gated par env `NODE_ENV=development` ou flag `MEDSITE_PREVIEW=1`) qui rend un bloc isolé avec data fixture.
2. Spec Playwright qui parcourt la liste de blocs et screenshot chacun en mobile (375 px) et desktop (1280 px).
3. Spec preset : seed un tenant fixture, visiter chaque page preset, screenshot.
4. Configurer `toMatchSnapshot({ maxDiffPixelRatio: 0.005 })` (0,5 % tolérance pour le bruit antialiasing).
5. Script `pnpm test:visual:update` pour régénérer en local.
6. Documenter le workflow PR.

## Critères de done

- [ ] 17 blocs × 2 viewports = 34 screenshots committed
- [ ] 30 presets × 2 viewports = 60 screenshots committed
- [ ] CI échoue si diff > seuil
- [ ] Dev sait régénérer en 1 commande
- [ ] Doc workflow publiée
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts

## Risques connus

- Bruit antialiasing entre Linux/Windows (les devs sur Windows régénèrent et CI Linux fail). Mitigation : générer tous les snapshots dans un container Docker équivalent CI, ou ne régénérer que via CI artifact.
- Taille du repo (90+ PNG) : envisager Git LFS si > 50 MB cumulés.

## Tests à ajouter

- Les specs visuelles SONT les tests
- Smoke E2E : la route `/preview/[blockType]` rend bien chaque bloc

## Estimation

1 jour.
