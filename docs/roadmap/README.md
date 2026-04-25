# Roadmap — système de templates MedSite

> Référence opérationnelle pour la suite des travaux après les Phases 2 → 8 (système de templates de base).
> Chaque chantier a son propre fichier détaillé dans ce dossier, avec : but, périmètre exact, fichiers touchés, critères de done, dépendances et estimation.

## État au démarrage de la roadmap

**Fait — Phases 2 à 8 closes**
- `@medsite/templates` package : registry, 13 blocs, 5 thèmes, 30 compositions
- Route dynamique `apps/web/src/app/(tenant)/p/[slug]`
- Back-office Payload aligné (13 Blocks miroirs, 5 templateId)
- Endpoint `POST /api/apply-template-preset` + galerie admin
- JSON-LD dans 4 blocs, doc authoring complète
- 25 tests `@medsite/templates`, 227 tests monorepo, 0 warning lint

**À faire — chantiers détaillés ci-dessous**

## Chantiers ordonnés par priorité

### Priorité 1 — Pré-prod (à faire avant early adopters)

| # | Chantier | Estimation | Fichier |
|---|----------|------------|---------|
| 01 | Validation visuelle locale | 0,5 j | [01-validation-visuelle.md](01-validation-visuelle.md) |
| 02 | Live Preview Payload | 1 j | [02-live-preview.md](02-live-preview.md) |
| 03 | Lighthouse CI | 0,5 j | [03-lighthouse-ci.md](03-lighthouse-ci.md) |
| 04 | E2E Playwright templates | 1 j | [04-e2e-templates.md](04-e2e-templates.md) |
| 05 | Onboarding wizard | 2 j | [05-onboarding-wizard.md](05-onboarding-wizard.md) |

### Priorité 2 — UX praticien

| # | Chantier | Estimation | Fichier |
|---|----------|------------|---------|
| 06 | Migration pages hardcodées | 1,5 j | [06-migration-pages-hardcodees.md](06-migration-pages-hardcodees.md) |
| 07 | Upload images intégré | 1 j | [07-upload-images.md](07-upload-images.md) |
| 08 | Galerie admin avec previews réels | 0,5 j | [08-galerie-screenshots.md](08-galerie-screenshots.md) |
| 09 | Drag & drop sections + draft | 0,5 j | [09-drag-drop-draft.md](09-drag-drop-draft.md) |

### Priorité 3 — SEO et performance

| # | Chantier | Estimation | Fichier |
|---|----------|------------|---------|
| 10 | JSON-LD page-level | 0,5 j | [10-jsonld-page-level.md](10-jsonld-page-level.md) |
| 11 | Optimisation images (next/image) | 0,5 j | [11-next-image.md](11-next-image.md) |
| 12 | Sitemap dynamique par tenant | 0,5 j | [12-sitemap-tenant.md](12-sitemap-tenant.md) |
| 13 | Open Graph automatique | 0,5 j | [13-open-graph.md](13-open-graph.md) |

### Priorité 4 — Fonctionnel

| # | Chantier | Estimation | Fichier |
|---|----------|------------|---------|
| 14 | Blocs additionnels (Gallery, Timeline, Video…) | 2 j | [14-blocs-additionnels.md](14-blocs-additionnels.md) |
| 15 | Internationalisation (next-intl) | 1,5 j | [15-i18n.md](15-i18n.md) |
| 16 | A/B testing intégré | 1 j | [16-ab-testing.md](16-ab-testing.md) |

### Priorité 5 — Gouvernance et infra

| # | Chantier | Estimation | Fichier |
|---|----------|------------|---------|
| 17 | Versionning des blocs | 0,5 j | [17-versionning-blocs.md](17-versionning-blocs.md) |
| 18 | Snapshot tests visuels (Storybook) | 1 j | [18-snapshot-visuels.md](18-snapshot-visuels.md) |
| 19 | Doc utilisateur praticien | 1 j | [19-doc-praticien.md](19-doc-praticien.md) |
| 20 | Audit WCAG AA complet | 1 j | [20-wcag-aa.md](20-wcag-aa.md) |
| 21 | Cache fin par bloc + edge config | 1 j | [21-cache-edge.md](21-cache-edge.md) |
| 22 | Export / import JSON tenant | 0,5 j | [22-export-import.md](22-export-import.md) |

## Méthode pour reprendre la suite

1. Ouvrir le chantier ciblé dans `docs/roadmap/<num>-*.md`
2. Vérifier la section **Pré-requis** — le chantier précédent peut être bloquant
3. Lire **Périmètre exact** + **Fichiers touchés** + **Critères de done**
4. Implémenter, faire tourner `pnpm typecheck && pnpm lint && pnpm test`
5. Créer une PR par chantier

## Convention de structure d'un fichier de chantier

Chaque fichier `<num>-<slug>.md` suit le gabarit suivant :
- **But** — une phrase
- **Pré-requis** — chantiers ou setup à valider avant
- **Périmètre exact** — ce qui est fait et ce qui ne l'est pas
- **Fichiers touchés** — chemins absolus dans le monorepo
- **Étapes d'implémentation** — pas-à-pas avec snippets
- **Critères de done** — checklist vérifiable
- **Risques connus** — pièges anticipés
- **Tests à ajouter** — typecheck/lint/test/E2E selon le chantier
- **Estimation** — jours-homme

Le fichier [`_template-chantier.md`](_template-chantier.md) sert de squelette pour les chantiers à créer ultérieurement (priorités 4-5 non encore détaillées).
