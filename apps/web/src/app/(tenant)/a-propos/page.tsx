import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import {
  JsonLd,
  buildBreadcrumbItems,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generatePractitionerJsonLd,
} from '@medsite/seo'

import { getTenant } from '@/lib/tenant'
import { buildSiteUrl, toTenantSEOData } from '@/lib/seo-helpers'

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant()
  const seoData = toTenantSEOData(tenant)
  const meta = generatePageMetadata({ tenant: seoData, page: 'about' })
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    alternates: meta.alternates,
  }
}

export default async function AboutPage() {
  const tenant = await getTenant()
  const { practitioner } = tenant
  const seoData = toTenantSEOData(tenant)
  const siteUrl = buildSiteUrl(tenant)

  const practitionerJsonLd = generatePractitionerJsonLd(seoData)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    buildBreadcrumbItems(siteUrl, { name: 'À propos', path: '/a-propos' }),
  )

  return (
    <>
      <JsonLd data={practitionerJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <section className="container mx-auto px-6 py-16">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
          À propos
        </h1>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
          {practitioner.photoUrl && (
            <Image
              src={practitioner.photoUrl}
              alt={`${practitioner.firstName} ${practitioner.lastName}`}
              width={300}
              height={400}
              className="flex-shrink-0 rounded-2xl object-cover shadow-md"
            />
          )}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold">
                {practitioner.title ? `${practitioner.title} ` : ''}
                {practitioner.firstName} {practitioner.lastName}
              </h2>
              <p className="text-muted-foreground">{practitioner.specialty}</p>
            </div>

            {practitioner.bio ? (
              <div className="max-w-prose whitespace-pre-wrap text-lg leading-relaxed text-foreground/80">
                {practitioner.bio}
              </div>
            ) : (
              <p className="text-muted-foreground">Présentation à venir.</p>
            )}

            {practitioner.adeliRpps && (
              <p className="text-sm text-muted-foreground">
                N° RPPS / ADELI : {practitioner.adeliRpps}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/rendez-vous"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {practitioner.ctaLabel ?? 'Prendre rendez-vous'}
          </Link>
        </div>
      </section>
    </>
  )
}
