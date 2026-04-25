# Chantier 01 — Validation visuelle locale des 5 thèmes

## But

S'assurer que les 5 thèmes × 6 pages canoniques rendent correctement sur les 3 tenants dev avant d'avancer. Repérer les régressions visuelles, problèmes de contraste, débordements ou tokens cassés.

## Pré-requis

- Phases 2 → 8 closes (templates, presets, route `/p/[slug]`)
- Docker + PostgreSQL fonctionnels (`docker compose up -d`)
- `.env.local` rempli avec un placeholder R2 (les images des presets pointent sur Unsplash, pas besoin de vraies clés R2)

## Périmètre exact

**Inclus :**
- Run du seed avec les 3 tenants utilisant `medical-classic` / `family-practice` / `warm-wellness`
- Parcours manuel des 6 slugs sur les 3 tenants (18 vues)
- Capture d'écran de chaque vue dans `docs/templates/screenshots/<tenant-slug>/<page-slug>.png`
- Création d'une fiche d'anomalies dans ce fichier

**Exclus :**
- Génération automatique des screenshots (chantier 08)
- Test avec les 2 thèmes restants (`modern-clinic`, `minimal-pro`) — pas seedés ; à valider en branchant temporairement le seed sur un 4e tenant ou en utilisant la galerie admin

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `docs/templates/screenshots/` | nouveau dossier |
| `docs/roadmap/01-validation-visuelle.md` | mise à jour avec liste d'anomalies |

## Étapes d'implémentation

```bash
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Visiter dans cet ordre, vérifier rendu + console navigateur :

| Tenant | URL | Thème |
|--------|-----|-------|
| dr-sophie-martin | http://dr-sophie-martin.localhost:3003/p/home | medical-classic |
| dr-sophie-martin | …/p/a-propos | medical-classic |
| dr-sophie-martin | …/p/services | medical-classic |
| dr-sophie-martin | …/p/contact | medical-classic |
| dr-sophie-martin | …/p/faq | medical-classic |
| dr-sophie-martin | …/p/tarifs | medical-classic |
| cabinet-dupont | http://cabinet-dupont.localhost:3003/p/home | family-practice |
| (idem 6 slugs) | | |
| emilie-rousseau | http://emilie-rousseau.localhost:3003/p/home | warm-wellness |
| (idem 6 slugs) | | |

Pour valider `modern-clinic` et `minimal-pro` : se connecter sur l'admin Payload, ouvrir le dashboard, cliquer sur la carte du thème dans `TemplateGallery` (mode `overwrite`), puis recharger les pages publiques.

Pour chaque vue : vérifier
- Aucune erreur en console (ni serveur ni navigateur)
- Aucun texte qui déborde ou se chevauche
- Contraste lisible sur tous les blocs
- Le `JsonLd` est présent dans `<head>` (test via View Source ou Rich Results Test)
- Le formulaire contact ne plante pas à la soumission (action sur `/contact`)

## Critères de done

- [ ] 30 vues capturées (5 thèmes × 6 pages, dont 3 via galerie admin)
- [ ] 0 erreur console rouge
- [ ] Aucune anomalie ouverte ou anomalies tracées dans ce fichier
- [ ] Tableau d'anomalies à la fin de ce fichier mis à jour

## Risques connus

- Le formulaire `contact-form` pointe sur `/contact` qui n'existe peut-être pas dans la route `/p/[slug]` — il faudra le câbler à l'action existante de `apps/web/src/app/(tenant)/contact/action.ts` ou créer un endpoint `/api/contact`. À tracer en anomalie.
- Les images Unsplash peuvent être bloquées par le `next.config.ts` (`remotePatterns`) qui n'autorise que le hostname R2. Soit ajouter `images.unsplash.com`, soit héberger des images démo sur R2.

## Tests à ajouter

Pas de tests automatisés ici — le chantier 04 (E2E Playwright) couvrira ce périmètre en automatique.

## Estimation

0,5 jour.

---

## Anomalies relevées (à compléter pendant le chantier)

| # | Tenant / page | Description | Sévérité | Décision |
|---|---------------|-------------|----------|----------|
| 0a | global / next.config | `images.unsplash.com` absent de `remotePatterns` — toutes les images des presets seedés erroraient. | bloquant | **Corrigé** avant lancement (cf. `apps/web/next.config.ts`). |
| 0b | tous / page contact | Le bloc `contact-form` POST sur `/contact` via `fetch`. Or `apps/web/src/app/(tenant)/contact/page.tsx` est une page GET et `action.ts` expose `submitContactForm` comme **Server Action** (pas un route handler). Le POST échoue avec 405 / HTML. | majeur (pas bloquant pour la capture) | À résoudre dans **chantier 06** (migration des pages hardcodées) ou en créant un `app/api/contact/route.ts` qui réutilise `submitContactForm`. Pour le chantier 01 : noter "soumission KO" dans la liste, ne pas tenter de réparer. |
| | | | | |
