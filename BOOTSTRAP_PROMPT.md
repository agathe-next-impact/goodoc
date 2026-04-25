# Prompts de bootstrap — Kit universel

Prompts prêts à coller dans Claude Code selon la situation. Tous spécifiquement pensés pour le **mode legacy-friendly** du kit : scope au diff, dette trackée, Boy Scout Rule.

## Prompt 1 — Onboarding (obligatoire en première session)

Identique à `/onboard`. Si tu ne peux pas utiliser les slash-commands pour une raison X, utilise ce prompt :

```
Tu démarres sur ce projet. Applique le kit Claude Code universel installé
(.claude/agents + .claude/commands + CLAUDE.md).

Phase 1 — Discovery (lecture seule du code)

Explore le repo et identifie :
1. Package manager + runtime (pnpm / npm / yarn / bun, Node version)
2. Framework(s) frontend (Next.js App/Pages Router, Astro, Remix, SvelteKit, Nuxt, autre)
3. CMS / data layer (Payload, Sanity, Directus, Strapi, API custom, ORM)
4. Database
5. Monorepo (Turborepo, Nx, pnpm workspaces, single repo)
6. Styling (Tailwind, CSS modules, CSS-in-JS, vanilla) + design system
7. Tests (Vitest, Jest, Playwright, Cypress, aucun)
8. CI/CD + hosting
9. Qualité code (ESLint, TS strict, Prettier, pre-commit hooks)
10. Sensibilités spéciales (multi-tenant, paiements, compliance, données santé)
11. Conventions commits (lire 20 derniers commits)

Phase 2 — Remplissage CLAUDE.md

Mets à jour CLAUDE.md en remplaçant tous les <À REMPLIR> par les valeurs
découvertes. Honnêtement, même si certaines pratiques sont loin de l'idéal.
Si info ambiguë : laisser <À CLARIFIER AVEC L'ÉQUIPE>.

Sections :
- Stack complète
- Structure du repo (arborescence niveau 2-3)
- Conventions actuelles vs conventions cibles
- Commandes (depuis package.json scripts)
- Variables d'environnement (depuis .env.example)

Phase 3 — Docs

Vérifier que /docs/tech-debt.md, /docs/overlays.md, /docs/ops/runbook.md
existent. Si manquants, les initialiser avec le template du install-kit.sh.

Phase 4 — Recommandation overlay

Selon la stack détectée, suggère un overlay pertinent :
- Next.js + Payload → overlay nextjs-payload
- Astro + Payload → overlay astro-payload
- WordPress Headless + Next.js → overlay wp-nextjs
- Multi-tenant + Stripe + données santé → overlay medsite-saas
- Payload + dette legacy visible → overlay payload-legacy

Si aucun ne colle parfaitement → rester en universel, proposer de construire
un overlay custom plus tard.

Phase 5 — Résumé

Termine par :
- Stack identifiée (synthèse 5 lignes)
- Points d'attention nécessitant clarification
- 3 prochaines actions suggérées (adaptées à l'état actuel du projet)
- Fichiers créés / modifiés

IMPORTANT : aucun code modifié (sauf CLAUDE.md et /docs/).
Aucune dépendance installée. Aucun refacto proposé.
Juste : découverte + documentation + recommandations.
```

## Prompt 2 — Calibration sur une PR mergée récente

À lancer après l'onboarding pour vérifier que le kit est bien calibré sur le projet :

```
Lance /review-pr sur la dernière PR mergée (git log main -1 --format="%H").

Objectif : calibrer le kit. Je veux voir :
1. Quels findings les agents remontent sur du code récent mergé
2. Quels critical / majeurs auraient dû être signalés
3. Quelle dette technique ils détectent

Si tu détectes beaucoup de violations sur du code mergé accepté par l'équipe,
c'est peut-être que les conventions cibles dans CLAUDE.md sont trop strictes
par rapport à la réalité du projet. Signale-le.

On ajustera CLAUDE.md ensemble après ta review.
```

## Prompt 3 — Nouvelle PR

À coller au début d'une session de travail sur une feature :

```
Je travaille sur : <description de la tâche>

Conformément au kit universel :
- Le nouveau code respecte les conventions cibles de CLAUDE.md
- Le code existant touché est amélioré localement (Boy Scout) si faisable sans cascade
- La dette détectée hors scope est notée dans /docs/tech-debt.md, pas corrigée
- Tests sur le nouveau flow si critique

Si tu identifies des dépendances avec du code legacy qui rendent la tâche
difficile : signale-les, propose des options (migrer d'abord, contourner,
etc.), je décide.

Commence par me montrer ton plan de découpage en commits avant de coder.
```

## Prompt 4 — Feature complète

Variante du 3 pour une feature plus large qui nécessite un découpage :

```
Feature à implémenter : <description>

Étape 1 : sprint-planner — découpe en tickets ≤ 1 jour avec acceptance
criteria Given/When/Then. Identifie dépendances et ordre d'exécution.

Étape 2 : validation humaine du plan.

Étape 3 : exécution ticket par ticket, avec à chaque fin :
- review-pr auto
- tests verts
- validation humaine avant de passer au suivant

Hors scope clair : ce que je NE veux PAS traiter dans cette feature,
même si ce serait lié.

Budget : <temps estimé ou nombre de sprints>.
```

## Prompt 5 — Audit trimestriel

```
État des lieux trimestriel. Lance /audit-global all.

Produire /docs/audits/audit-all-<date>.md avec :
- Executive summary partageable (3-5 points clés, pas trop technique)
- Findings par domaine : typescript, perf, a11y, security, design-system
- Plan d'action priorisé CRITICAL / HIGH / MED / LOW
- Dette ajoutée à /docs/tech-debt.md

Temps budget : 30-60 min d'exécution.

Ne corrige rien. Document seulement. On discutera du plan d'action après.
```

## Prompt 6 — Prendre une dette en charge

```
On passe à l'action sur <item de la dette>.

Lance /migrate-pattern <pattern> <scope>.

Attentes :
- Plan d'étapes validables (pas de big-bang)
- Validation humaine avant chaque étape
- Tests verts à chaque étape
- Commits propres avec conventional commits
- Fichier /docs/tech-debt.md mis à jour à la fin

Si une étape révèle un effort beaucoup plus gros que prévu, stop, documente,
et on re-priorise.
```

## Prompt 7 — Déploiement

```
Préparation release.

Lance /release-check [v<version si connue, sinon auto>].

Attentes :
- Checklist pré-prod complète
- Changelog généré depuis conventional commits
- /docs/releases/v<X.Y.Z>.md créé avec checklist exécutée
- Vérification qu'aucun CRITICAL en dette technique non-résolu
- Plan de rollback documenté

Ne déploie rien toi-même. Tu prépares, je valide et j'exécute.
```

## Prompt 8 — Incident en prod

```
Incident : <description — ex. "Formulaire contact qui échoue depuis 30 min">

Pipeline :
1. devops-generic : vérifier Sentry / logs / healthcheck
2. Diagnostic : qu'est-ce qui a changé récemment ? quel commit suspect ?
3. Décision rapide : rollback ou hotfix ?
4. Si rollback : exécute (tu me guides sur les commandes)
5. Si hotfix : plan minimal, tests sur reproduction, deploy
6. Après incident résolu : postmortem dans /docs/ops/postmortems/<date>.md

Budget : 1h max pour diagnostic. Si pas résolu → rollback par défaut.

Ne touche pas à autre chose pendant l'incident. Scope resserré.
```

## Prompt 9 — Préparer un overlay custom

Pour quand tu veux transformer des patterns récurrents du projet en overlay :

```
J'ai remarqué que je redocumente souvent les mêmes patterns pour Claude
(liste : <patterns>). Je veux en faire un overlay custom.

Pipeline :
1. Identifier ces patterns :
   - Agents universels qui pourraient être remplacés par des versions spécialisées
   - Agents nouveaux à créer pour des besoins spécifiques
   - Règles spécifiques à ajouter à CLAUDE.md
   - Slash-commands spécifiques

2. Proposer une structure overlay dans /overlays/<nom-custom>/ avec :
   - .claude/agents/ (agents ajoutés ou remplacés)
   - CLAUDE.md.patch (sections à ajouter au CLAUDE.md universel)
   - README.md expliquant ce que fait cet overlay

3. Appliquer l'overlay sur le projet courant et tracker dans /docs/overlays.md.

Ne pas dupliquer les agents universels qui fonctionnent bien tels quels.
L'overlay ne contient que la valeur ajoutée.
```
