import Link from 'next/link'

import type { Tenant } from '@/lib/tenant-types'

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/actes', label: 'Actes' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
] as const

export function SiteHeader({ tenant }: { tenant: Tenant }) {
  const { practitioner, tenant: core } = tenant
  const displayName = `${practitioner.title ? practitioner.title + ' ' : ''}${practitioner.firstName} ${practitioner.lastName}`

  return (
    <header className="border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-lg font-semibold tracking-tight">{displayName}</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {practitioner.specialty}
          </span>
        </Link>
        <nav aria-label="Navigation principale">
          <ul className="flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-foreground/70 transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {practitioner.ctaLabel ?? 'Prendre rendez-vous'}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      {core.status === 'trial' ? (
        <div className="bg-amber-100 px-6 py-1 text-center text-xs text-amber-900">
          Site en période d&apos;essai
        </div>
      ) : null}
    </header>
  )
}
