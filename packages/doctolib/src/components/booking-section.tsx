'use client'

import { cn } from '@medsite/ui'

import type { BookingPractitioner } from '../types'
import { extractDoctolibSlug } from '../utils'
import { BookingCta } from './booking-cta'
import { DoctolibWidget } from './doctolib-widget'

interface BookingSectionProps {
  practitioner: BookingPractitioner
  openingHoursSummary?: string
  className?: string
}

export function BookingSection({
  practitioner,
  openingHoursSummary,
  className,
}: BookingSectionProps) {
  const isDoctolibMode =
    practitioner.bookingMode === 'doctolib' && practitioner.doctolibUrl
  const slug = isDoctolibMode
    ? extractDoctolibSlug(practitioner.doctolibUrl!)
    : null

  return (
    <section
      className={cn('py-12', className)}
      aria-labelledby="booking-heading"
    >
      <h2
        id="booking-heading"
        className="mb-8 text-center text-2xl font-bold tracking-tight"
      >
        Prendre rendez-vous
      </h2>

      {isDoctolibMode && slug ? (
        <div className="space-y-4">
          <DoctolibWidget slug={slug} />
          {practitioner.phoneNumber && (
            <p className="text-center text-sm text-muted-foreground">
              Ou appelez le{' '}
              <a
                href={`tel:${practitioner.phoneNumber.replace(/\s/g, '')}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {practitioner.phoneNumber}
              </a>
            </p>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-md space-y-6 text-center">
          <div className="flex justify-center gap-3">
            {practitioner.phoneNumber && (
              <a
                href={`tel:${practitioner.phoneNumber.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                aria-label={`Appeler le ${practitioner.phoneNumber}`}
              >
                Appeler
              </a>
            )}
            <BookingCta
              practitioner={{
                ...practitioner,
                bookingMode: 'contact',
              }}
              context="hero"
              variant={practitioner.phoneNumber ? 'outline' : 'primary'}
              size="lg"
            />
          </div>

          {practitioner.phoneNumber && (
            <div className="text-sm text-muted-foreground">
              <p>
                Ou prenez RDV par téléphone :{' '}
                <span className="font-medium text-foreground">
                  {practitioner.phoneNumber}
                </span>
              </p>
              {openingHoursSummary && <p>{openingHoursSummary}</p>}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
