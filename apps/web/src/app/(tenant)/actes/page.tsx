import type { Metadata } from 'next'
import Link from 'next/link'

import {
  JsonLd,
  buildBreadcrumbItems,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
} from '@medsite/seo'

import { getTenant } from '@/lib/tenant'
import { getPublishedServices } from '@/lib/queries'
import { buildSiteUrl, toTenantSEOData } from '@/lib/seo-helpers'

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant()
  const seoData = toTenantSEOData(tenant)
  const meta = generatePageMetadata({ tenant: seoData, page: 'home' })
  return {
    title: `Actes & prestations | ${meta.title}`,
    description: `Découvrez les actes proposés par ${tenant.practitioner.firstName} ${tenant.practitioner.lastName}, ${tenant.practitioner.specialty}.`,
  }
}

export default async function ServicesIndexPage() {
  const tenant = await getTenant()
  const servicesList = await getPublishedServices(tenant.tenant.id)
  const siteUrl = buildSiteUrl(tenant)

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    buildBreadcrumbItems(siteUrl, { name: 'Actes', path: '/actes' }),
  )

  // ItemList JSON-LD
  const itemListJsonLd = {
    '@context': 'https://schema.org' as const,
    '@type': 'ItemList' as const,
    'itemListElement': servicesList.map((s, i) => ({
      '@type': 'ListItem' as const,
      'position': i + 1,
      'name': s.title,
      'url': `${siteUrl}/actes/${s.slug}`,
    })),
  }

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={itemListJsonLd} />

      <section className="container mx-auto px-6 py-16">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
          Actes & prestations
        </h1>

        {servicesList.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicesList.map((service) => (
              <Link
                key={service.id}
                href={`/actes/${service.slug}`}
                className="group rounded-xl border border-border/60 bg-card p-6 transition hover:shadow-md"
              >
                <h2 className="text-lg font-semibold group-hover:text-primary">
                  {service.title}
                </h2>
                {service.shortDescription && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {service.shortDescription}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  {service.duration && <span>{service.duration} min</span>}
                  {service.showPrice && service.priceMin && (
                    <span>
                      {service.priceMax && service.priceMax !== service.priceMin
                        ? `${service.priceMin} – ${service.priceMax} €`
                        : `${service.priceMin} €`}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            La liste des actes sera bientôt disponible.
          </p>
        )}
      </section>
    </>
  )
}
