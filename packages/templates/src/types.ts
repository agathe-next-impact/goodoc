import type { ComponentType } from 'react'
import type { ZodType } from 'zod'

/**
 * Raw section payload as persisted in `pages.content` (Payload CMS blocks convention).
 * Every block has at least a `blockType` discriminator and an optional `id`.
 */
export type SectionNode = {
  blockType: string
  id?: string
} & Record<string, unknown>

/**
 * A registered block: its discriminator, its Zod schema for runtime validation,
 * and its React component. Generic in `TProps` so the registry can hold any
 * block without unsafe casts at the call sites.
 */
export type BlockDefinition<TProps extends Record<string, unknown> = Record<string, unknown>> = {
  blockType: string
  schema: ZodType<TProps>
  Component: ComponentType<TProps>
}

/**
 * HSL triplet stored **without** the `hsl()` wrapper — e.g. `'201 96% 32%'`.
 * Kept as a raw string so it can be injected into CSS custom properties and
 * composed with alpha via `hsl(var(--primary) / 0.5)`.
 */
export type HslTriplet = string

export type ThemeColorTokens = {
  background: HslTriplet
  foreground: HslTriplet
  card: HslTriplet
  cardForeground: HslTriplet
  primary: HslTriplet
  primaryForeground: HslTriplet
  secondary: HslTriplet
  secondaryForeground: HslTriplet
  muted: HslTriplet
  mutedForeground: HslTriplet
  accent: HslTriplet
  accentForeground: HslTriplet
  destructive: HslTriplet
  destructiveForeground: HslTriplet
  border: HslTriplet
  input: HslTriplet
  ring: HslTriplet
}

export type ThemeFontTokens = {
  sans: string
  serif: string
}

export type ThemeTokens = {
  colors: ThemeColorTokens
  fonts: ThemeFontTokens
  radius: string
}

/**
 * Tenant-level overrides persisted in `site_settings` (hex colors, font family
 * names). Converted to HSL triplets at render time by `buildThemeCss`.
 */
export type ThemeOverrides = {
  primaryHex?: string | null
  secondaryHex?: string | null
  fontHeading?: string | null
  fontBody?: string | null
}

/**
 * A template bundles a name, a theme (default tokens), and page presets — a
 * preset is the default composition of sections for a given page slug,
 * applied at onboarding when the practitioner selects the template.
 */
export type PagePreset = Array<{
  blockType: string
  data: Record<string, unknown>
}>

export type TemplateDefinition = {
  id: string
  name: string
  description: string
  theme: ThemeTokens
  presets: Record<string, PagePreset>
}
