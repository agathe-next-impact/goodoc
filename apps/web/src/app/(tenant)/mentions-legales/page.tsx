import type { Metadata } from 'next'

import {
  JsonLd,
  buildBreadcrumbItems,
  generateBreadcrumbJsonLd,
} from '@medsite/seo'

import { getTenant } from '@/lib/tenant'
import { buildSiteUrl } from '@/lib/seo-helpers'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Mentions légales',
    robots: { index: false, follow: false },
  }
}

export default async function LegalPage() {
  const tenant = await getTenant()
  const { siteSettings, practitioner, primaryAddress } = tenant
  const siteUrl = buildSiteUrl(tenant)

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    buildBreadcrumbItems(siteUrl, {
      name: 'Mentions légales',
      path: '/mentions-legales',
    }),
  )

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <section className="container mx-auto px-6 py-16">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
          Mentions légales
        </h1>

        {siteSettings?.legalMentions ? (
          <div className="prose max-w-prose whitespace-pre-wrap text-foreground/80">
            {siteSettings.legalMentions}
          </div>
        ) : (
          <div className="max-w-prose space-y-6 text-foreground/80">
            <div>
              <h2 className="text-lg font-semibold">Éditeur du site</h2>
              <p>
                {practitioner.title ? `${practitioner.title} ` : ''}
                {practitioner.firstName} {practitioner.lastName}
                <br />
                {practitioner.specialty}
                {practitioner.adeliRpps && (
                  <>
                    <br />
                    N° RPPS / ADELI : {practitioner.adeliRpps}
                  </>
                )}
                {primaryAddress && (
                  <>
                    <br />
                    {primaryAddress.streetAddress}, {primaryAddress.postalCode}{' '}
                    {primaryAddress.city}
                  </>
                )}
                {practitioner.phoneNumber && (
                  <>
                    <br />
                    Tél : {practitioner.phoneNumber}
                  </>
                )}
                {practitioner.email && (
                  <>
                    <br />
                    Email : {practitioner.email}
                  </>
                )}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Hébergement</h2>
              <p>
                Ce site est hébergé par MedSite (medsite.fr), plateforme de
                sites web pour professionnels de santé.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Propriété intellectuelle
              </h2>
              <p>
                L&apos;ensemble des contenus de ce site (textes, images,
                photographies) est la propriété de l&apos;éditeur sauf mention
                contraire. Toute reproduction est interdite sans autorisation
                préalable.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
