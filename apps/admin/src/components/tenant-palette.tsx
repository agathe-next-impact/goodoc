import { siteSettings } from '@medsite/db'
import {
  buildThemeCss,
  defaultTheme,
  getTemplate,
  registerBuiltInTemplates,
} from '@medsite/templates'
import config from '@payload-config'
import { eq } from 'drizzle-orm'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { ReactNode } from 'react'

import { db } from '@/lib/db'

registerBuiltInTemplates()

/**
 * Server-side admin provider that injects the authenticated practitioner's
 * palette as CSS custom properties under the `.medsite-palette-scope` class.
 * The block-picker SVG previews use those vars (`hsl(var(--primary))`, etc.)
 * so changing the template or color in SiteSettings reflects in the picker
 * without any client-side recomputation.
 *
 * Falls through silently when there's no authenticated user (login screen)
 * or no SiteSettings row for the tenant — the picker simply renders with
 * the bundled default theme.
 */
export async function TenantPalette({ children }: { children: ReactNode }) {
  const css = await resolveCss()
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </>
  )
}

async function resolveCss(): Promise<string> {
  try {
    const payload = await getPayload({ config })
    const incoming = await nextHeaders()
    const { user } = await payload.auth({ headers: incoming })
    const tenantId = (user as { tenantId?: string | null } | null)?.tenantId
    if (!tenantId) return scoped(buildThemeCss(defaultTheme))

    const [row] = await db()
      .select({
        templateId: siteSettings.templateId,
        primaryColor: siteSettings.primaryColor,
        secondaryColor: siteSettings.secondaryColor,
        fontHeading: siteSettings.fontHeading,
        fontBody: siteSettings.fontBody,
      })
      .from(siteSettings)
      .where(eq(siteSettings.tenantId, tenantId))
      .limit(1)

    const tokens = getTemplate(row?.templateId ?? '')?.theme ?? defaultTheme
    const overrides = {
      primaryHex: row?.primaryColor ?? null,
      secondaryHex: row?.secondaryColor ?? null,
      fontHeading: row?.fontHeading ?? null,
      fontBody: row?.fontBody ?? null,
    }
    return scoped(buildThemeCss(tokens, overrides))
  } catch {
    return scoped(buildThemeCss(defaultTheme))
  }
}

function scoped(css: string): string {
  return css.replace(':root', '.medsite-palette-scope')
}
