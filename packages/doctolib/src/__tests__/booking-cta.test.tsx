import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { BookingCta } from '../components/booking-cta'
import {
  alternativePractitioner,
  contactNoPhonePractitioner,
  contactPractitioner,
  doctolibPractitioner,
  doctolibWithCustomLabel,
} from './fixtures'

afterEach(() => {
  cleanup()
})

describe('BookingCta', () => {
  // ── Doctolib mode ───────────────────────────────────────────

  describe('doctolib mode', () => {
    it('renders a link to doctolib URL in hero context', () => {
      render(
        <BookingCta practitioner={doctolibPractitioner} context="hero" />,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute(
        'href',
        'https://www.doctolib.fr/osteopathe/aurillac/jean-dupont',
      )
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('shows service name in label for service context', () => {
      render(
        <BookingCta
          practitioner={doctolibPractitioner}
          context="service"
          serviceName="Ostéopathie sportive"
        />,
      )
      expect(screen.getByRole('link')).toHaveTextContent(
        'Prendre RDV pour Ostéopathie sportive',
      )
    })

    it('shows "Prendre RDV" in header context', () => {
      render(
        <BookingCta practitioner={doctolibPractitioner} context="header" />,
      )
      expect(screen.getByRole('link')).toHaveTextContent('Prendre RDV')
    })

    it('shows "RDV" in sticky context', () => {
      render(
        <BookingCta practitioner={doctolibPractitioner} context="sticky" />,
      )
      expect(screen.getByRole('link')).toHaveTextContent('RDV')
    })

    it('appends motif slug when provided', () => {
      render(
        <BookingCta
          practitioner={doctolibPractitioner}
          context="service"
          doctolibMotifSlug="consultation"
        />,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute(
        'href',
        'https://www.doctolib.fr/osteopathe/aurillac/jean-dupont?motif=consultation',
      )
    })

    it('uses custom CTA label when provided', () => {
      render(
        <BookingCta practitioner={doctolibWithCustomLabel} context="hero" />,
      )
      expect(screen.getByRole('link')).toHaveTextContent(
        'Consulter maintenant',
      )
    })

    it('has accessible aria-label', () => {
      render(
        <BookingCta practitioner={doctolibPractitioner} context="hero" />,
      )
      expect(screen.getByRole('link')).toHaveAttribute(
        'aria-label',
        'Prendre rendez-vous sur Doctolib',
      )
    })

    it('has contextual aria-label with service name', () => {
      render(
        <BookingCta
          practitioner={doctolibPractitioner}
          context="service"
          serviceName="Bilan postural"
        />,
      )
      expect(screen.getByRole('link')).toHaveAttribute(
        'aria-label',
        'Prendre rendez-vous sur Doctolib pour Bilan postural',
      )
    })
  })

  // ── Alternative mode ────────────────────────────────────────

  describe('alternative mode', () => {
    it('renders a link to alternative booking URL', () => {
      render(
        <BookingCta practitioner={alternativePractitioner} context="hero" />,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'https://cal.com/sophie-dupont')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('shows correct label', () => {
      render(
        <BookingCta practitioner={alternativePractitioner} context="hero" />,
      )
      expect(screen.getByRole('link')).toHaveTextContent('Prendre RDV')
    })
  })

  // ── Contact mode ────────────────────────────────────────────

  describe('contact mode', () => {
    it('renders "Me contacter" in hero context', () => {
      render(
        <BookingCta practitioner={contactPractitioner} context="hero" />,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveTextContent('Me contacter')
      expect(link).toHaveAttribute('href', '/contact')
    })

    it('renders "Contactez-moi" in header context', () => {
      render(
        <BookingCta practitioner={contactPractitioner} context="header" />,
      )
      expect(screen.getByRole('link')).toHaveTextContent('Contactez-moi')
    })

    it('links to /contact with motif when service provided', () => {
      render(
        <BookingCta
          practitioner={contactPractitioner}
          context="service"
          serviceName="Massage relaxant"
        />,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute(
        'href',
        '/contact?motif=Massage%20relaxant',
      )
    })

    it('renders tel: link in sticky context with phone number', () => {
      render(
        <BookingCta practitioner={contactPractitioner} context="sticky" />,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'tel:0612345678')
      expect(link).toHaveTextContent('Appeler')
    })

    it('falls back to /contact in sticky context without phone', () => {
      render(
        <BookingCta
          practitioner={contactNoPhonePractitioner}
          context="sticky"
        />,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/contact')
    })

    it('does not set target=_blank for internal links', () => {
      render(
        <BookingCta practitioner={contactPractitioner} context="hero" />,
      )
      expect(screen.getByRole('link')).not.toHaveAttribute('target')
    })
  })

  // ── Variants and sizes ──────────────────────────────────────

  describe('variants and sizes', () => {
    it('applies primary variant classes by default', () => {
      render(
        <BookingCta practitioner={doctolibPractitioner} context="hero" />,
      )
      const link = screen.getByRole('link')
      expect(link.className).toContain('bg-primary')
    })

    it('applies outline variant classes', () => {
      render(
        <BookingCta
          practitioner={doctolibPractitioner}
          context="hero"
          variant="outline"
        />,
      )
      const link = screen.getByRole('link')
      expect(link.className).toContain('border-primary')
    })

    it('applies lg size classes', () => {
      render(
        <BookingCta
          practitioner={doctolibPractitioner}
          context="hero"
          size="lg"
        />,
      )
      const link = screen.getByRole('link')
      expect(link.className).toContain('px-6')
    })

    it('applies custom className', () => {
      render(
        <BookingCta
          practitioner={doctolibPractitioner}
          context="hero"
          className="my-custom-class"
        />,
      )
      const link = screen.getByRole('link')
      expect(link.className).toContain('my-custom-class')
    })
  })
})
