'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@medsite/ui'

import type { BookingPractitioner } from '../types'
import { BookingCta } from './booking-cta'

interface StickyBookingBarProps {
  practitioner: BookingPractitioner
  className?: string
}

export function StickyBookingBar({
  practitioner,
  className,
}: StickyBookingBarProps) {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY
      setVisible(currentY <= 0 || currentY < lastScrollY.current)
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isContactMode = practitioner.bookingMode === 'contact'

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 backdrop-blur-sm transition-transform duration-300 md:hidden',
        visible ? 'translate-y-0' : 'translate-y-full',
        className,
      )}
      role="complementary"
      aria-label="Barre de prise de rendez-vous"
    >
      {isContactMode ? (
        <div className="flex gap-2">
          {practitioner.phoneNumber && (
            <BookingCta
              practitioner={practitioner}
              context="sticky"
              variant="primary"
              size="md"
              className="flex-1"
            />
          )}
          <a
            href="/contact"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            aria-label="Envoyer un message via le formulaire de contact"
          >
            Écrire
          </a>
        </div>
      ) : (
        <BookingCta
          practitioner={practitioner}
          context="sticky"
          variant="primary"
          size="md"
          className="w-full"
        />
      )}
    </div>
  )
}
