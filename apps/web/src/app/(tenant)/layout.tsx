import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { TenantProvider } from '@/lib/tenant-context'
import { getTenantOrNull } from '@/lib/tenant'
import type { TenantSiteSettings } from '@/lib/tenant-types'

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

function themeStyle(settings: TenantSiteSettings | null): string {
  if (!settings) return ''
  const lines: string[] = [':root {']
  if (settings.primaryColor) lines.push(`  --tenant-primary: ${settings.primaryColor};`)
  if (settings.secondaryColor) lines.push(`  --tenant-secondary: ${settings.secondaryColor};`)
  if (settings.fontHeading) lines.push(`  --tenant-font-heading: "${settings.fontHeading}";`)
  if (settings.fontBody) lines.push(`  --tenant-font-body: "${settings.fontBody}";`)
  lines.push('}')
  return lines.join('\n')
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

  const theme = themeStyle(tenant.siteSettings)
  const plausibleId = tenant.siteSettings?.plausibleSiteId

  return (
    <TenantProvider value={tenant}>
      {theme ? <style dangerouslySetInnerHTML={{ __html: theme }} /> : null}
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
