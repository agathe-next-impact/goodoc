import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import {
  defaultTheme,
  getTemplate,
  registerBuiltInTemplates,
  ThemeStyle,
} from '@medsite/templates'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { TenantProvider } from '@/lib/tenant-context'
import { getTenantOrNull } from '@/lib/tenant'
import type { TenantSiteSettings } from '@/lib/tenant-types'

// Ensure every built-in template is available when this layout runs.
registerBuiltInTemplates()

/**
 * Per-request metadata — reuses the same cached tenant fetch as the layout.
 */
export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantOrNull()
  if (!tenant) return {}
  const { practitioner, tenant: core } = tenant
  const title = `${practitioner.title ? practitioner.title + ' ' : ''}${practitioner.firstName} ${practitioner.lastName} — ${practitioner.specialty}`
  return {
    title: {
      default: title,
      template: `%s | ${core.name}`,
    },
    description: practitioner.bio?.slice(0, 160) ?? undefined,
  }
}

export async function generateViewport(): Promise<Viewport> {
  const tenant = await getTenantOrNull()
  return {
    themeColor: tenant?.siteSettings?.primaryColor ?? '#0F766E',
  }
}

/**
 * Picks the template's theme from the registry, or falls back to the baseline
 * tokens when the tenant's `templateId` is unknown (e.g. legacy `specialist`
 * value while the new templates are being rolled out).
 */
function resolveThemeTokens(settings: TenantSiteSettings | null) {
  if (!settings?.templateId) return defaultTheme
  return getTemplate(settings.templateId)?.theme ?? defaultTheme
}

export default async function TenantLayout({
  children,
}: {
  children: ReactNode
}) {
  const tenant = await getTenantOrNull()

  if (!tenant) {
    notFound()
  }

  const status = tenant.tenant.status
  if (status === 'cancelled') {
    notFound()
  }
  if (status === 'suspended') {
    redirect('/suspended')
  }

  const themeTokens = resolveThemeTokens(tenant.siteSettings)
  const themeOverrides = tenant.siteSettings
    ? {
        primaryHex: tenant.siteSettings.primaryColor,
        secondaryHex: tenant.siteSettings.secondaryColor,
        fontHeading: tenant.siteSettings.fontHeading,
        fontBody: tenant.siteSettings.fontBody,
      }
    : undefined
  const plausibleId = tenant.siteSettings?.plausibleSiteId

  return (
    <TenantProvider value={tenant}>
      <ThemeStyle tokens={themeTokens} overrides={themeOverrides} />
      {plausibleId ? (
        <Script
          defer
          data-domain={plausibleId}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      ) : null}
      <div className="flex min-h-screen flex-col">
        <SiteHeader tenant={tenant} />
        <main className="flex-1">{children}</main>
        <SiteFooter tenant={tenant} />
      </div>
    </TenantProvider>
  )
}
