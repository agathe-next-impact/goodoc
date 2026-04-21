import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { BookingSection } from '@medsite/doctolib'
import {
  JsonLd,
  buildBreadcrumbItems,
  generateBreadcrumbJsonLd,
  generateHomeJsonLd,
  generatePageMetadata,
  generateWebSiteJsonLd,
} from '@medsite/seo'

import { getTenant } from '@/lib/tenant'
import {
  getPublishedServices,
  getPublishedTestimonials,
} from '@/lib/queries'
import { buildSiteUrl, toTenantSEOData } from '@/lib/seo-helpers'

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant()
  const seoData = toTenantSEOData(tenant)
  const meta = generatePageMetadata({ tenant: seoData, page: 'home' })
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    alternates: meta.alternates,
  }
}

export default async function TenantHomePage() {
  const tenant = await getTenant()
  const { practitioner, primaryAddress, openingHours } = tenant
  const tenantId = tenant.tenant.id
  const seoData = toTenantSEOData(tenant)
  const siteUrl = buildSiteUrl(tenant)

  const [servicesList, testimonialsList] = await Promise.all([
    getPublishedServices(tenantId),
    getPublishedTestimonials(tenantId, 4),
  ])

  const homeJsonLd = generateHomeJsonLd(seoData)
  const websiteJsonLd = generateWebSiteJsonLd(seoData, {
    hasBlog: true,
  })
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    buildBreadcrumbItems(siteUrl),
  )

  return (
    <>
      <JsonLd data={homeJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Hero */}
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="container mx-auto flex flex-col items-center gap-8 px-6 sm:flex-row sm:items-start sm:gap-12">
          {practitioner.photoUrl && (
            <Image
              src={practitioner.photoUrl}
              alt={`${practitioner.firstName} ${practitioner.lastName}, ${practitioner.specialty}`}
              width={280}
              height={350}
              className="rounded-2xl object-cover shadow-lg"
              priority
            />
          )}
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              {practitioner.specialty}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {practitioner.title ? `${practitioner.title} ` : ''}
              {practitioner.firstName} {practitioner.lastName}
            </h1>
            {primaryAddress && (
              <p className="text-lg text-muted-foreground">
                {primaryAddress.city} ({primaryAddress.postalCode})
              </p>
            )}
            {practitioner.bio && (
              <p className="max-w-prose text-lg leading-relaxed text-foreground/80">
                {practitioner.bio.length > 250
                  ? `${practitioner.bio.slice(0, 250)}…`
                  : practitioner.bio}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <Link
                href="/rendez-vous"
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {practitioner.ctaLabel ?? 'Prendre rendez-vous'}
              </Link>
              <Link
                href="/a-propos"
                className="inline-flex items-center rounded-full border border-primary px-6 py-3 text-base font-semibold text-primary transition hover:bg-primary/10"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services preview */}
      {servicesList.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
              Actes & prestations
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {servicesList.slice(0, 6).map((service) => (
                <Link
                  key={service.id}
                  href={`/actes/${service.slug}`}
                  className="group rounded-xl border border-border/60 bg-card p-6 transition hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold group-hover:text-primary">
                    {service.title}
                  </h3>
                  {service.shortDescription && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {service.shortDescription}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    {service.duration && <span>{service.duration} min</span>}
                    {service.showPrice && service.priceMin && (
                      <span>
                        à partir de {service.priceMin} €
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {servicesList.length > 6 && (
              <div className="mt-8 text-center">
                <Link
                  href="/actes"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Voir tous les actes
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonialsList.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-6">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
              Témoignages
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {testimonialsList.map((t) => (
                <blockquote
                  key={t.id}
                  className="rounded-xl border border-border/60 bg-card p-6"
                >
                  <p className="text-sm leading-relaxed text-foreground/80">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <footer className="mt-4 flex items-center gap-2">
                    {t.authorInitials && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {t.authorInitials}
                      </span>
                    )}
                    <span className="text-sm font-medium">{t.authorName}</span>
                    {t.rating && (
                      <span className="ml-auto text-sm text-amber-500">
                        {'★'.repeat(t.rating)}
                      </span>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking */}
      <BookingSection
        practitioner={{
          doctolibUrl: practitioner.doctolibUrl,
          alternativeBookingUrl: practitioner.alternativeBookingUrl,
          phoneNumber: practitioner.phoneNumber,
          bookingMode: practitioner.bookingMode,
          ctaLabel: practitioner.ctaLabel,
        }}
        className="container mx-auto px-6"
      />

      {/* Location */}
      {primaryAddress && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-6">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
              Nous trouver
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="flex flex-col gap-4">
                <address className="not-italic text-foreground/80">
                  <p className="font-medium">{primaryAddress.streetAddress}</p>
                  <p>
                    {primaryAddress.postalCode} {primaryAddress.city}
                  </p>
                </address>
                {practitioner.phoneNumber && (
                  <a
                    href={`tel:${practitioner.phoneNumber.replace(/\s/g, '')}`}
                    className="text-primary hover:underline"
                  >
                    {practitioner.phoneNumber}
                  </a>
                )}
                {openingHours.length > 0 && (
                  <OpeningHoursTable hours={openingHours} />
                )}
              </div>
              {primaryAddress.latitude && primaryAddress.longitude && (
                <div className="h-64 overflow-hidden rounded-xl sm:h-80">
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
            </div>
          </div>
        </section>
      )}
    </>
  )
}

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function OpeningHoursTable({
  hours,
}: {
  hours: { dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean }[]
}) {
  const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  return (
    <table className="text-sm">
      <tbody>
        {sorted.map((h) => (
          <tr key={h.dayOfWeek}>
            <td className="pr-4 py-1 font-medium">{DAY_NAMES[h.dayOfWeek]}</td>
            <td className="py-1 text-muted-foreground">
              {h.isClosed ? 'Fermé' : `${h.openTime} – ${h.closeTime}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
