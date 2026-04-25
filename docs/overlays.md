# Overlays appliqués

> Ce kit est universel. Aucun overlay stack-spécifique n'est appliqué pour le moment.
>
> Overlays disponibles (à créer / installer séparément selon besoins) :
> - `nextjs-payload` — Next.js + Payload + Stripe + Mapbox
> - `astro-payload` — Astro + Payload headless
> - `wp-nextjs` — WordPress Headless + Next.js
> - `medsite-saas` — Multi-tenant + RGPD santé + HDS
> - `payload-legacy` — Mode diff-scoped pour projet Payload existant

## Appliqués
_(aucun pour l'instant — kit universel)_

## Recommandation post-onboarding (2026-04-25)

Stack détectée : **Next.js 15 + Payload 3 + Drizzle/Postgres + Stripe + Cloudflare R2 + données santé multi-tenant**.

Deux overlays se recoupent :

- `nextjs-payload` — couvre Next.js + Payload + Stripe (proche de la stack)
- `medsite-saas` — multi-tenant + Stripe + données santé (HDS/RGPD renforcé)

Recommandation : appliquer **`medsite-saas`** en priorité (le critère sensibilité santé + RLS multi-tenant est plus contraignant et couvre déjà Next/Payload/Stripe en sous-ensemble). Si l'overlay n'existe pas encore en local, rester en universel et ouvrir un suivi pour le construire à partir des kits dédiés.

## Historique d'application
_(aucun)_
