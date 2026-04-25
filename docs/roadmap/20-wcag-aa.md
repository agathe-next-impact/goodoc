# Chantier 20 — Audit WCAG 2.2 AA complet

## But

Garantir l'accessibilité WCAG 2.2 niveau AA sur l'ensemble des sites tenants : contraste, navigation clavier, ARIA, focus visible, alt images, formulaires labellisés, hiérarchie de titres. Argument commercial fort dans le secteur santé (RGAA en France) et anticipation de l'European Accessibility Act (juin 2025 — déjà en vigueur en 2026). À remonter en P3 si l'accessibilité doit être un argument de vente.

## Pré-requis

- Templates stabilisés
- 17 blocs (après #14) ou 13 (avant) : audit possible sur les deux sets
- Outillage : `axe-core/playwright`, `pa11y`, `eslint-plugin-jsx-a11y`

## Périmètre exact

**Inclus :**
- ESLint plugin `jsx-a11y` activé en `error` dans `apps/web` et `packages/templates`
- Spec Playwright qui exécute axe sur chaque page tenant (home, services, blog, faq, contact, /p/[slug]) et chaque variante de bloc → 0 violation `serious` ou `critical`
- Audit manuel des 13 (ou 17) blocs : navigation clavier, lecteur d'écran (NVDA Windows ou VoiceOver Mac), contraste WebAIM 4.5:1
- Correction des écarts trouvés (typiquement : roles ARIA manquants, focus invisible, contraste insuffisant sur thèmes warm-wellness/family-practice)
- Skip-link "Aller au contenu principal" sur toutes les pages tenant
- Tabordre validé sur la home tenant
- Form `contact` : labels explicites, error messages associés via `aria-describedby`

**Exclus :**
- Niveau AAA
- Audit `apps/admin` (Payload) — c'est l'outil interne du praticien, AA admin est nice-to-have V2

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/web/eslint.config.mjs` | modifié — jsx-a11y error |
| `packages/templates/eslint.config.mjs` | modifié |
| `apps/web/e2e/accessibility.spec.ts` | étendu — toutes pages |
| `apps/web/src/components/skip-link.tsx` | nouveau |
| `apps/web/src/app/(tenant)/layout.tsx` | modifié — inclut skip-link |
| `packages/templates/src/blocks/*` | corrections ponctuelles selon audit |
| `packages/templates/src/themes/*` | ajustements contraste si besoin |
| `docs/audits/wcag-aa-<date>.md` | nouveau — rapport d'audit |

## Étapes d'implémentation

1. Activer `jsx-a11y` en error → corriger les warnings existants (souvent < 20).
2. Étendre la spec accessibilité Playwright : pour chaque page tenant publique, axe avec tags `wcag2a, wcag2aa, wcag22aa`.
3. Audit manuel (1 j) : parcourir les 13 blocs au clavier sur la page de demo `/preview/[blockType]` (cf. #18). Lecteur d'écran sur la home complète d'un tenant seedé.
4. Vérifier contraste sur les 5 thèmes : exporter les paires de couleurs principales, valider via WebAIM contrast checker.
5. Documenter écarts trouvés + corrections dans `docs/audits/wcag-aa-<date>.md`.
6. Activer un job CI dédié `pnpm test:a11y`.

## Critères de done

- [ ] axe report : 0 violation `serious`/`critical` sur 6 pages échantillon
- [ ] Tabordre cohérent sur home, contact, blog
- [ ] Skip-link présent et fonctionnel
- [ ] Tous les contrastes ≥ 4.5:1 sur les 5 thèmes
- [ ] `jsx-a11y` en error, 0 warning
- [ ] Rapport d'audit publié dans `docs/audits/`
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts

## Risques connus

- Thèmes "warm-wellness" et "family-practice" peuvent avoir des contrastes limites — peut nécessiter des ajustements de tokens couleur, donc impact visuel.
- axe ne capture pas tout (~ 30-40 % des problèmes WCAG sont algorithmiquement détectables) → audit manuel obligatoire.
- Iframes Doctolib : axe peut signaler des violations dans l'iframe ; à exclure du scope (responsabilité Doctolib).

## Tests à ajouter

- E2E axe sur 6 pages × 5 thèmes (parametrisé)
- Test unitaire skip-link visible au focus

## Estimation

1 jour.
