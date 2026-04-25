# Chantier 00 — Cadrage élargi `apps/platform`

> Chantier transverse, hors numérotation roadmap initiale. À traiter **avant** ou **en parallèle** du #05.
> Détecté hors-roadmap au scan du 2026-04-25 : `apps/platform/src/app/page.tsx` n'est qu'un placeholder "Super admin — placeholder. Implementation to come.". Pourtant l'app existe (port 3002) et figure dans le pnpm-workspace.

## But

Faire de `apps/platform` un véritable espace praticien fonctionnel : le médecin se connecte, voit son site en cours, accède à ses messages, gère son abonnement Stripe, et déclenche les actions clés (preview, publication, support). C'est l'app que voit le client après inscription, distincte de Payload (`apps/admin`) qui reste l'outil d'édition de contenu profond.

## Pré-requis

- Décision produit : **Payload (`apps/admin`) gère l'édition de contenu** (blocs, pages, médias) ; **`apps/platform` gère le compte/business** (abonnement, messages, support, statistiques). À acter avant de coder pour éviter une zone grise.
- Auth : choisir entre auth Payload partagée (`PAYLOAD_SECRET` + cookie cross-app) ou auth indépendante NextAuth/Clerk. Recommandation V1 : réutiliser la session Payload via vérification du JWT côté `apps/platform` pour éviter un second système.
- Stripe : `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` configurés. Backend déjà OK (`packages/billing`).
- DB : `tenants.onboardingStep`, `tenants.status`, `tenants.stripeCustomerId`, `tenants.stripeSubscriptionId` doivent exister (à vérifier dans `packages/db/src/schema/tenants.ts`).

## Périmètre exact

**Inclus (V1, ouverture early adopters) :**

- **Auth** : login + logout, session partagée avec Payload, redirection si non connecté ou si `onboardingStep < 6` → `apps/admin/onboarding/<step>` (cf. chantier #05)
- **Dashboard `/`** : vue d'ensemble avec
  - statut du site (active / trial / suspended / cancelled)
  - URL publique du site avec bouton "Voir mon site" (ouvre `https://<slug>.medsite.fr` ou domaine custom)
  - lien "Modifier le contenu" → ouvre `apps/admin`
  - 3 KPI : nb de RDV via Doctolib (si trackable), nb de visites Plausible, nb de messages reçus 30 derniers jours
- **`/messages`** : liste des `contact_messages` du tenant, marquer lu/non lu, lien mailto vers l'expéditeur
- **`/abonnement`** : plan actuel (`plans.code`), période d'essai restante, prochaine facture, bouton "Mettre à jour mon mode de paiement" (Stripe Customer Portal session), historique des factures (Stripe API)
- **`/parametres`** : nom du cabinet, email de notification, domaine custom (read-only V1, demande au support pour modifier)
- **`/support`** : formulaire de contact qui envoie un email à `support@medsite.fr` via `@medsite/email`

**Exclus V1 :**

- Édition de contenu site (toujours via Payload)
- Multi-praticien (un seul user par tenant V1)
- Stats Plausible avancées (juste 1 KPI total)
- Self-service domaine custom
- Self-service changement de plan (passe par support V1)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/platform/src/middleware.ts` | nouveau — vérification session, redirect onboarding |
| `apps/platform/src/lib/auth.ts` | nouveau — vérif JWT Payload, lookup user+tenant |
| `apps/platform/src/lib/get-tenant.ts` | nouveau — getTenant() pour RSC |
| `apps/platform/src/app/layout.tsx` | nouveau — shell, navigation latérale |
| `apps/platform/src/app/page.tsx` | modifié — vraie page dashboard (remplace placeholder) |
| `apps/platform/src/app/messages/page.tsx` | nouveau |
| `apps/platform/src/app/abonnement/page.tsx` | nouveau |
| `apps/platform/src/app/parametres/page.tsx` | nouveau |
| `apps/platform/src/app/support/page.tsx` | nouveau |
| `apps/platform/src/app/login/page.tsx` | nouveau |
| `apps/platform/src/app/api/billing/portal/route.ts` | nouveau — Stripe Customer Portal session |
| `apps/platform/src/app/api/support/route.ts` | nouveau — envoie email support |
| `apps/platform/src/components/sidebar.tsx` | nouveau |
| `apps/platform/src/components/site-status-card.tsx` | nouveau |
| `packages/billing/src/customer-portal.ts` | nouveau — helper `createCustomerPortalSession()` |

## Étapes d'implémentation

1. **Auth + middleware** : porter le décodage du cookie Payload côté `apps/platform`. Lookup user → `tenants.id` → injecter via header `x-tenant-id` pour les RSC. Si non auth → `/login`. Si `onboardingStep < 6` → redirect `https://admin.medsite.fr/onboarding/<step>`.
2. **Shell** : layout avec sidebar (Dashboard / Messages / Abonnement / Paramètres / Support), header avec nom praticien + lien `apps/admin` ("Éditer mon contenu") + logout.
3. **Dashboard** : RSC qui appelle `getTenant()`, affiche statut + URL publique + 3 KPI (mock V1 si Plausible pas câblé, vraie data pour `contact_messages`).
4. **Messages** : RSC qui liste `contact_messages` triés desc, action serveur pour toggle `read`. Pagination simple (20 par page).
5. **Abonnement** : RSC qui appelle Stripe API (`subscriptions.retrieve`, `invoices.list`). Bouton portail = `POST /api/billing/portal` qui crée une session et redirige.
6. **Customer Portal helper** : exposer `createCustomerPortalSession({ stripeCustomerId, returnUrl })` dans `@medsite/billing` (déjà partiellement faisable — vérifier `packages/billing/src/index.ts`).
7. **Support** : formulaire avec sujet/message, POST → `apps/platform/api/support` → `@medsite/email` envoie à `support@medsite.fr` avec contexte (tenant, plan, version).
8. **Tests E2E** : Playwright, parcours login → dashboard → messages → abonnement (mock Stripe).

## Critères de done

- [ ] Un praticien connecté arrive sur le dashboard avec son vrai statut et URL
- [ ] Liste des `contact_messages` paginée et fonctionnelle
- [ ] Stripe Customer Portal accessible et retour fonctionnel
- [ ] Formulaire de support envoie bien un email
- [ ] Logout efface la session côté Payload aussi (cookie cross-domain)
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts
- [ ] Au moins 1 spec Playwright dans `apps/platform/e2e/`
- [ ] Aucun appel DB direct dans le middleware (edge-safe)

## Risques connus

- **Auth cross-app** : si `apps/admin` (Payload) et `apps/platform` ne partagent pas le domaine racine en dev, le cookie session ne traverse pas. Solution dev : tout sur `localhost` avec ports différents OK. Prod : `admin.medsite.fr` + `app.medsite.fr` partagent `.medsite.fr` → cookie sur `Domain=.medsite.fr`.
- **Stripe en dev** : sans clé live, l'écran abonnement doit gracieusement afficher un état mock plutôt que crasher. Prévoir un mode dégradé.
- **RLS** : tous les accès DB depuis `apps/platform` doivent passer par un client qui set `app.current_tenant_id` (cf. `packages/db/rls.sql`). Vérifier que le helper existe ou le créer.
- **Doublon avec `apps/admin`** : tentation de mettre l'édition de contenu dans `apps/platform` aussi → résister, sinon on perd le bénéfice de Payload (live preview, history, blocs).

## Tests à ajouter

- Unitaires : décodage JWT Payload, redirect logic, `createCustomerPortalSession` (mock Stripe)
- Intégration : middleware redirige bien selon onboardingStep + status
- E2E : login → dashboard → messages (mark read) → abonnement (clic portail)

## Estimation

3 jours-homme (à dérouler en parallèle ou avant #05). Le #05 actuel (2 j) couvre l'onboarding *dans Payload* ; ce chantier couvre tout le reste de l'expérience post-inscription.
