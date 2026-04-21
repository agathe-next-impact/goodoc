# Prompt 05 — Package Doctolib : Widget, CTA et Fallback

## Contexte
Tu travailles dans `packages/doctolib/`. Doctolib ne propose PAS d'API publique. L'intégration repose exclusivement sur le widget iframe officiel et les boutons CTA de redirection. Le système doit gérer gracieusement les praticiens qui ne sont pas sur Doctolib.

## Objectif
Créer le package complet d'intégration Doctolib avec les composants React, la logique de fallback, et les utilitaires d'extraction d'URL.

## Instructions

### 1. Utilitaires d'URL (`src/utils.ts`)

```typescript
/**
 * Extrait le slug praticien depuis une URL Doctolib.
 * Formats supportés :
 * - https://www.doctolib.fr/osteopathe/aurillac/jean-dupont
 * - https://www.doctolib.fr/osteopathe/aurillac/jean-dupont?pid=practice-12345
 * - https://doctolib.fr/osteopathe/aurillac/jean-dupont
 * Retourne null si l'URL n'est pas une URL Doctolib valide.
 */
export function extractDoctolibSlug(url: string): string | null

/**
 * Construit l'URL du widget iframe Doctolib.
 * https://www.doctolib.fr/iframe/{slug}
 */
export function buildDoctolibWidgetUrl(slug: string): string

/**
 * Construit l'URL de redirection vers un motif de consultation spécifique.
 * https://www.doctolib.fr/{specialite}/{ville}/{slug}?pid=...&motif=...
 */
export function buildDoctolibMotifUrl(baseUrl: string, motifSlug?: string): string

/**
 * Détermine le booking mode automatiquement :
 * - doctolibUrl renseigné → 'doctolib'
 * - alternativeBookingUrl renseigné → 'alternative'
 * - aucun → 'contact'
 */
export function resolveBookingMode(practitioner: {
  doctolibUrl?: string | null
  alternativeBookingUrl?: string | null
}): 'doctolib' | 'alternative' | 'contact'
```

### 2. Composant Widget Iframe (`src/components/doctolib-widget.tsx`)

```typescript
'use client'

interface DoctolibWidgetProps {
  slug: string
  className?: string
  minHeight?: number  // default 600
}

/**
 * Widget iframe Doctolib intégré.
 * - Lazy loaded (loading="lazy") pour ne pas impacter le LCP
 * - Attribut allowpaymentrequest pour les téléconsultations
 * - Responsive : 100% width, hauteur minimale configurable
 * - Affiche un skeleton loader pendant le chargement
 * - Gère l'erreur de chargement gracieusement (fallback vers bouton CTA)
 */
export function DoctolibWidget({ slug, className, minHeight = 600 }: DoctolibWidgetProps)
```

Attributs iframe critiques :
```html
<iframe
  src="https://www.doctolib.fr/iframe/{slug}"
  loading="lazy"
  allow="payment"
  allowpaymentrequest="true"
  referrerpolicy="no-referrer-when-downgrade"
  style="width: 100%; min-height: 600px; border: none;"
  title="Prendre rendez-vous sur Doctolib"
/>
```

### 3. Composant Bouton CTA (`src/components/booking-cta.tsx`)

```typescript
interface BookingCtaProps {
  practitioner: {
    doctolibUrl?: string | null
    alternativeBookingUrl?: string | null
    phoneNumber?: string | null
    bookingMode: 'doctolib' | 'alternative' | 'contact'
    ctaLabel?: string | null
  }
  /** Contexte : page d'accueil, page d'acte, header, etc. */
  context: 'hero' | 'header' | 'service' | 'sticky' | 'footer'
  /** Nom de l'acte pour le CTA contextuel sur les pages d'actes */
  serviceName?: string
  /** Slug du motif Doctolib pour lien profond */
  doctolibMotifSlug?: string
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Bouton CTA adaptatif selon le bookingMode :
 * 
 * Mode 'doctolib' :
 *   - hero/service : "Prendre RDV pour {serviceName}" → lien Doctolib
 *   - header : "Prendre RDV" → lien Doctolib
 *   - sticky mobile : icône calendrier + "RDV" → lien Doctolib
 * 
 * Mode 'alternative' :
 *   - Même patterns mais pointe vers Cal.com/Calendly
 * 
 * Mode 'contact' :
 *   - hero : "Me contacter" → ancre vers #contact ou /contact
 *   - header : "Contactez-moi" → /contact
 *   - service : "Prendre RDV pour {serviceName}" → /contact?motif={serviceName}
 *   - sticky mobile : icône téléphone + "Appeler" → tel:{phoneNumber}
 */
export function BookingCta(props: BookingCtaProps)
```

### 4. Composant Sticky Mobile (`src/components/sticky-booking-bar.tsx`)

Barre fixe en bas de l'écran sur mobile (< 768px) :
- Mode Doctolib : bouton "Prendre RDV" qui ouvre le lien Doctolib
- Mode contact : deux boutons : "Appeler" (tel:) + "Écrire" (→ /contact)
- Se masque quand l'utilisateur scrolle vers le haut (recalcul direction du scroll)
- z-index suffisant pour être au-dessus du contenu

### 5. Composant Section RDV (`src/components/booking-section.tsx`)

Section complète pour la page d'accueil ou la page /rendez-vous :
```
Mode 'doctolib' :
  ┌──────────────────────────────────────┐
  │  Prendre rendez-vous                 │
  │  ┌────────────────────────────────┐  │
  │  │     Widget iframe Doctolib     │  │
  │  │                                │  │
  │  └────────────────────────────────┘  │
  │  Ou appelez le 04 71 XX XX XX       │
  └──────────────────────────────────────┘

Mode 'contact' :
  ┌──────────────────────────────────────┐
  │  Prendre rendez-vous                 │
  │  ┌─────────────┐ ┌──────────────┐   │
  │  │  📞 Appeler  │ │  ✉️ Écrire   │   │
  │  └─────────────┘ └──────────────┘   │
  │  Ou prenez RDV par téléphone :      │
  │  04 71 XX XX XX                      │
  │  Du lundi au vendredi, 9h-18h       │
  └──────────────────────────────────────┘
```

### 6. Hook de validation (`src/hooks/use-doctolib-status.ts`)

```typescript
'use client'

/**
 * Hook qui vérifie périodiquement que l'URL Doctolib est toujours valide.
 * Utilisé dans le dashboard praticien pour alerter si le lien est cassé.
 * Fait un HEAD request côté serveur (via Server Action) pour éviter les CORS.
 */
export function useDoctolibStatus(doctolibUrl: string | null): {
  status: 'valid' | 'invalid' | 'checking' | 'unconfigured'
  lastChecked: Date | null
}
```

### 7. Server Action de vérification (`src/actions/check-doctolib.ts`)

```typescript
'use server'

/**
 * Vérifie qu'une URL Doctolib est accessible (HEAD request).
 * Appelé depuis le dashboard praticien et par le hook client.
 * Retourne { valid: boolean, statusCode: number }.
 */
export async function checkDoctolibUrl(url: string): Promise<{
  valid: boolean
  statusCode: number
}>
```

### 8. Tests (`src/__tests__/`)

- `utils.test.ts` : extraction de slug depuis 10+ formats d'URL (avec/sans www, avec/sans paramètres, URLs invalides)
- `booking-cta.test.tsx` : rendu correct pour chaque combinaison bookingMode × context
- `doctolib-widget.test.tsx` : attributs iframe corrects, skeleton pendant le chargement
- `resolve-booking-mode.test.ts` : tous les cas (doctolib seul, alternative seul, les deux, aucun)

## Contraintes
- Tous les composants sont des Client Components ('use client') car ils ont de l'interactivité
- L'iframe Doctolib DOIT avoir `allowpaymentrequest` — sans ça, le paiement des téléconsultations échoue
- Jamais de scraping Doctolib — uniquement les mécanismes officiels (iframe + lien)
- Le fallback doit être invisible pour le patient — la transition Doctolib → contact doit sembler intentionnelle, pas cassée
- Penser à l'accessibilité : `aria-label` sur tous les CTA, `title` sur l'iframe
- Le package n'a aucune dépendance sur Payload CMS ou la base de données — il reçoit des props typées
