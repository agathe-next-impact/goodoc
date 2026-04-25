# Authoring guide — ajouter un bloc ou un template

Ce document décrit la procédure pour étendre le système `@medsite/templates` : ajouter un nouveau bloc, un nouveau thème, ou un preset de composition. Il suit la convention projet (TypeScript strict, Zod partout, Server Components par défaut, tokens CSS exclusivement).

---

## 1. Anatomie du système

```
packages/templates/src/
├── types.ts                  — SectionNode, BlockDefinition, ThemeTokens, TemplateDefinition
├── registry.ts               — registerBlock / registerTemplate / getBlock / getTemplate
├── renderer.tsx              — <SectionRenderer> parcourt pages.content et rend
├── theme/                    — tokens de base + injection CSS
├── blocks/                   — UN FICHIER = UN BLOC
│   ├── _shared/              — primitives (Section, ButtonLink, JsonLd, schémas)
│   ├── hero-split.tsx
│   └── …
├── themes/                   — UN FICHIER = UN THÈME (tokens + preset)
│   ├── medical-classic.ts
│   └── …
└── presets/
    ├── _content.ts           — contenu "lorem-médical" partagé
    ├── _builder.ts           — buildCorePresets(skin) paramétrique
    └── pages.ts              — buildPresetPages(templateId) pour le seed/admin
```

Le **registre** est le cœur : chaque bloc s'y inscrit à l'import (side-effect) et chaque template s'enregistre via `registerBuiltInTemplates()` appelé au démarrage du layout tenant.

---

## 2. Ajouter un bloc

### 2.1 — Créer le fichier du bloc

Dans `packages/templates/src/blocks/mon-bloc.tsx` :

```tsx
import { z } from 'zod'
import { registerBlock } from '../registry'
import { Section, SectionHeader } from './_shared/section'

export const monBlocSchema = z.object({
  blockType: z.literal('mon-bloc'),
  id: z.string().optional(),
  title: z.string().min(1),
  items: z.array(z.object({ value: z.string().min(1) })).min(1),
})

export type MonBlocProps = z.infer<typeof monBlocSchema>

export function MonBloc({ title, items }: MonBlocProps) {
  return (
    <Section>
      <SectionHeader title={title} />
      <ul>{items.map((i) => <li key={i.value}>{i.value}</li>)}</ul>
    </Section>
  )
}

registerBlock({
  blockType: 'mon-bloc',
  schema: monBlocSchema,
  Component: MonBloc,
})
```

### 2.2 — Enregistrer dans le barrel

`packages/templates/src/blocks/index.ts` :

```ts
import './mon-bloc'
export { MonBloc, monBlocSchema } from './mon-bloc'
```

### 2.3 — Ajouter le Payload Block miroir

`apps/admin/src/collections/_page-blocks/blocks.ts` :

```ts
export const monBlocBlock: Block = {
  slug: 'mon-bloc',                       // DOIT être identique au blockType Zod
  labels: { singular: 'Mon bloc', plural: 'Mes blocs' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titre' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [{ name: 'value', type: 'text', required: true, label: 'Valeur' }],
    },
  ],
}
```

Puis ajouter `monBlocBlock` dans l'array `pageBlocks` exporté à la fin du même fichier.

### 2.4 — Règles d'alignement Payload ↔ Zod

| Payload | Zod | Commentaire |
|---------|-----|-------------|
| `type: 'text'`, required | `z.string().min(1)` | |
| `type: 'text'` | `z.string().optional()` | |
| `type: 'textarea'` | `z.string().optional()` ou `.min(1)` | |
| `type: 'number'` | `z.number()` | |
| `type: 'checkbox'` | `z.boolean().optional()` | |
| `type: 'select'` | `z.enum([...])` | les `value` du select **doivent** matcher les strings de l'enum |
| `type: 'array', fields: [{name:'value',...}]` | `z.array(z.object({ value: z.string() }))` | Payload wrappe chaque item ; ne pas utiliser `z.array(z.string())` |
| `type: 'group', fields: [...]` | `z.object({...})` | |
| `type: 'upload'` | pas utilisé — privilégier `group { url, alt }` | Upload casserait la self-containment du bloc |

### 2.5 — Interdits / pièges

- **Pas de `z.string().default(...)`** sur une propriété du schéma : crée un décalage input/output que `ZodType<TProps>` refuse. Utilise `.optional()` + fallback dans le composant.
- **Pas de `next/image`, `next/link`** dans les blocs : le package `@medsite/templates` reste portable. Balise `<img>` avec `loading="lazy" decoding="async" width height`.
- **Pas d'accès réseau ou fs** dans un bloc : pure fonction des props.
- **Pas de couleur hardcodée** : tout passe par les tokens (`bg-primary`, `text-muted-foreground`, `border-input`, `rounded-[var(--radius)]`, `font-serif`).
- **`'use client'`** uniquement si le bloc manipule du state DOM (formulaires, accordéons, carousels). Server par défaut.

### 2.6 — Tests

Ajoute un cas dans `src/__tests__/blocks.test.ts` :

```ts
it('mon-bloc validates a minimal payload', () => {
  const def = getBlock('mon-bloc')!
  const parsed = def.schema.safeParse({
    blockType: 'mon-bloc',
    title: 'Hello',
    items: [{ value: 'a' }],
  })
  expect(parsed.success).toBe(true)
})
```

---

## 3. Ajouter un thème

### 3.1 — Créer `themes/mon-theme.ts`

```ts
import { buildCorePresets } from '../presets/_builder'
import { defaultTheme } from '../theme/default-theme'
import type { TemplateDefinition } from '../types'

export const monTheme: TemplateDefinition = {
  id: 'mon-theme',
  name: 'Mon Thème',
  description: 'Description courte.',
  theme: {
    colors: {
      ...defaultTheme.colors,
      primary: '270 50% 45%',      // H S% L% — JAMAIS de hsl() wrapper
      primaryForeground: '0 0% 100%',
      accent: '270 50% 95%',
      accentForeground: '270 50% 20%',
      ring: '270 50% 45%',
    },
    fonts: {
      sans: "'Inter', ui-sans-serif, system-ui",
      serif: "'Source Serif Pro', ui-serif, Georgia",
    },
    radius: '0.5rem',
  },
  presets: buildCorePresets({
    heroTitle: '…',
    heroSubtitle: '…',
    primaryCtaLabel: 'Prendre rendez-vous',
    secondaryCtaLabel: '…',
    servicesTitle: '…',
    aboutTitle: '…',
    aboutBody: '…',
    testimonialsTitle: '…',
    faqTitle: '…',
    ctaBannerTitle: '…',
    feesTitle: '…',
    contactTitle: '…',
  }),
}
```

### 3.2 — Enregistrer

`themes/index.ts` :

```ts
import { monTheme } from './mon-theme'

const builtInTemplates = [medicalClassic, warmWellness, …, monTheme]

// … registerBuiltInTemplates inchangé

export { monTheme, … }
```

Et dans `src/index.ts`, ré-exporter :

```ts
export { monTheme, medicalClassic, … } from './themes'
```

### 3.3 — Exposer dans le back-office

Ajouter l'option dans `apps/admin/src/globals/SiteSettings.ts` :

```ts
{ label: 'Mon Thème', value: 'mon-theme' },
```

### 3.4 — Règles sur les tokens

- **Format HSL obligatoire** : `'H S% L%'` sans `hsl()` — test automatique dans `src/__tests__/templates.test.ts` vérifie le regex.
- **Contrastes WCAG AA** : vérifier `primaryForeground` vs `primary`, `foreground` vs `background`. Utilise https://webaim.org/resources/contrastchecker/.
- **Radius cohérent** : `0rem` (anguleux), `0.25rem` à `1rem` (standard). Au-delà, les boutons deviennent visuellement étranges.
- **Fonts** : préférer des fontes Google Fonts ou self-hosted. Citer la fonte entre `' '` dans le token : `"'Nunito', ui-sans-serif, system-ui"`.

---

## 4. Composer un preset

Le helper `buildCorePresets(skin)` produit les 6 pages canoniques. Si un thème veut dévier (ex. mettre un bloc différent sur home), deux options :

**Option simple** — accepter la structure commune et ne changer que les textes via `skin`.

**Option avancée** — composer manuellement :

```ts
presets: {
  ...buildCorePresets({ /* skin */ }),
  home: [
    // Composition custom, qui écrase celle générée par skin
    { blockType: 'hero-split', data: { /* … */ } },
    { blockType: 'practitioner-card', data: { /* … */ } }, // bloc différent
    // …
  ],
}
```

Chaque entrée de `presets[slug]` est un `PagePreset` = `Array<{ blockType: string, data: Record<string, unknown> }>`.

**Test automatique** : `src/__tests__/templates.test.ts` parse chaque `data` contre le schéma Zod de son bloc — toute dérive casse CI.

---

## 5. Vérifier et tester

```bash
pnpm --filter @medsite/templates typecheck
pnpm --filter @medsite/templates lint
pnpm --filter @medsite/templates test

# Puis full monorepo avant commit
pnpm typecheck && pnpm lint && pnpm test
```

Pour tester visuellement :

```bash
pnpm db:seed          # applique les presets aux 3 tenants dev
pnpm dev              # apps/web sur :3003
```

Puis :
- http://dr-sophie-martin.localhost:3003/p/home (medical-classic)
- http://cabinet-dupont.localhost:3003/p/home (family-practice)
- http://emilie-rousseau.localhost:3003/p/home (warm-wellness)

Dans l'admin (`http://localhost:3001/admin`), la galerie de templates est visible sur le dashboard d'accueil — un clic sur « Appliquer ce modèle » POST sur `/api/apply-template-preset` et crée les 6 pages canoniques pour le tenant courant.

---

## 6. JSON-LD

Les blocs suivants émettent leur propre JSON-LD (schema.org) via le helper local `_shared/json-ld.tsx` :

| Bloc | Type schema.org |
|------|-----------------|
| `faq-accordion` | `FAQPage` |
| `services-grid` | `ItemList` de `Service` |
| `testimonials-grid` | `ItemList` de `Review` |
| `opening-hours` | `LocalBusiness` + `OpeningHoursSpecification` |

Un nouveau bloc qui représente une entité schema.org (article, produit, événement) doit inclure son propre `<JsonLd data={…} />`. **Ne jamais** importer depuis `@medsite/seo` : le package templates doit rester self-contained.

---

## 7. Documenter

- Si le bloc est spécifique à un thème, noter dans la doc du thème.
- Si le bloc a un impact sur la mise en page (pleine largeur, marges négatives), documenter en commentaire JSDoc en tête du fichier.
- Pour toute nouvelle décision structurelle (nouvelle primitive `_shared/`, nouveau type dans `types.ts`), ajouter un paragraphe ici.
