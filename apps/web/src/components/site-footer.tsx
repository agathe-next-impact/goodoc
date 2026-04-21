import Link from 'next/link'

import type { Tenant } from '@/lib/tenant-types'

export function SiteFooter({ tenant }: { tenant: Tenant }) {
  const { practitioner, primaryAddress, siteSettings } = tenant

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container mx-auto grid gap-8 px-6 py-12 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            {practitioner.firstName} {practitioner.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{practitioner.specialty}</p>
          {practitioner.adeliRpps ? (
            <p className="text-xs text-muted-foreground">
              RPPS / ADELI : {practitioner.adeliRpps}
            </p>
          ) : null}
        </div>

        {primaryAddress ? (
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>{primaryAddress.streetAddress}</p>
            <p>
              {primaryAddress.postalCode} {primaryAddress.city}
            </p>
            {practitioner.phoneNumber ? (
              <a href={`tel:${practitioner.phoneNumber}`}>
                {practitioner.phoneNumber}
              </a>
            ) : null}
          </div>
        ) : null}

        <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">
            Contact
          </Link>
          <Link href="/mentions-legales" className="text-muted-foreground hover:text-foreground">
            Mentions légales
          </Link>
          <Link href="/politique-de-confidentialite" className="text-muted-foreground hover:text-foreground">
            Confidentialité
          </Link>
          {siteSettings?.googleBusinessUrl ? (
            <a
              href={siteSettings.googleBusinessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              Avis Google
            </a>
          ) : null}
        </nav>
      </div>
      <div className="border-t border-border/60 px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {practitioner.firstName} {practitioner.lastName} —
        Site propulsé par{' '}
        <a
          href="https://medsite.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          MedSite
        </a>
      </div>
    </footer>
  )
}
