import type { BookingPractitioner } from '../types'

export const doctolibPractitioner: BookingPractitioner = {
  doctolibUrl: 'https://www.doctolib.fr/osteopathe/aurillac/jean-dupont',
  phoneNumber: '04 71 48 00 00',
  bookingMode: 'doctolib',
}

export const alternativePractitioner: BookingPractitioner = {
  alternativeBookingUrl: 'https://cal.com/sophie-dupont',
  phoneNumber: '04 72 00 00 00',
  bookingMode: 'alternative',
}

export const contactPractitioner: BookingPractitioner = {
  phoneNumber: '06 12 34 56 78',
  bookingMode: 'contact',
}

export const contactNoPhonePractitioner: BookingPractitioner = {
  bookingMode: 'contact',
}

export const doctolibWithCustomLabel: BookingPractitioner = {
  doctolibUrl: 'https://www.doctolib.fr/cardiologue/paris/dr-martin',
  phoneNumber: '01 42 00 00 00',
  bookingMode: 'doctolib',
  ctaLabel: 'Consulter maintenant',
}
