import type { ThemeOverrides, ThemeTokens } from '../types'
import { hexToHsl } from './hex-to-hsl'

/**
 * Builds a scoped `<style>` body that overrides the CSS custom properties
 * defined in `apps/web/src/app/globals.css`. The template's base tokens are
 * emitted first, followed by any tenant-level overrides (primary/secondary
 * color in hex, font family names).
 */
export function buildThemeCss(
  tokens: ThemeTokens,
  overrides?: ThemeOverrides,
): string {
  const lines: string[] = [':root {']

  lines.push(`  --background: ${tokens.colors.background};`)
  lines.push(`  --foreground: ${tokens.colors.foreground};`)
  lines.push(`  --card: ${tokens.colors.card};`)
  lines.push(`  --card-foreground: ${tokens.colors.cardForeground};`)
  lines.push(`  --primary: ${tokens.colors.primary};`)
  lines.push(`  --primary-foreground: ${tokens.colors.primaryForeground};`)
  lines.push(`  --secondary: ${tokens.colors.secondary};`)
  lines.push(`  --secondary-foreground: ${tokens.colors.secondaryForeground};`)
  lines.push(`  --muted: ${tokens.colors.muted};`)
  lines.push(`  --muted-foreground: ${tokens.colors.mutedForeground};`)
  lines.push(`  --accent: ${tokens.colors.accent};`)
  lines.push(`  --accent-foreground: ${tokens.colors.accentForeground};`)
  lines.push(`  --destructive: ${tokens.colors.destructive};`)
  lines.push(`  --destructive-foreground: ${tokens.colors.destructiveForeground};`)
  lines.push(`  --border: ${tokens.colors.border};`)
  lines.push(`  --input: ${tokens.colors.input};`)
  lines.push(`  --ring: ${tokens.colors.ring};`)
  lines.push(`  --radius: ${tokens.radius};`)
  lines.push(`  --font-sans: ${tokens.fonts.sans};`)
  lines.push(`  --font-serif: ${tokens.fonts.serif};`)

  if (overrides?.primaryHex) {
    const hsl = hexToHsl(overrides.primaryHex)
    if (hsl) {
      lines.push(`  --primary: ${hsl};`)
      lines.push(`  --ring: ${hsl};`)
    }
  }
  if (overrides?.secondaryHex) {
    const hsl = hexToHsl(overrides.secondaryHex)
    if (hsl) lines.push(`  --secondary: ${hsl};`)
  }
  if (overrides?.fontHeading) {
    lines.push(`  --font-serif: "${overrides.fontHeading}", ui-serif, Georgia, serif;`)
  }
  if (overrides?.fontBody) {
    lines.push(`  --font-sans: "${overrides.fontBody}", ui-sans-serif, system-ui, sans-serif;`)
  }

  lines.push('}')
  return lines.join('\n')
}
