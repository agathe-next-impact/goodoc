import type { ThemeTokens } from '../types'

/**
 * Baseline theme — mirrors `apps/web/src/app/globals.css :root`. Serves as the
 * fallback when a tenant has no template assigned or references an unknown
 * template id. Every registered template typically cherry-picks from these
 * values and overrides only what's specific.
 */
export const defaultTheme: ThemeTokens = {
  colors: {
    background: '0 0% 100%',
    foreground: '222 47% 11%',
    card: '0 0% 100%',
    cardForeground: '222 47% 11%',
    primary: '201 96% 32%',
    primaryForeground: '0 0% 100%',
    secondary: '210 40% 96%',
    secondaryForeground: '222 47% 11%',
    muted: '210 40% 96%',
    mutedForeground: '215 16% 47%',
    accent: '201 96% 96%',
    accentForeground: '201 96% 20%',
    destructive: '0 72% 51%',
    destructiveForeground: '0 0% 100%',
    border: '214 32% 91%',
    input: '214 32% 91%',
    ring: '201 96% 32%',
  },
  fonts: {
    sans: "'Inter', ui-sans-serif, system-ui",
    serif: "'Source Serif Pro', ui-serif, Georgia",
  },
  radius: '0.5rem',
}
