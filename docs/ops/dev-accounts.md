# Comptes de développement

Liste des comptes seedés en local pour `apps/admin` (Payload). **Usage dev uniquement** — ne jamais utiliser ces credentials en staging ou en prod.

## Procédure

```bash
# 1. Lancer Postgres
docker compose up -d db

# 2. Migrer le schema
pnpm db:migrate

# 3. Seed des données métier (tenants, pages, services, etc.)
pnpm db:seed

# 4. Seed des comptes Payload (pbkdf2-hashed via Local API)
pnpm db:seed:users

# Ou en une seule commande :
pnpm db:seed:full

# 5. Démarrer admin
pnpm --filter @medsite/admin dev
```

URL admin : http://localhost:3001/admin

## Comptes disponibles

| Email | Mot de passe | Rôle | Tenant lié |
|---|---|---|---|
| `admin@medsite.fr` | `Admin1234!` | super-admin | aucun (voit tous les tenants) |
| `dr.martin@medsite.fr` | `Test1234!` | practitioner | `dr-sophie-martin` (dermatologue, Lyon) |
| `dr.dupont@medsite.fr` | `Test1234!` | practitioner | `cabinet-dupont` (kiné, Aurillac) |
| `emilie.rousseau@medsite.fr` | `Test1234!` | practitioner | `emilie-rousseau` (sophrologue, Clermont) |

## Vérification de l'isolation tenant

Connecté en `dr.martin@medsite.fr`, dans la nav "Mon site", chaque collection ne doit lister que les rows du tenant `dr-sophie-martin`. En particulier :

- **Profil** : 1 entrée (Sophie Martin)
- **Actes** : 3 entrées
- **Pages** : 6 entrées (preset `medical-classic`)
- **Articles** : selon seed
- **FAQ** : 2 entrées
- **Témoignages** : 1 entrée
- **Adresses** : 1 entrée (Lyon)
- **Horaires** : 7 entrées (lun-dim)
- **Médias** : selon seed
- **Réglages du site** : 1 entrée (templateId `medical-classic`)

Si une collection apparaît vide ou incomplète, vérifier `users.tenantId` en DB et le rôle.

## Signup en production

L'endpoint `POST /api/auth/signup` provisionne un nouveau tenant + practitioner user. Body attendu :

```json
{
  "email": "praticien@example.fr",
  "password": "min8chars",
  "name": "Dr. Prénom Nom",
  "slug": "prenom-nom",
  "firstName": "Prénom",
  "lastName": "Nom",
  "specialty": "Ostéopathe"
}
```

Réponse `201` :

```json
{ "userId": "...", "tenantId": "...", "practitionerId": "..." }
```

Codes d'erreur :
- `400` — body invalide (Zod issues retournés)
- `409` — `EMAIL_TAKEN` ou `SLUG_TAKEN`

⚠️ **Rate limiting** non implémenté nativement. Protéger en amont via Vercel WAF / Cloudflare en prod.

## Réinitialisation

```bash
# Vider toutes les tables tenant + plans (le seed les TRUNCATE de toute façon)
pnpm db:seed:full
```

Note : `pnpm db:seed` ne TRUNCATE PAS la table `users` — sinon ta session admin actuelle serait orphelinée. Pour repartir vraiment de zéro :

```bash
# DESTRUCTIF — supprime tous les users
psql "$DATABASE_URL" -c "TRUNCATE TABLE users CASCADE;"
pnpm db:seed:full
```
