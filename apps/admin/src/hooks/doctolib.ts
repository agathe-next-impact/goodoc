import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Extracts the Doctolib slug from the practitioner's Doctolib URL.
 */
export const extractDoctolibSlugHook: CollectionBeforeChangeHook = ({
  data,
}) => {
  if (!data) return data

  if (data.doctolibUrl) {
    try {
      const url = new URL(data.doctolibUrl)
      if (url.hostname.endsWith('doctolib.fr')) {
        const parts = url.pathname.split('/').filter(Boolean)
        data.doctolibSlug = parts.at(-1) ?? null
      }
    } catch {
      data.doctolibSlug = null
    }
  } else {
    data.doctolibSlug = null
  }

  return data
}

/**
 * Computes bookingMode from the available booking URLs.
 */
export const computeBookingModeHook: CollectionBeforeChangeHook = ({
  data,
}) => {
  if (!data) return data

  if (data.doctolibUrl) {
    data.bookingMode = 'doctolib'
  } else if (data.alternativeBookingUrl) {
    data.bookingMode = 'alternative'
  } else {
    data.bookingMode = 'contact'
  }

  return data
}
