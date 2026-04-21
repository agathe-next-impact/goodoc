import type { BookingMode } from '@medsite/types'

export interface BookingPractitioner {
  doctolibUrl?: string | null
  alternativeBookingUrl?: string | null
  phoneNumber?: string | null
  bookingMode: BookingMode
  ctaLabel?: string | null
}

export type BookingContext = 'hero' | 'header' | 'service' | 'sticky' | 'footer'
export type BookingVariant = 'primary' | 'secondary' | 'outline'
export type BookingSize = 'sm' | 'md' | 'lg'
