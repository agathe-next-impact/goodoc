import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { BookingSection } from '@medsite/doctolib'
import {
  JsonLd,
  buildBreadcrumbItems,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
} from '@medsite/seo'

import { getTenant } from '@/lib/tenant'
import { buildSiteUrl, toTenantSEOData } from '@/lib/seo-helpers'

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant()
  const seoData = toTenantSEOData(tenant)
  const meta = generatePageMetadata({ tenant: seoData, page: 'contact' })
  return {
    title: `Prendre rendez-vous | ${tenant.tenant.name}`,
    description: meta.description,
  }
}

export default async function BookingPage() {
  const tenant = await getTenant()
  const { practitioner, primaryAddress, openingHours } = tenant
  const siteUrl = buildSiteUrl(tenant)

  // If contact mode, redirect to contact page
  if (practitioner.bookingMode === 'contact') {
    redirect('/contact')
  }

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    buildBreadcrumbItems(siteUrl, {
      name: 'Rendez-vous',
      path: '/rendez-vous',
    }),
  )

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <section className="container mx-auto px-6 py-16">
        <BookingSection
          practitioner={{
            doctolibUrl: practitioner.doctolibUrl,
            alternativeBookingUrl: practitioner.alternativeBookingUrl,
            phoneNumber: practitioner.phoneNumber,
            bookingMode: practitioner.bookingMode,
            ctaLabel: practitioner.ctaLabel,
          }}
          openingHoursSummary={
            openingHours.length > 0
              ? formatOpeningHoursSummary(openingHours)
              : undefined
          }
        />

        {/* Practical info */}
        {primaryAddress && (
          <div className="mt-12 rounded-xl border border-border/60 bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Informations pratiques
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                  Adresse
                </h3>
                <address className="not-italic">
                  {primaryAddress.streetAddress}
                  <br />
                  {primaryAddress.postalCode} {primaryAddress.city}
                </address>
              </div>
              {practitioner.phoneNumber && (
                <div>
                  <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                    Téléphone
                  </h3>
                  <a
                    href={`tel:${practitioner.phoneNumber.replace(/\s/g, '')}`}
                    className="text-primary hover:underline"
                  >
                    {practitioner.phoneNumber}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  )
}

function formatOpeningHoursSummary(
  hours: { dayOfWeek: number; isClosed: boolean; openTime: string | null; closeTime: string | null }[],
): string {
  const openDays = hours.filter((h) => !h.isClosed)
  if (openDays.length === 0) return ''
  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
  const sorted = [...openDays].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  const first = sorted[0]!
  const last = sorted[sorted.length - 1]!
  return `Du ${days[first.dayOfWeek]} au ${days[last.dayOfWeek]}, ${first.openTime} – ${first.closeTime}`
}
