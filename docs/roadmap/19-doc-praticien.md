# Chantier 19 — Documentation utilisateur praticien

## But

Fournir au praticien une doc d'utilisation autonome, accessible depuis `apps/platform` et `apps/admin`, qui couvre les 80 % des questions support : comment changer son template, ajouter une page, modifier ses horaires, configurer Doctolib, voir ses messages, gérer son abonnement. Format : pages MDX servies par `apps/platform` (ou site doc dédié).

## Pré-requis

- Onboarding wizard (#05) opérationnel — la doc renvoie vers ses étapes
- `apps/platform` minimal (#00) opérationnel
- Décision : doc embarquée dans `apps/platform/src/app/aide/` ou site doc séparé `docs.medsite.fr`. Recommandation V1 : embarquée.

## Périmètre exact

**Inclus :**
- Section "Aide" dans `apps/platform` : `/aide`, `/aide/[slug]`
- 12 articles MDX couvrant :
  1. Premiers pas après inscription
  2. Choisir et changer de template
  3. Modifier le contenu de mes pages (renvoi vers Payload)
  4. Ajouter une page de service
  5. Publier un article de blog
  6. Configurer mes horaires d'ouverture
  7. Connecter Doctolib
  8. Gérer mes messages de contact
  9. Comprendre ma facture Stripe
  10. Suspendre ou résilier mon abonnement
  11. Configurer un domaine personnalisé (procédure manuelle V1)
  12. RGPD : mes obligations en tant que professionnel de santé
- Recherche full-text simple côté client (Fuse.js)
- Lien "Voir l'aide" dans la sidebar `apps/platform`

**Exclus :**
- Vidéos tutoriels (V2)
- Multi-langue
- Versionning de la doc

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/platform/src/app/aide/page.tsx` | nouveau — index |
| `apps/platform/src/app/aide/[slug]/page.tsx` | nouveau — article |
| `apps/platform/src/content/aide/*.mdx` | nouveau — 12 articles |
| `apps/platform/src/lib/help-search.ts` | nouveau |
| `apps/platform/src/components/help-search-input.tsx` | nouveau |
| `apps/platform/next.config.ts` | modifié — MDX |
| `apps/platform/package.json` | modifié — `@next/mdx`, `fuse.js` |

## Étapes d'implémentation

1. Activer MDX dans `apps/platform` avec `@next/mdx`.
2. Lister les 12 articles (titre + slug + 1 phrase). Faire valider par produit avant rédaction.
3. Rédiger chaque article : ~ 300-500 mots, captures d'écran annotées, format "problème → solution → vérification".
4. Index `/aide` qui liste les articles groupés par catégorie (Démarrage / Contenu / Facturation / Avancé).
5. Recherche client-side : indexer titre + frontmatter + premières 200 chars.
6. Ajouter un lien "Aide" dans la sidebar de `apps/platform`.

## Critères de done

- [ ] 12 articles publiés et accessibles
- [ ] Recherche fonctionne sur titre et contenu
- [ ] Captures d'écran à jour (matchent l'UI actuelle)
- [ ] Liens internes (renvois entre articles) fonctionnels
- [ ] WCAG AA respecté (titres hiérarchisés, alt sur captures)
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts

## Risques connus

- Captures d'écran périmées dès qu'une UI change. Doc à versionner avec le code, et un check trimestriel à inscrire dans `docs/ops/runbook.md`.
- 12 articles = ~ 4-5 000 mots à rédiger. Prévoir un rédacteur dédié ou découper sur plusieurs sprints.

## Tests à ajouter

- Smoke E2E : `/aide` charge, recherche d'un terme retourne ≥ 1 article, click ouvre le bon article
- Lint MDX : pas de lien cassé (lib `linkinator` ou équivalent)

## Estimation

1 jour (rédaction comprise — à doubler si traductions).
