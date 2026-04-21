# Prompt 08 — Stripe Billing, Onboarding et Emails transactionnels

## Contexte
Tu travailles sur `packages/billing/`, `packages/email/`, et le flux d'onboarding dans `apps/admin/`. Le modèle est un SaaS avec 3 plans (Essentiel 59€/mois, Pro 119€/mois, Premium 199€/mois) + frais de mise en service initiaux.

## Objectif
Implémenter le cycle de vie complet de l'abonnement : inscription → essai gratuit → paiement → renouvellement → upgrade/downgrade → résiliation, avec les emails transactionnels associés.

## Instructions

### 1. Package Billing (`packages/billing/`)

#### Stripe Products & Prices
Créer un script `setup-stripe.ts` qui configure dans Stripe :
- 3 produits (Essentiel, Pro, Premium)
- 3 prix récurrents mensuels
- 3 prix one-time pour les frais de setup
- Un coupon "LAUNCH50" (50% sur les 3 premiers mois) pour le lancement

#### Service Billing (`src/billing-service.ts`)
```typescript
export const billingService = {
  createCustomer(email: string, name: string, tenantId: string): Promise<string>
  createCheckoutSession(params: {
    customerId: string
    planId: string         // → stripe price ID récurrent
    setupPriceId: string   // → stripe price ID one-time
    successUrl: string
    cancelUrl: string
    trialDays?: number     // default 14
  }): Promise<string>      // → checkout session URL
  createBillingPortalSession(customerId: string): Promise<string>
  changePlan(subscriptionId: string, newPriceId: string): Promise<void>
  cancelSubscription(subscriptionId: string): Promise<void>
  getSubscription(subscriptionId: string): Promise<SubscriptionStatus>
}
```

#### Webhook Handler (`src/webhook-handler.ts`)
Gérer les événements Stripe :
- `checkout.session.completed` → activer le tenant, passer status à 'active'
- `invoice.paid` → logger le paiement, envoyer facture par email
- `invoice.payment_failed` → envoyer email de relance, après 3 échecs → suspendre
- `customer.subscription.updated` → mettre à jour le plan du tenant
- `customer.subscription.deleted` → passer status à 'cancelled', déclencher rétention

### 2. Flux d'onboarding (5 étapes)

Implémenter dans `apps/admin/` un wizard d'onboarding avec sauvegarde automatique :

**Étape 1 — Inscription**
- Formulaire : email, mot de passe, confirmation mot de passe
- Validation Zod
- Création du user Payload + tenant (status: 'trial')
- Email de bienvenue

**Étape 2 — Profil professionnel**
- Civilité, prénom, nom, spécialité (autocomplete depuis la liste)
- Numéro ADELI/RPPS (optionnel)
- Photo de profil (upload)
- Adresse du cabinet (avec autocomplétion Google Places → extraction lat/lng)
- Téléphone, email professionnel

**Étape 3 — Choix du template**
- 3 cards visuelles : Spécialiste, Paramédical, Bien-être
- Preview en miniature de chaque template
- Sélection → prévisualisation live avec les données saisies à l'étape 2

**Étape 4 — Personnalisation**
- Couleur principale (color picker avec presets médicaux sobres)
- Logo (upload optionnel)
- Texte d'accroche (pré-rempli selon la spécialité, éditable)
- URL Doctolib (champ avec aide contextuelle "Comment trouver mon URL Doctolib ?")
- Prévisualisation live en split-screen

**Étape 5 — Mise en ligne**
- Choix du sous-domaine : `{slug}.medsite.fr` (vérification disponibilité en temps réel)
- Option domaine personnalisé (saisie + instructions DNS)
- Résumé de la configuration
- Bouton "Mettre mon site en ligne" → publication
- Redirection vers le dashboard avec confettis 🎉

Le champ `onboardingStep` dans `tenants` est mis à jour à chaque étape. Si le praticien quitte et revient, il reprend où il en était.

### 3. Package Email (`packages/email/`)

Templates React Email avec Resend :

#### Emails transactionnels
1. **Bienvenue** : après inscription, lien vers l'onboarding
2. **Site en ligne** : confirmation de publication avec lien vers le site + dashboard
3. **Nouveau message contact** : notification au praticien avec aperçu du message
4. **Facture** : pièce jointe PDF de la facture Stripe
5. **Essai expire bientôt** : J-3 avant fin d'essai, avec CTA vers le paiement
6. **Paiement échoué** : J+1, J+7, J+14 — 3 niveaux d'urgence croissante
7. **Site suspendu** : notification que le site est hors ligne + lien pour régulariser
8. **Rapport mensuel** (P2) : résumé du mois (visiteurs, messages, score SEO)

#### Design des emails
- Header : logo MedSite + nom de la plateforme
- Body : contenu clair, un seul CTA principal par email
- Footer : liens légaux, lien de désinscription
- Responsive (mobile-friendly)
- Couleurs neutres et professionnelles

### 4. Tâches CRON (`packages/billing/src/cron/`)

À exécuter via Vercel Cron :
- **Quotidien** : vérifier les essais expirant dans 3 jours → envoyer email d'alerte
- **Quotidien** : vérifier les essais expirés → suspendre les tenants non convertis
- **Quotidien** : vérifier les paiements échoués → envoyer relances graduelles
- **Hebdomadaire** : vérifier les URLs Doctolib (HEAD request) → alerter si cassées

### 5. API Routes webhook

`apps/admin/app/api/webhooks/stripe/route.ts` :
- Vérifier la signature Stripe (`stripe.webhooks.constructEvent`)
- Router vers le webhook handler
- Retourner 200 rapidement (traitement async)

## Contraintes
- Le webhook Stripe DOIT vérifier la signature — jamais de webhook non vérifié
- Les montants en centimes dans Stripe, en euros dans l'interface
- Pas de données de carte bancaire côté serveur — tout via Stripe Checkout/Portal
- Les emails doivent être envoyés de manière asynchrone (ne pas bloquer la requête)
- Tester le flux complet avec Stripe CLI en mode test
- Le praticien ne doit JAMAIS voir "stripe", "webhook", ou tout terme technique — uniquement "Mon abonnement", "Ma facture"
