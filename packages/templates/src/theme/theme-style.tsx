import type { ThemeOverrides, ThemeTokens } from '../types'
import { buildThemeCss } from './build-css'

/**
 * Server Component that injects a `<style>` tag with the template's tokens
 * and tenant overrides. Place it **inside** the `<body>` of the tenant
 * layout, before the site header — the cascade then picks up the new values
 * for every descendant.
 */
export function ThemeStyle({
  tokens,
  overrides,
}: {
  tokens: ThemeTokens
  overrides?: ThemeOverrides
}) {
  const css = buildThemeCss(tokens, overrides)
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
