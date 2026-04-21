/**
 * @medsite/doctolib — Doctolib integration: widget, CTA, fallback logic.
 * No Doctolib API exists — integration via iframe widget + CTA buttons only.
 */

// Types
export type {
  BookingContext,
  BookingPractitioner,
  BookingSize,
  BookingVariant,
} from './types'

// Utilities
export {
  buildDoctolibMotifUrl,
  buildDoctolibWidgetUrl,
  extractDoctolibSlug,
  resolveBookingMode,
} from './utils'

// Components
export { BookingCta } from './components/booking-cta'
export { BookingSection } from './components/booking-section'
export { DoctolibWidget } from './components/doctolib-widget'
export { StickyBookingBar } from './components/sticky-booking-bar'

// Hooks
export { useDoctolibStatus } from './hooks/use-doctolib-status'

// Server Actions
export { checkDoctolibUrl } from './actions/check-doctolib'
