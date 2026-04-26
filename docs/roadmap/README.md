# Roadmap — système de templates MedSite

> Référence opérationnelle pour la suite des travaux après les Phases 2 → 8 (système de templates de base).
> Chaque chantier a son propre fichier détaillé dans ce dossier, avec : but, périmètre exact, fichiers touchés, critères de done, dépendances et estimation.
>
> **Numérotation = ordre de création des fichiers, PAS ordre d'exécution.** L'ordre d'exécution est donné par la priorité (P0 → P5) puis par le plan d'exécution recommandé plus bas.

## État au démarrage de la roadmap

**Fait — Phases 2 à 8 closes**
- `@medsite/templates` package : registry, 13 blocs, 5 thèmes, 30 compositions
- Route dynamique `apps/web/src/app/(tenant)/p/[slug]`
- Back-office Payload aligné (13 Blocks miroirs, 5 templateId)
- Endpoint `POST /api/apply-template-preset` + galerie admin
- JSON-LD dans 4 blocs, doc authoring complète
- 25 tests `@medsite/templates`, 227 tests monorepo, 0 warning lint

**Fait — pré-requis dette**
- ✅ R2 storage endpoint correctement configuré (`payload.config.ts:117`)

**À faire — chantiers détaillés ci-dessous**

## Chantiers ordonnés par priorité

### Priorité 0 — Bloqueurs critiques (rien d'utilisable sans eux)

| # | Chantier | Estimation | Fichier |
|---|----------|------------|---------|
| 23 | ✅ **Accès praticien aux collections Payload** | 1,5 j | [23-acces-praticien-payload.md](23-acces-praticien-payload.md) |
| 00 | ✅ **Cadrage élargi `apps/platform`** | 3 j | [00-platform-scope.md](00-platform-scope.md) |

> ✅ **#23** — livré (commit `c239223`).
>
> ✅ **#00** — livré (2026-04-26) : auth Payload partagée, dashboard, messages, abonnement Stripe, paramètres, support, login/logout. Voir `apps/platform/src/app/(app)/`.
>
> Voir aussi les entrées Critical de [`docs/tech-debt.md`](../tech-debt.md).

### Priorité 1 — Pré-prod (à faire avant early adopters)

| # | Chantier | Estimation | Fichier |
|---|----------|------------|---------|
| 02 | Live Preview Payload | 1 j | [02-live-preview.md](02-live-preview.md) |
| 05 | Onboarding wizard | 2 j | [05-onboarding-wizard.md](05-onboarding-wizard.md) |
| 01 | Validation visuelle locale | 0,5 j | [01-validation-visuelle.md](01-validation-visuelle.md) |
| 03 | Lighthouse CI | 0,5 j | [03-lighthouse-ci.md](03-lighthouse-ci.md) |
| 04 | E2E Playwright templates | 1 j | [04-e2e-templates.md](04-e2e-templates.md) |

### Priorité 2 — UX praticien

| # | Chantier | Estimation | Fichier |
|---|----------|------------|---------|
| 07 | Upload images intégré | 1 j | [07-upload-images.md](07-upload-images.md) |
| 06 | Migration pages hardcodées | 1,5 j | [06-migration-pages-hardcodees.md](06-migration-pages-hardcodees.md) |
| 08 | Galerie admin avec previews réels | 0,5 j | [08-galerie-screenshots.md](08-galerie-screenshots.md) |
| 09 | Drag & drop sections + draft | 0,5 j | [09-drag-drop-draft.md](09-drag-drop-draft.md) |

### Priorité 3 — SEO et performance

| # | Chantier | Estimation | Fichier |
|---|----------|------------|---------|
| 10 | JSON-LD page-level | 0,5 j | [10-jsonld-page-level.md](10-jsonld-page-level.md) |
| 13 | Open Graph automatique | 0,5 j | [13-open-graph.md](13-open-graph.md) |
| 12 | Sitemap dynamique par tenant | 0,5 j | [12-sitemap-tenant.md](12-sitemap-tenant.md) |
| 11 | Optimisation images (next/image) | 0,5 j | [11-next-image.md](11-next-image.md) |

### Priorité 4 — Durcissement & gouvernance

| # | Chantier | Estimation | Fichier |
|---|----------|------------|---------|
| 20 | Audit WCAG AA complet | 1 j | [20-wcag-aa.md](20-wcag-aa.md) |
| 17 | Versionning des blocs | 0,5 j | [17-versionning-blocs.md](17-versionning-blocs.md) |
| 18 | Snapshot tests visuels | 1 j | [18-snapshot-visuels.md](18-snapshot-visuels.md) |
| 21 | Cache fin par bloc + edge config | 1 j | [21-cache-edge.md](21-cache-edge.md) |

### Priorité 5 — Post-PMF (selon signal terrain)

| # | Chantier | Estimation | Trigger | Fichier |
|---|----------|------------|---------|---------|
| 19 | Doc utilisateur praticien | 1 j | ≥ 5 demandes support similaires | [19-doc-praticien.md](19-doc-praticien.md) |
| 22 | Export / import JSON tenant | 0,5 j | 1re demande RGPD article 20 ou besoin staging→prod | [22-export-import.md](22-export-import.md) |
| 14 | Blocs additionnels (Gallery, Timeline, Video, Stats) | 2 j | Retour terrain "il manque X" | [14-blocs-additionnels.md](14-blocs-additionnels.md) |
| 16 | A/B testing intégré | 1 j | Trafic significatif sur ≥ 5 tenants | [16-ab-testing.md](16-ab-testing.md) |
| 15 | Internationalisation (next-intl) | 1,5 j | Confirmation produit ≥ 3 praticiens patientèle bilingue | [15-i18n.md](15-i18n.md) |

## Plan d'exécution recommandé

> Réorganisé au 2026-04-25 après détection des bloqueurs #23 et #00. La logique : **sérialiser ce qui partage du code, paralléliser ce qui touche des couches indépendantes.**

### Trois pistes parallèles (si > 1 dev)

- **Piste A — Backend / Plateforme** (`apps/platform`, `packages/billing`, `packages/db`)
- **Piste B — Édition contenu** (`apps/admin`, Payload, blocs)
- **Piste C — Front public + qualité** (`apps/web`, perf, SEO, tests)

### Phase 0 — Pré-requis bloquants (~1 j, AVANT tout)

| Ordre | Action | Pourquoi maintenant |
|---|---|---|
| 0.1 | Audit sécurité formel `/security-review` (1 j initial) | Détecter tôt les bloqueurs RGPD/santé avant 15 j de dev |
| 0.2 | Décisions produit à acter (réunion 1 h) | i18n (#15) ? Storybook vs Playwright pour #18 ? Auth partagée Payload vs indépendante pour #00 ? Multi-user par tenant pour #23 ? |

> ✅ Le fix R2 endpoint qui figurait initialement ici est résolu (vérifié 2026-04-25 — `payload.config.ts:117` lit bien `CLOUDFLARE_R2_ENDPOINT`).

### Phase 1 — Sprint « Débloquer + ouvrir » (~6,5 j calendaire à 3 pistes, ~12 j solo)

```
Piste A (backend)              Piste B (édition)          Piste C (front + qualité)
─────────────────              ──────────────────         ─────────────────────────
#00 platform (3 j)        ─→   #23 accès payload (1,5 j) #01 validation visuelle (0,5 j)
                               #02 live preview (1 j)    #03 lighthouse CI (0,5 j)
                               #05 onboarding (2 j)      #04 E2E templates (1 j)
```

- **Piste A** : `#00` seul, pas de dépendance interne. C'est le plus long de la phase, démarrer en premier.
- **Piste B** : `#23 → #02 → #05` — ordre strict. Sans #23, un praticien connecté ne voit rien dans Payload : ni #02 ni #05 ne sont testables. Sans #02, l'étape 5 du wizard #05 ne peut pas afficher la preview.
- **Piste C** : `#01` AVANT `#03`/`#04` — la validation visuelle locale aide à débugger les snapshots et les seuils Lighthouse.

**Synchro de fin de phase** : merger dans l'ordre **C → B → A** (de plus étroit à plus large) pour minimiser les conflits.

**Sortie** : produit ouvrable aux early adopters — un praticien peut s'inscrire, choisir un template, éditer son profil et son contenu, voir un dashboard et publier son site.

### Phase 2 — Sprint « UX praticien » (~3,5 j / ~7 j solo)

Tous les chantiers touchent `apps/admin` → **séquentiel obligatoire** (sinon conflits sur Payload collections + UI editor).

| Ordre | Chantier | Pourquoi cet ordre |
|---|---|---|
| 1 | `#07` Upload images (1 j) | Pré-requis pour #06 et #08 |
| 2 | `#06` Migration pages hardcodées (1,5 j) | Une fois l'upload OK, on remplace `/marketing/*` stub par de vraies pages éditables |
| 3 | `#08` Galerie admin previews réels (0,5 j) | Améliore la galerie servant dans #05 |
| 4 | `#09` Drag & drop + draft (0,5 j) | UX pure, indépendant — peut glisser en Phase 3 si pression |

### Phase 3 — Sprint « SEO + perf » (~2 j à 1-2 pistes / ~2 j solo)

Quatre chantiers courts, partiellement parallélisables :

| Ordre | Chantier | Parallélisable ? |
|---|---|---|
| 1 | `#10` JSON-LD page-level (0,5 j) | sérialiser avec #13 (mêmes `generateMetadata`) |
| 2 | `#13` Open Graph (0,5 j) | sérialiser avec #10 |
| 3 | `#12` Sitemap tenant (0,5 j) | parallèle (fichier distinct) |
| 4 | `#11` next/image (0,5 j) | en dernier — gros volume, dépend de #03 (mesure Lighthouse) |

### Phase 4 — Sprint « Durcissement » (~3,5 j à 2 pistes / ~3,5 j solo)

| Piste qualité       | Piste sécu / perf  |
|--------------------|--------------------|
| `#17` versioning (0,5 j) AVANT `#18` snapshots (1 j) | `#20` WCAG AA (1 j) AVANT `#21` cache edge (1 j) |

- `#17` AVANT `#18` : sinon les snapshots V1 deviennent obsolètes au 1er bump de version
- `#20` AVANT `#21` : les corrections WCAG modifient des composants ; figer le cache après

### Phase 5 — Post-PMF (selon signal utilisateur)

Pas d'ordre dur — chaque item décidé par retour terrain (cf. table P5 plus haut).

### Ordre absolu si tu fais tout en solo

```
Phase 0 :   /security-review → décisions produit
Phase 1 :   #23 → #02 → #00 → #01 → #03 → #04 → #05
Phase 2 :   #07 → #06 → #08 → #09
Phase 3 :   #10 → #13 → #12 → #11
Phase 4 :   #17 → #18 → #20 → #21
Phase 5 :   #19, #22, #14, #16, #15   (selon signaux)
```

**Pourquoi #23 absolument en premier en mode solo :** sans accès praticien aux collections, impossible de tester quoi que ce soit dans Payload — donc impossible de valider #02, #05, ni les chantiers Phase 2 qui touchent l'édition de contenu. C'est le débloqueur racine.

**Totaux :**

| Phase | Solo | 2 devs | 3 devs |
|---|---|---|---|
| 1 (P0 + P1) | ~12 j | ~9 j | ~6,5 j |
| 2 (P2) | ~3,5 j | ~3 j | ~3,5 j (séquentiel) |
| 3 (P3) | ~2 j | ~1,5 j | ~1 j |
| 4 (P4) | ~3,5 j | ~2 j | ~2 j |
| **Total Phase 1→4** | **~21 j** | **~15,5 j** | **~13 j** |

## Méthode pour exécuter un chantier

1. Ouvrir le chantier ciblé dans `docs/roadmap/<num>-*.md`
2. Vérifier la section **Pré-requis** — le chantier précédent peut être bloquant
3. Lire **Périmètre exact** + **Fichiers touchés** + **Critères de done**
4. Créer une branche `chantier/<NN>-<slug>`
5. Lancer via Claude Code : `claude "$(cat docs/roadmap/<NN>-*.md)"`
6. Garde-fous avant PR : `pnpm typecheck && pnpm lint && pnpm test` (+ `pnpm --filter @medsite/web test:e2e` si touche `apps/web`)
7. Une PR par chantier (un commit logique, préfixe `chantier <NN>`)
8. Marquer ✅ dans la table de priorité ci-dessus à chaque merge
9. Toute dette détectée hors scope → entrée dans `docs/tech-debt.md`, ne bloque pas la PR

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

Le fichier [`_template-chantier.md`](_template-chantier.md) sert de squelette pour tout nouveau chantier ajouté ultérieurement (les 23 fichiers actuels = #00 + #01 → #22 + #23 sont tous détaillés au 2026-04-25).
