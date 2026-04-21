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
    title: 'Politique de confidentialité',
    robots: { index: false, follow: false },
  }
}

export default async function PrivacyPolicyPage() {
  const tenant = await getTenant()
  const { siteSettings, practitioner } = tenant
  const siteUrl = buildSiteUrl(tenant)

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    buildBreadcrumbItems(siteUrl, {
      name: 'Politique de confidentialité',
      path: '/politique-de-confidentialite',
    }),
  )

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <section className="container mx-auto px-6 py-16">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
          Politique de confidentialité
        </h1>

        {siteSettings?.privacyPolicy ? (
          <div className="prose max-w-prose whitespace-pre-wrap text-foreground/80">
            {siteSettings.privacyPolicy}
          </div>
        ) : (
          <div className="max-w-prose space-y-6 text-foreground/80">
            <div>
              <h2 className="text-lg font-semibold">
                Collecte des données personnelles
              </h2>
              <p>
                Les données personnelles collectées via le formulaire de contact
                (nom, email, téléphone, message) sont utilisées uniquement pour
                répondre à votre demande. Elles ne sont ni vendues, ni
                transmises à des tiers.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Responsable du traitement</h2>
              <p>
                {practitioner.title ? `${practitioner.title} ` : ''}
                {practitioner.firstName} {practitioner.lastName}
                {practitioner.email && (
                  <>
                    {' '}
                    — Contact : {practitioner.email}
                  </>
                )}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Vos droits</h2>
              <p>
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
                de rectification et de suppression de vos données. Pour exercer
                ces droits, contactez-nous à l&apos;adresse indiquée ci-dessus.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Cookies</h2>
              <p>
                Ce site utilise uniquement des cookies strictement nécessaires à
                son fonctionnement. Aucun cookie publicitaire ou de suivi
                n&apos;est utilisé.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
