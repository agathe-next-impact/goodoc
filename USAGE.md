# Kit Claude Code — universel (projet existant)

Kit d'agents et slash-commands **stack-agnostique**, conçu pour s'appliquer à **tout projet web TypeScript moderne existant**.

## 1. À qui ce kit s'adresse

Ce kit est conçu pour :

- **Projets existants** avec codebase, dette technique, contraintes — pas pour du greenfield
- **Stacks TypeScript modernes** : Next.js, Astro, Remix, SvelteKit, Nuxt, Express, etc.
- **Équipes qui veulent adopter Claude Code progressivement** sans bouleverser leur workflow

Il est la **base universelle** — volontairement générique. Pour une expertise stack-spécifique plus pointue (Payload, Astro + Payload, SaaS santé, etc.), prévoir un **overlay** par-dessus (voir section 9).

## 2. Philosophie

### Legacy-friendly par défaut

1. **Audit = diff courant**. Les agents scannent ce que tu modifies, pas le repo entier (sauf `/audit-global` explicite).
2. **Boy Scout Rule**. Le nouveau code respecte la cible. Le code modifié est amélioré localement sans cascade. Le code non touché est laissé tranquille.
3. **Dette trackée, pas forcée**. Tout finding hors scope est noté dans `/docs/tech-debt.md` par l'agent `tech-debt-tracker`. L'équipe décide quand s'en occuper.
4. **Critical toujours signalé**. Même hors scope : secret en clair, fuite de données, endpoint sans auth → signalés immédiatement.

### Auto-découverte

Au premier lancement, `/onboard` explore ton repo et remplit les sections `<À REMPLIR>` de `CLAUDE.md` (stack, structure, conventions, commandes, variables d'env). Tu n'as pas besoin de tout configurer à la main.

## 3. Contenu

**13 agents universels** + **5 slash-commands**.

```
universal-kit/
├── CLAUDE.md                             # Template avec sections auto-remplies à l'onboarding
├── BOOTSTRAP_PROMPT.md                   # Prompts prêts à coller
├── USAGE.md                              # Ce fichier
├── install-kit.sh                        # Installeur
└── .claude/
    ├── agents/                           # 13 subagents
    │   ├── engineering/ (3)
    │   │   ├── typescript-guardian.md        # TS strict, brand types, Zod aux frontières
    │   │   ├── frontend-developer.md         # Framework-agnostique
    │   │   └── devops-generic.md             # CI/CD, secrets, monitoring universels
    │   ├── performance/ (2)
    │   │   ├── core-web-vitals-optimizer.md
    │   │   └── bundle-auditor.md
    │   ├── design/ (3)
    │   │   ├── accessibility-auditor.md      # WCAG 2.2 AA universel
    │   │   ├── ui-designer.md
    │   │   └── design-system-curator.md
    │   ├── security/ (1)
    │   │   └── security-auditor.md
    │   ├── testing/ (1)
    │   │   └── testing-strategist.md         # Pyramide tests, adapté au harness
    │   └── project-management/ (3)
    │       ├── sprint-planner.md
    │       ├── release-shipper.md
    │       └── tech-debt-tracker.md          # Gardien de /docs/tech-debt.md
    └── commands/ (5)
        ├── onboard.md                     # Première session : découverte + config auto
        ├── review-pr.md                   # Revue multi-agent sur le diff
        ├── audit-global.md                # Audit complet opt-in (long)
        ├── migrate-pattern.md             # Migration incrémentale d'un pattern
        └── release-check.md               # Checklist pré-prod
```

## 4. Prérequis

- **Claude Code** : `npm install -g @anthropic-ai/claude-code` (Node ≥ 20)
- Compte Anthropic connecté (`claude login`)
- Projet existant avec git initialisé

## 5. Installation

```bash
./install-kit.sh /chemin/vers/mon/projet
```

Le script :
- Copie `CLAUDE.md` (template à compléter) à la racine
- Copie `.claude/agents/` et `.claude/commands/`
- Crée l'arborescence `/docs/` (audits, ops, testing, releases, security, design-system)
- Initialise `/docs/tech-debt.md` et `/docs/overlays.md` avec templates
- Met à jour `.gitignore` pour `.claude/settings.local.json`

**Ne modifie rien** dans ton code existant.

## 6. Première session (obligatoire)

```bash
cd mon-projet
claude
```

Première commande : **`/onboard`** (ou coller le Prompt 1 de `BOOTSTRAP_PROMPT.md`).

Claude va :

1. Explorer le repo (package.json, structure, configs, dépendances)
2. Identifier la stack (framework, CMS, DB, tests, CI, hosting)
3. Compléter automatiquement les `<À REMPLIR>` de `CLAUDE.md`
4. Créer / vérifier `/docs/` attendus
5. Suggérer un **overlay** si la stack détectée correspond à un kit spécialisé
6. Proposer les 3 premières actions

**Aucun code modifié pendant `/onboard`** — uniquement `CLAUDE.md` et `/docs/`.

Relire `CLAUDE.md` après l'onboarding pour valider / ajuster.

## 7. Workflow quotidien

### Revue de PR

```
/review-pr HEAD
```

Lance les 8 passes (TypeScript, frontend, perf, a11y, design-system, sécurité, tests, DevOps). Output :
- Critical / Major in-scope → bloquants pour merge
- Minor → suggestions
- Dette détectée hors scope → notée dans `tech-debt.md`

### État des lieux trimestriel

```
/audit-global all
```

ou ciblé :

```
/audit-global typescript
/audit-global perf
/audit-global security
/audit-global a11y
/audit-global design-system
```

Produit `/docs/audits/audit-<domain>-<date>.md` avec plan d'action priorisé.

### Prendre en charge un item de dette

```
/migrate-pattern typescript-strict src/legacy/api.ts
```

Propose un plan d'étapes validables (pas de big-bang), exécute incrémentalement, valide avant chaque étape.

### Avant un déploiement

```
/release-check v1.4.0
```

Checklist pré-prod complète via `release-shipper`.

## 8. Utilisation des agents seuls

Chaque agent peut être invoqué manuellement si tu sais ce que tu veux :

```
Utilise typescript-guardian pour revoir le fichier src/api/users.ts
```

ou

```
Appelle accessibility-auditor sur src/components/ContactForm.tsx
```

## 9. Ajouter un overlay stack-spécifique

Ce kit est la **fondation**. Pour une expertise plus pointue, tu peux ajouter un overlay qui :

- Ajoute des agents stack-spécifiques (ex. `payload-cms-architect`, `astro-developer`, `stripe-webhook-handler`)
- Remplace certains agents universels par leur version spécialisée (ex. `frontend-developer.md` remplacé par `astro-developer.md`)
- Étend `CLAUDE.md` avec des règles stack-spécifiques

### Overlays prévus (à créer / à extraire des kits existants)

| Overlay | Stack | Source recommandée |
|---|---|---|
| `nextjs-payload` | Next.js 15 + Payload + Stripe + Mapbox | Kit `payload-claude-kit` |
| `astro-payload` | Astro + Payload headless | Kit `astro-payload-claude-kit` |
| `wp-nextjs` | WordPress Headless + Next.js | Kit `wp-nextjs-claude-kit` |
| `medsite-saas` | Multi-tenant santé + HDS + RGPD renforcé | Kit `medsite-claude-kit` |
| `payload-legacy` | Payload + Next.js sur projet legacy | Kit `payload-claude-kit-legacy` |

### Comment appliquer un overlay (manuellement)

En attendant un `composer.sh` automatisé :

```bash
# Exemple pour ajouter Astro + Payload en overlay
cp overlays/astro-payload/.claude/agents/engineering/astro-developer.md \
   .claude/agents/engineering/
cp overlays/astro-payload/.claude/agents/engineering/payload-cms-architect.md \
   .claude/agents/engineering/
# ... etc

# Dans CLAUDE.md, ajouter une section avec les règles Astro + Payload spécifiques
# Mettre à jour /docs/overlays.md pour tracker l'application
```

Les agents du overlay qui portent le même nom qu'un agent universel (par ex. `core-web-vitals-optimizer.md`) **remplacent** la version universelle. Les agents stack-spécifiques (qui n'ont pas d'équivalent universel) s'ajoutent.

## 10. Conventions notables

### Sur nouveau code

Le kit applique les conventions modernes :
- TypeScript strict (pas de `any` en green lines)
- Validation Zod aux frontières
- WCAG 2.2 AA
- HTML sémantique
- Tests sur flows critiques

### Sur code existant

Respecté tel quel tant qu'il est hors du diff. Signalé en dette si problèmes détectés. Amélioré progressivement via `/migrate-pattern` quand décidé.

## 11. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Claude ne lit pas `CLAUDE.md` | Fichier mal positionné | Doit être à la racine du projet (ou du dossier courant si Claude démarre ailleurs) |
| `/onboard` ne détecte pas la stack | Projet peu standard, configs custom | Remplir manuellement `CLAUDE.md` section Stack |
| Agents trop lents | `/audit-global` activé par erreur | Utiliser `/review-pr` pour le scope diff |
| Dette explose | Pas de revue régulière | Relire `/docs/tech-debt.md` en sprint planning, archiver items resolved |
| Types Payload / Sanity / autre CMS pas reconnus | Agents universels n'ont pas le contexte | Ajouter un overlay stack-spécifique ou enrichir `CLAUDE.md` |

## 12. Limitations connues

Ce kit **universel** est volontairement générique. Il ne remplace pas :

- Un overlay spécialisé pour une stack précise (toujours plus efficace)
- Un DPO / juriste pour conformité réglementaire lourde (RGPD santé, PCI-DSS, HIPAA)
- Un auditeur sécurité externe pour pentests
- Un human in the loop sur les décisions d'architecture majeures

## 13. Ressources

- **Claude Code** : https://docs.claude.com/en/docs/claude-code
- **Conventional Commits** : https://www.conventionalcommits.org/
- **WCAG 2.2** : https://www.w3.org/WAI/WCAG22/quickref/
- **Web Vitals** : https://web.dev/vitals/
