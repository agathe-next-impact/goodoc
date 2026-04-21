import type { Metadata } from 'next'

import {
  JsonLd,
  buildBreadcrumbItems,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
} from '@medsite/seo'

import { ContactForm } from '@/components/contact-form'
import { getTenant } from '@/lib/tenant'
import { buildSiteUrl, toTenantSEOData } from '@/lib/seo-helpers'

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant()
  const seoData = toTenantSEOData(tenant)
  const meta = generatePageMetadata({ tenant: seoData, page: 'contact' })
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    alternates: meta.alternates,
  }
}

export default async function ContactPage() {
  const tenant = await getTenant()
  const { practitioner, primaryAddress, openingHours } = tenant
  const siteUrl = buildSiteUrl(tenant)

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    buildBreadcrumbItems(siteUrl, { name: 'Contact', path: '/contact' }),
  )

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <section className="container mx-auto px-6 py-16">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
          Contact
        </h1>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact form */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Envoyez-nous un message
            </h2>
            <ContactForm tenantId={tenant.tenant.id} />
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold">Coordonnées</h2>
            <dl className="space-y-4 text-lg">
              {practitioner.phoneNumber && (
                <div>
                  <dt className="text-sm uppercase tracking-wider text-muted-foreground">
                    Téléphone
                  </dt>
                  <dd>
                    <a
                      href={`tel:${practitioner.phoneNumber.replace(/\s/g, '')}`}
                      className="text-primary hover:underline"
                    >
                      {practitioner.phoneNumber}
                    </a>
                  </dd>
                </div>
              )}
              {practitioner.email && (
                <div>
                  <dt className="text-sm uppercase tracking-wider text-muted-foreground">
                    Email
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${practitioner.email}`}
                      className="text-primary hover:underline"
                    >
                      {practitioner.email}
                    </a>
                  </dd>
                </div>
              )}
              {primaryAddress && (
                <div>
                  <dt className="text-sm uppercase tracking-wider text-muted-foreground">
                    Adresse
                  </dt>
                  <dd>
                    <address className="not-italic">
                      {primaryAddress.streetAddress}
                      <br />
                      {primaryAddress.postalCode} {primaryAddress.city}
                    </address>
                  </dd>
                </div>
              )}
            </dl>

            {openingHours.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold">Horaires</h3>
                <table className="text-sm">
                  <tbody>
                    {[...openingHours]
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((h) => (
                        <tr key={h.dayOfWeek}>
                          <td className="pr-4 py-1 font-medium">
                            {DAY_NAMES[h.dayOfWeek]}
                          </td>
                          <td className="py-1 text-muted-foreground">
                            {h.isClosed
                              ? 'Fermé'
                              : `${h.openTime} – ${h.closeTime}`}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {primaryAddress?.latitude && primaryAddress?.longitude && (
          <div className="mt-12 h-64 overflow-hidden rounded-xl sm:h-96">
            <iframe
              title="Localisation du cabinet"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''}&q=${primaryAddress.latitude},${primaryAddress.longitude}&zoom=15`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        )}
      </section>
    </>
  )
}

const DAY_NAMES = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
]
