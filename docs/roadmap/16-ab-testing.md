# Chantier 16 — A/B testing intégré

## But

Permettre au praticien (ou à l'équipe MedSite côté admin) de tester deux variantes d'un bloc ou d'une page (ex. deux hero différents) et de mesurer le taux de conversion (clic sur "Prendre RDV", "Contactez-moi"). Outil interne, pas un produit Optimizely.

## Pré-requis

- Plausible déjà en place (`@medsite/analytics`)
- Cookies first-party autorisés (RGPD : consent banner OK)
- Décision produit : V1 = test sur le bloc CTA / hero seulement, pas page entière

## Périmètre exact

**Inclus V1 :**
- Champ `pages.experiments: jsonb` qui stocke les variantes : `{ blockId: string, variants: [{ id, label, weight }] }[]`
- Allocation déterministe par cookie `medsite_exp_<expId>` (50/50 par défaut)
- Cookie 30 jours, sécurité `SameSite=Lax`
- Tracking via Plausible custom event `experiment_view` et `experiment_conversion`
- Conversion = clic sur boutons taggés `data-medsite-cta="rdv"` ou `"contact"`
- UI Payload : éditer les variantes dans le tenant (pas dans `apps/platform` V1)
- Dashboard simple `apps/admin/src/app/(payload)/experiments/page.tsx` qui agrège les events Plausible

**Exclus :**
- Test multi-variantes (> 2)
- Test multi-pages (toujours scope = 1 bloc)
- Statistical significance computation (juste affichage des compteurs)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `packages/db/src/schema/pages.ts` | modifié — ajout `experiments` |
| `packages/db/src/migrations/<n>-add-experiments.sql` | nouveau |
| `apps/web/src/lib/experiments.ts` | nouveau — assignVariant() server-side |
| `apps/web/src/components/experiment-wrapper.tsx` | nouveau |
| `apps/web/src/components/cta-button.tsx` | modifié — ajout `data-medsite-cta` |
| `packages/analytics/src/events.ts` | modifié — `experiment_view`, `experiment_conversion` |
| `apps/admin/src/collections/Pages.ts` | modifié — UI experiments |
| `apps/admin/src/app/(payload)/experiments/page.tsx` | nouveau |

## Étapes d'implémentation

1. Migration DB pour `pages.experiments`.
2. Helper `assignVariant({ expId, cookies, weights })` server-side, déterministe par cookie ; si pas de cookie → en pose un.
3. `<ExperimentWrapper expId variants>{ ({ variantId }) => <Block …/> }</ExperimentWrapper>` qui choisit le bon enfant selon variant assigné.
4. Tagger les boutons CTA existants avec `data-medsite-cta`. Listener global qui envoie `experiment_conversion` à Plausible si l'élément est dans un wrapper d'experiment.
5. UI Payload (composant React custom dans la collection Pages) pour configurer les variantes.
6. Dashboard agrégateur : appel API Plausible (`stats/aggregate?event=experiment_view`).

## Critères de done

- [ ] Une expérimentation configurée sur la home affiche bien la variante allouée selon cookie
- [ ] `experiment_view` apparaît dans Plausible
- [ ] Clic sur CTA dans la variante envoie `experiment_conversion`
- [ ] Dashboard affiche ratio conversion par variante
- [ ] Cookie respecte le consent RGPD (n'écrit pas avant accord)
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts

## Risques connus

- Allocation cookie côté SSR : attention au cache Next.js (Vercel CDN). Forcer `dynamic = 'force-dynamic'` sur les pages sous experiment ou utiliser ISR avec `Vary: Cookie`.
- Consent RGPD : si le visiteur refuse, ne pas tracker (juste rendre la variante par défaut).
- Plausible API rate-limit : cache l'agrégation dashboard 5 min.

## Tests à ajouter

- Unitaires : `assignVariant` déterministe, distribution proche du poids attendu sur 1000 itérations
- E2E : visite avec cookie A → variante A, sans cookie → assignation aléatoire stable

## Estimation

1 jour.
