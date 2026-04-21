import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BookingCta } from '@medsite/doctolib'
import {
  JsonLd,
  buildBreadcrumbItems,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateServiceJsonLd,
} from '@medsite/seo'
import type { ServiceSEOData } from '@medsite/seo'

import { getTenant } from '@/lib/tenant'
import { getPublishedServices, getServiceBySlug } from '@/lib/queries'
import { buildSiteUrl, toTenantSEOData } from '@/lib/seo-helpers'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tenant = await getTenant()
  const service = await getServiceBySlug(tenant.tenant.id, slug)
  if (!service) return { title: 'Acte non trouvé' }

  const seoData = toTenantSEOData(tenant)
  const serviceSeo: ServiceSEOData = {
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription ?? undefined,
    showPrice: service.showPrice,
    priceMin: service.priceMin ?? undefined,
    priceMax: service.priceMax ?? undefined,
    metaTitle: service.metaTitle ?? undefined,
    metaDescription: service.metaDescription ?? undefined,
  }
  const meta = generatePageMetadata({
    tenant: seoData,
    page: 'service',
    service: serviceSeo,
  })
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    alternates: meta.alternates,
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tenant = await getTenant()
  const tenantId = tenant.tenant.id
  const { practitioner } = tenant
  const service = await getServiceBySlug(tenantId, slug)
  if (!service) notFound()

  const seoData = toTenantSEOData(tenant)
  const siteUrl = buildSiteUrl(tenant)

  const serviceSeo: ServiceSEOData = {
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription ?? undefined,
    procedureType: (service as Record<string, unknown>).procedureType as string | undefined,
    showPrice: service.showPrice,
    priceMin: service.priceMin ?? undefined,
    priceMax: service.priceMax ?? undefined,
    duration: service.duration ?? undefined,
    imageUrl: service.imageUrl ?? undefined,
  }

  const serviceJsonLd = generateServiceJsonLd(seoData, serviceSeo)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    buildBreadcrumbItems(
      siteUrl,
      { name: 'Actes', path: '/actes' },
      { name: service.title, path: `/actes/${service.slug}` },
    ),
  )

  // Other services for internal linking
  const allServices = await getPublishedServices(tenantId)
  const otherServices = allServices
    .filter((s) => s.id !== service.id)
    .slice(0, 3)

  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Main content */}
          <div className="flex-1">
            <nav className="mb-4 text-sm text-muted-foreground">
              <Link href="/actes" className="hover:text-foreground">
                Actes
              </Link>
              <span className="mx-2">/</span>
              <span>{service.title}</span>
            </nav>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {service.title}
            </h1>

            {service.shortDescription && (
              <p className="mt-4 text-lg text-muted-foreground">
                {service.shortDescription}
              </p>
            )}

            {service.description && (
              <div className="prose mt-8 max-w-none">
                {/* Rich text content will be rendered via a Lexical renderer */}
                <p className="text-foreground/80">
                  {typeof service.description === 'string'
                    ? service.description
                    : 'Contenu détaillé à venir.'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full flex-shrink-0 lg:w-72">
            <div className="sticky top-8 rounded-xl border border-border/60 bg-card p-6">
              <h2 className="text-lg font-semibold">Informations</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {service.duration && (
                  <div>
                    <dt className="text-muted-foreground">Durée</dt>
                    <dd className="font-medium">{service.duration} minutes</dd>
                  </div>
                )}
                {service.showPrice && service.priceMin && (
                  <div>
                    <dt className="text-muted-foreground">Tarif</dt>
                    <dd className="font-medium">
                      {service.priceMax && service.priceMax !== service.priceMin
                        ? `${service.priceMin} – ${service.priceMax} €`
                        : `${service.priceMin} €`}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-6">
                <BookingCta
                  practitioner={{
                    doctolibUrl: practitioner.doctolibUrl,
                    alternativeBookingUrl: practitioner.alternativeBookingUrl,
                    phoneNumber: practitioner.phoneNumber,
                    bookingMode: practitioner.bookingMode,
                    ctaLabel: practitioner.ctaLabel,
                  }}
                  context="service"
                  serviceName={service.title}
                  doctolibMotifSlug={service.doctolibMotifSlug ?? undefined}
                  size="md"
                  className="w-full"
                />
              </div>
            </div>
          </aside>
        </div>

        {/* Other services */}
        {otherServices.length > 0 && (
          <div className="mt-16 border-t border-border/60 pt-12">
            <h2 className="mb-6 text-xl font-semibold">Autres actes</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {otherServices.map((s) => (
                <Link
                  key={s.id}
                  href={`/actes/${s.slug}`}
                  className="group rounded-xl border border-border/60 bg-card p-5 transition hover:shadow-md"
                >
                  <h3 className="font-semibold group-hover:text-primary">
                    {s.title}
                  </h3>
                  {s.shortDescription && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {s.shortDescription}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
