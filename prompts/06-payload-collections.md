# Prompt 06 — Payload CMS : Collections et configuration admin

## Contexte
Tu travailles dans `apps/admin/`. Payload CMS 3 sert de back-office pour les praticiens. L'interface doit être radicalement simplifiée : un praticien non-technique doit pouvoir gérer son site en 5 minutes. Le CMS utilise PostgreSQL via `@payloadcms/db-postgres` et partage le même schéma DB que `packages/db/`.

## Objectif
Configurer Payload CMS avec toutes les collections, les rôles, l'upload vers Cloudflare R2, et une interface admin épurée adaptée aux praticiens.

## Instructions

### 1. Configuration principale (`payload.config.ts`)

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

export default buildConfig({
  admin: {
    meta: {
      title: 'MedSite — Gérer mon site',
      description: 'Back-office de gestion de votre site professionnel',
      favicon: '/favicon.ico',
    },
    components: {
      // Dashboard personnalisé (voir section 5)
      afterDashboard: ['/components/practitioner-dashboard'],
    },
  },
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      // Blocs personnalisés : CTA Doctolib, FAQ, Témoignage, Carte
    ],
  }),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    // Utiliser le schéma Drizzle existant (packages/db)
  }),
  plugins: [
    s3Storage({
      collections: { media: true },
      bucket: process.env.CLOUDFLARE_R2_BUCKET,
      config: {
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
        },
        region: 'auto',
      },
    }),
  ],
  collections: [
    Practitioners,
    Services,
    Pages,
    BlogPosts,
    FaqItems,
    Testimonials,
    ContactMessages,
    Media,
  ],
  globals: [
    SiteSettings,
  ],
})
```

### 2. Collection Practitioners

```typescript
{
  slug: 'practitioners',
  labels: { singular: 'Profil', plural: 'Profil' },
  admin: {
    useAsTitle: 'lastName',
    defaultColumns: ['lastName', 'firstName', 'specialty'],
    description: 'Vos informations professionnelles',
    group: 'Mon site',
  },
  access: {
    read: tenantIsolation,
    update: tenantIsolation,
    // Pas de create/delete — géré par l'onboarding
  },
  hooks: {
    beforeChange: [
      // Auto-extract Doctolib slug from URL
      extractDoctolibSlugHook,
      // Auto-compute bookingMode
      computeBookingModeHook,
      // Auto-generate specialtySlug
      generateSpecialtySlugHook,
      // Auto-map schemaOrgType from specialty
      mapSchemaOrgTypeHook,
    ],
  },
  fields: [
    // Onglet "Identité"
    { type: 'tabs', tabs: [
      { label: 'Identité', fields: [
        { type: 'row', fields: [
          { name: 'title', type: 'select', options: ['Dr', 'Mme', 'M.'], label: 'Civilité' },
          { name: 'firstName', type: 'text', required: true, label: 'Prénom' },
          { name: 'lastName', type: 'text', required: true, label: 'Nom' },
        ]},
        { name: 'specialty', type: 'text', required: true, label: 'Spécialité',
          admin: { description: 'Ex : Ostéopathe, Dermatologue, Sophrologue' } },
        { name: 'adeliRpps', type: 'text', label: 'N° ADELI ou RPPS',
          admin: { description: 'Facultatif — sera vérifié automatiquement (bientôt)' } },
        { name: 'bio', type: 'richText', label: 'Présentation',
          admin: { description: 'Décrivez votre parcours, votre approche et vos valeurs. 200-500 mots recommandés.' } },
        { name: 'photo', type: 'upload', relationTo: 'media', label: 'Photo de profil' },
      ]},
      // Onglet "Contact"
      { label: 'Contact', fields: [
        { name: 'phoneNumber', type: 'text', label: 'Téléphone du cabinet' },
        { name: 'email', type: 'email', label: 'Email professionnel' },
      ]},
      // Onglet "Prise de rendez-vous"
      { label: 'Rendez-vous', fields: [
        { name: 'doctolibUrl', type: 'text', label: 'URL de votre profil Doctolib',
          admin: { 
            description: 'Collez l\'URL complète de votre page Doctolib. Exemple : https://www.doctolib.fr/osteopathe/aurillac/jean-dupont',
            placeholder: 'https://www.doctolib.fr/...',
          } },
        { name: 'doctolibSlug', type: 'text', admin: { readOnly: true, hidden: true } },
        { name: 'alternativeBookingUrl', type: 'text', label: 'Autre outil de RDV en ligne (Cal.com, Calendly...)',
          admin: { 
            condition: (data) => !data.doctolibUrl,
            description: 'Si vous n\'utilisez pas Doctolib, indiquez l\'URL de votre outil de prise de RDV.',
          } },
        { name: 'bookingMode', type: 'select',
          options: ['doctolib', 'alternative', 'contact'],
          admin: { readOnly: true, description: 'Calculé automatiquement selon les URLs renseignées.' } },
        { name: 'showDoctolibWidget', type: 'checkbox', defaultValue: true,
          label: 'Afficher le calendrier Doctolib sur mon site',
          admin: { condition: (data) => data.bookingMode === 'doctolib' } },
        { name: 'ctaLabel', type: 'text', label: 'Texte du bouton de RDV (optionnel)',
          admin: { placeholder: 'Prendre rendez-vous' } },
      ]},
    ]},
  ],
}
```

### 3. Collection Services (Actes)

Labels français, interface simplifiée avec :
- Titre, description riche (lexical editor avec blocs limités), durée, prix optionnel
- Upload image
- Champ `doctolibMotifSlug` pour le lien profond (optionnel)
- SEO : meta title et description auto-générés mais éditables
- Drag-and-drop pour réordonner (sortOrder)
- Preview link vers la page publique

### 4. Collection Pages

- Types prédéfinis : Accueil, À propos, Contact, Mentions légales
- Éditeur de contenu par blocs (blocks field) avec blocs disponibles :
  - Hero (titre, sous-titre, image, CTA)
  - Texte riche
  - Grille de services (auto-populated)
  - Témoignages (auto-populated)
  - FAQ (auto-populated)
  - Carte Google Maps
  - Galerie photos
  - CTA Doctolib
  - Bloc libre HTML
- Workflow : brouillon → prévisualisation → publication
- Champs SEO éditables (meta title, meta description)

### 5. Dashboard praticien personnalisé

Remplacer le dashboard Payload par défaut par un composant custom affichant :
- Carte de bienvenue : "Bonjour Dr Martin"
- 4 metric cards : visiteurs du mois, messages non lus, avis Google, score SEO
- Actions rapides : "Modifier ma page d'accueil", "Ajouter un acte", "Voir mon site"
- Statut du site : en ligne / hors ligne avec toggle
- Lien Doctolib : statut (actif ✓ / non configuré ⚠️) avec lien pour configurer

### 6. Rôles et Access Control

```typescript
// tenantIsolation — le praticien ne voit que ses données
const tenantIsolation = ({ req: { user } }) => {
  if (user?.role === 'super-admin') return true
  return { tenantId: { equals: user?.tenantId } }
}

// Rôles :
// - super-admin : accès total (équipe interne)
// - practitioner : accès à son tenant uniquement
// - collaborator : accès limité à son tenant (lecture + édition contenu)
```

### 7. Hooks

- `beforeChange` sur Practitioners : extraire le slug Doctolib, calculer bookingMode, mapper schemaOrgType
- `afterChange` sur Pages/Services : invalider le cache ISR (revalidateTag)
- `afterChange` sur SiteSettings : invalider le cache tenant
- `beforeChange` sur Media : compression d'image, génération du alt text automatique

### 8. Internationalisation admin

L'interface admin est entièrement en français :
- Labels de toutes les collections et champs
- Messages d'erreur
- Descriptions et placeholders
- Menu de navigation

## Contraintes
- L'interface doit être SIMPLE — masquer tout ce qui est technique (slugs auto-générés, bookingMode calculé, schemaOrgType)
- Utiliser `admin.condition` pour n'afficher les champs que quand c'est pertinent
- Tabs pour organiser les champs en sections logiques
- Le praticien ne doit JAMAIS voir de JSON, de code, ou de termes techniques
- Preview mode : le praticien peut voir son site avec les modifications non publiées
- Chaque collection a un `admin.description` en français expliquant à quoi elle sert
