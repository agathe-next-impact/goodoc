# Chantier 23 — Accès praticien complet aux collections Payload

## But

Garantir qu'un praticien connecté à `apps/admin` voit et peut éditer **toutes les collections de son tenant** : Profil (Practitioners), Actes (Services), Pages, Articles (BlogPosts), FAQ (FaqItems), Témoignages (Testimonials), Adresses, Horaires (OpeningHours), Médias (Media), Messages reçus (ContactMessages), et le global Réglages du site (SiteSettings). Aujourd'hui le code est en place mais le câblage user↔tenant manque, donc rien ne s'affiche.

## Diagnostic du blocage actuel (2026-04-25)

- Toutes les collections ont `access.read = tenantIsolation` qui retourne `false` si `user.tenantId` est null
- `packages/db/src/seed.ts` ne seed **aucun compte Payload** avec mot de passe (les `email` du seed sont des infos métier, pas des comptes auth)
- Le premier user créé via le wizard Payload prend le rôle par défaut `practitioner` (cf. `Users.ts` line 25), mais **sans `tenantId`** → bloqué par tenantIsolation
- `Practitioners.access.create = superAdminOnly` → même un praticien ne peut pas créer son fiche profil
- Conséquence : l'utilisateur voit la nav (les groupes "Mon site" / "Activité" / "Système") mais chaque collection est vide ou inaccessible

## Pré-requis

- Schema users + tenants opérationnel (déjà OK)
- Décision produit : V1 = un user = un tenant (1-1). Multi-user par tenant en V2.
- Mode de création des comptes :
  - **Option A (V1 dev)** : seed étendu qui crée 3 super-admins + 3 praticiens chacun lié à un tenant existant
  - **Option B (V1 prod)** : signup public via `apps/platform/login/signup` + création tenant en backend + bind du `tenantId`. Cf. chantier #00.
  - Recommandation : **les deux**. Seed pour dev/test, signup pour prod.

## Périmètre exact

**Inclus :**

1. **Seed étendu** (`packages/db/src/seed.ts`) :
   - 1 user super-admin : `admin@medsite.fr` / `Admin1234!`
   - 3 users praticiens, 1 par tenant seedé : `dr.martin@medsite.fr`, `dr.dupont@medsite.fr`, `emilie.rousseau@medsite.fr`, mot de passe commun dev `Test1234!`
   - Chaque user a `role: 'practitioner'`, `tenantId: <tenant.id>`, `name` rempli
   - Hash de password fait via `bcrypt` (12 rounds) — Payload utilise bcrypt par défaut

2. **Création initiale des entités liées au tenant** (déjà côté seed pour les tenants, mais à vérifier) :
   - Un Practitioner par tenant (déjà OK)
   - Un Address par tenant (déjà OK)
   - Un OpeningHours par tenant (déjà OK)
   - Un SiteSettings global par tenant (à vérifier — Payload globals sont par tenant via le filtre tenantIsolation)

3. **Endpoint `POST /api/auth/signup`** (`apps/admin/src/app/api/auth/signup/route.ts`) :
   - Reçoit `{ email, password, name, slug }` (slug du futur tenant)
   - Vérifie unicité email + slug
   - Crée en transaction : tenant (status `trial`), siteSettings, practitioner stub, address stub, openingHours stub, user (`role: practitioner`, `tenantId: <new>`)
   - Retourne le user + cookie de session Payload
   - Rate limiting (10 req/h par IP) via Upstash ou middleware simple

4. **Ajustements access control** :
   - `Practitioners.access.create = tenantIsolation` (au lieu de `superAdminOnly`) — un praticien doit pouvoir créer un 2e profil si nécessaire (V2 multi-praticien) ; en V1 le seul profil existe déjà via signup, donc effet nul
   - `Practitioners.access.delete` reste `superAdminOnly` — un praticien ne se supprime pas lui-même
   - Tous les autres accès `tenantIsolation` restent OK

5. **SiteSettings global vs tenant** :
   - Vérifier que le global `site-settings` se lit bien filtré par tenant. Payload globals ne sont pas tenant-scoped nativement → confirmer que `tenantIsolation` appliqué à un global fonctionne (lit la condition au niveau du document filtré sur `tenantId`)
   - Si KO : convertir SiteSettings en collection avec contrainte unique `tenantId` (1 row par tenant)

6. **Doc dev** dans `docs/ops/dev-accounts.md` : liste des comptes seedés et URL de connexion

**Exclus V1 :**

- Multi-user par tenant (un practitioner peut inviter un collaborateur) → V2
- 2FA → V2
- SSO → V2
- Reset password autonome → V2 (V1 = passe par support)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `packages/db/src/seed.ts` | modifié — ajout des users seedés |
| `packages/db/src/seed-users.ts` | nouveau — helper bcrypt + insertion users |
| `apps/admin/src/app/api/auth/signup/route.ts` | nouveau — signup + bind tenant |
| `apps/admin/src/collections/Practitioners.ts` | modifié — `create: tenantIsolation` |
| `apps/admin/src/globals/SiteSettings.ts` | vérifié, possiblement converti en collection |
| `apps/admin/src/lib/signup.ts` | nouveau — transaction multi-table |
| `apps/admin/src/lib/__tests__/signup.test.ts` | nouveau |
| `docs/ops/dev-accounts.md` | nouveau |
| `docs/ops/runbook.md` | modifié — section "Comptes admin & rôles" |

## Étapes d'implémentation

1. **Audit SiteSettings global** : tester en dev avec 2 tenants seedés que chacun voit son propre `site-settings` et pas celui de l'autre. Si KO (les globals Payload sont single-doc par défaut), migrer vers une collection `site_settings` avec contrainte unique sur `tenantId`.
2. **Seed users** : créer `seed-users.ts` qui hash les mots de passe via `bcrypt` (alignment avec Payload), insère dans `users` avec `tenantId` correct, et crée le SiteSettings du tenant si pas déjà fait.
3. **Mise à jour `Practitioners.access.create`** → `tenantIsolation`. Tester qu'un praticien peut créer un nouveau profil (V2) sans casser V1.
4. **Endpoint signup** : transaction Drizzle qui crée tenant + entités liées + user. Renvoie 201 + cookie session.
5. **Documentation** : `docs/ops/dev-accounts.md` listant les 4 comptes seedés et la procédure de signup en prod.
6. **Tests E2E** : 1 spec login praticien seedé → vérifier que toutes les collections de la nav sont accessibles et listent ≥ 1 row du tenant.

## Critères de done

- [ ] Login en tant que `dr.martin@medsite.fr` / `Test1234!` donne accès à : Profil, Actes, Pages, Articles, FAQ, Témoignages, Adresses, Horaires, Médias, Messages, Réglages du site
- [ ] Chaque collection liste **uniquement** les rows du tenant `dr-sophie-martin`
- [ ] Login en tant que `admin@medsite.fr` voit les 3 tenants (super-admin bypass)
- [ ] Endpoint `POST /api/auth/signup` crée un nouveau tenant + user fonctionnel
- [ ] E2E spec passe : login praticien → 11 collections accessibles avec ≥ 1 row chacune
- [ ] Doc dev publiée
- [ ] `pnpm typecheck && pnpm lint && pnpm test` verts

## Risques connus

- **SiteSettings global** : si Payload ne gère pas tenant-scoped sur les globals, conversion en collection avec contrainte unique → migration de schema, attention aux tests existants qui pointent vers `globals/site-settings`.
- **Bcrypt cost factor** : Payload v3 utilise par défaut un cost que le seed doit matcher, sinon login échoue. Vérifier dans la doc Payload (probablement via API `payload.create({ collection: 'users' })` plutôt qu'INSERT SQL direct pour respecter les hooks d'auth).
- **Transaction signup** : si l'une des étapes échoue (ex. insert practitioner après tenant), il faut rollback complet. Utiliser `db.transaction(async (tx) => …)` Drizzle.
- **RLS Postgres** : insertion via le user app peut être bloquée par les policies RLS si le `app.current_tenant_id` n'est pas set. Le seed doit utiliser une connexion super-user ou désactiver RLS pendant le seed. Vérifier `packages/db/rls.sql`.
- **Slug unicité tenant** : signup avec slug déjà pris → 409. Tester.

## Tests à ajouter

- Unitaire : `signup.ts` rollback si une étape échoue (mock DB)
- Intégration : seed users → connexion DB → query `users WHERE tenantId = X` retourne 1 row
- E2E : login `dr.martin@medsite.fr` → visite `/admin/collections/services` → liste contient ≥ 1 acte du tenant martin
- E2E : login `dr.martin@medsite.fr` → visite `/admin/collections/services` ne contient AUCUN acte des tenants dupont/rousseau (test d'isolation)
- E2E : login super-admin → 3 tenants tous visibles

## Estimation

1,5 jour.

## Place dans la roadmap

**Priorité 1 (pré-prod, bloquant)** — sans ce chantier, aucun praticien ne peut tester `apps/admin` sur ses propres données. À traiter en parallèle ou juste après le chantier #00 (cadrage `apps/platform`), idéalement avant le #05 (onboarding wizard, qui suppose qu'un user authentifié existe et a un tenant lié).

Ordre recommandé dans la Phase 1 : `#00 → #23 → #05` côté piste backend/édition.
