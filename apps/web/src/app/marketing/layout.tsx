import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: {
    default: 'MedSite — Sites web pour professionnels de santé',
    template: '%s | MedSite',
  },
  description:
    'La plateforme SaaS qui crée votre site web de praticien en quelques minutes.',
}

export default function MarketingLayout({
  children,
}: {
  children: ReactNode
}) {
  return <div className="flex min-h-screen flex-col">{children}</div>
}
