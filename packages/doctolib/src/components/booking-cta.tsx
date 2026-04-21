'use client'

import { cn } from '@medsite/ui'

import type {
  BookingContext,
  BookingPractitioner,
  BookingSize,
  BookingVariant,
} from '../types'
import { buildDoctolibMotifUrl } from '../utils'

interface BookingCtaProps {
  practitioner: BookingPractitioner
  context: BookingContext
  serviceName?: string
  doctolibMotifSlug?: string
  className?: string
  variant?: BookingVariant
  size?: BookingSize
}

const SIZE_CLASSES: Record<BookingSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const VARIANT_CLASSES: Record<BookingVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline:
    'border border-primary text-primary hover:bg-primary/10',
}

export function BookingCta({
  practitioner,
  context,
  serviceName,
  doctolibMotifSlug,
  className,
  variant = 'primary',
  size = 'md',
}: BookingCtaProps) {
  const { href, label, ariaLabel, isExternal } = resolveCtaConfig(
    practitioner,
    context,
    serviceName,
    doctolibMotifSlug,
  )

  const isTelLink = href.startsWith('tel:')

  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      )}
      aria-label={ariaLabel}
      {...(isExternal && !isTelLink
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {label}
    </a>
  )
}

function resolveCtaConfig(
  practitioner: BookingPractitioner,
  context: BookingContext,
  serviceName?: string,
  doctolibMotifSlug?: string,
): { href: string; label: string; ariaLabel: string; isExternal: boolean } {
  const { bookingMode } = practitioner

  if (bookingMode === 'doctolib' && practitioner.doctolibUrl) {
    const baseUrl = practitioner.doctolibUrl
    const href = doctolibMotifSlug
      ? buildDoctolibMotifUrl(baseUrl, doctolibMotifSlug)
      : baseUrl

    return {
      href,
      label: resolveLabel(context, serviceName, practitioner.ctaLabel, 'rdv'),
      ariaLabel: serviceName
        ? `Prendre rendez-vous sur Doctolib pour ${serviceName}`
        : 'Prendre rendez-vous sur Doctolib',
      isExternal: true,
    }
  }

  if (bookingMode === 'alternative' && practitioner.alternativeBookingUrl) {
    return {
      href: practitioner.alternativeBookingUrl,
      label: resolveLabel(context, serviceName, practitioner.ctaLabel, 'rdv'),
      ariaLabel: serviceName
        ? `Prendre rendez-vous en ligne pour ${serviceName}`
        : 'Prendre rendez-vous en ligne',
      isExternal: true,
    }
  }

  // Contact fallback
  if (context === 'sticky' && practitioner.phoneNumber) {
    return {
      href: `tel:${practitioner.phoneNumber.replace(/\s/g, '')}`,
      label: 'Appeler',
      ariaLabel: `Appeler le ${practitioner.phoneNumber}`,
      isExternal: false,
    }
  }

  const contactHref = serviceName
    ? `/contact?motif=${encodeURIComponent(serviceName)}`
    : '/contact'

  return {
    href: contactHref,
    label: resolveLabel(context, serviceName, practitioner.ctaLabel, 'contact'),
    ariaLabel: serviceName
      ? `Nous contacter pour ${serviceName}`
      : 'Nous contacter',
    isExternal: false,
  }
}

function resolveLabel(
  context: BookingContext,
  serviceName: string | undefined,
  customLabel: string | null | undefined,
  mode: 'rdv' | 'contact',
): string {
  if (customLabel) return customLabel

  if (mode === 'contact') {
    switch (context) {
      case 'hero':
        return 'Me contacter'
      case 'header':
        return 'Contactez-moi'
      case 'service':
        return serviceName ? `Prendre RDV pour ${serviceName}` : 'Prendre RDV'
      case 'sticky':
        return 'Appeler'
      case 'footer':
        return 'Contactez-moi'
    }
  }

  switch (context) {
    case 'hero':
    case 'service':
      return serviceName ? `Prendre RDV pour ${serviceName}` : 'Prendre RDV'
    case 'header':
      return 'Prendre RDV'
    case 'sticky':
      return 'RDV'
    case 'footer':
      return 'Prendre RDV'
  }
}
