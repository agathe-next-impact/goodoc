---
description: Checklist pré-déploiement — lance `release-shipper` pour vérifier que tout est prêt pour une mise en production.
argument-hint: [version: vX.Y.Z] (optionnel, généré depuis conventional commits sinon)
---

Préparation d'une release — **version : $ARGUMENTS**.

## Pipeline

Orchestre `release-shipper` sur sa checklist complète :

### T-24h — Préparation

1. Vérifier CI verte sur `main` (lint, typecheck, tests, build)
2. Lister les PRs ouvertes critiques (ne pas releaser si blocker non-mergé)
3. Vérifier backups DB (dernier < 24h)
4. Générer le changelog depuis conventional commits :
   ```bash
   git log --oneline <last-tag>..HEAD
   ```
5. Ouvrir `/docs/tech-debt.md` et vérifier :
   - Aucun `CRITICAL` non-résolu
   - `HIGH` acceptable pour cette release
6. Préparer la doc `/docs/releases/v<X.Y.Z>.md` avec checklist à signer

### Pré-deploy

7. Preview deploy validé sur staging ou preview deploy du hosting
8. Smoke test manuel sur staging :
   - Home
   - Auth (si applicable)
   - Action métier principale
   - Webhooks reçus
9. Migrations DB reviewées (si applicable)

### Deploy

10. Merge / tag / déclencher deploy
11. Healthcheck post-deploy : `/api/health` 200
12. Monitoring 30 min post-deploy :
    - Sentry / équivalent : pas de pic d'erreurs
    - Latence p95 stable
    - Logs OK
    - Analytics OK

### Post-deploy

13. CHANGELOG.md committé, tag git annoté
14. Communication préparée (Slack / email / client selon contexte)
15. Postmortem planifié si incident

## Mode legacy

Sur un projet existant sans historique de releases formelles :

- Établir une **baseline** avec cette première release (versionner depuis 1.0.0 ou conserver une version existante)
- Mettre en place conventional commits pour générer les prochains changelogs automatiquement
- Ne pas viser la checklist complète si hosting / monitoring absents — documenter ce qui manque

## Output

Fichier `/docs/releases/v<X.Y.Z>.md` rempli :

```markdown
# Release v<X.Y.Z> — <date>

## Checklist pré-prod
- [x] CI verte
- [x] Backups OK
- [x] Changelog généré
- [ ] Preview validé ← en attente validation humaine

## Changelog
<contenu changelog>

## Notes
- <observations spécifiques>

## Post-deploy
- <observations post-deploy, 30 min puis 24h>
```

## Règles

- **Ne pas forcer un deploy** si checks critiques rouges
- **Rollback plan** toujours prêt avant deploy
- **Postmortem** obligatoire sous 48h si incident
- **Communication** adaptée à la criticité
