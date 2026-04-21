import { z } from 'zod'

// ── Non-DB shared types ──────────────────────────────────────────
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * Branded UUID v7 string.
 */
export type UUID = string & { readonly __brand: 'UUID' }

export const uuidSchema = z
  .string()
  .uuid()
  .transform((value) => value as UUID)

/**
 * Tenant identifier — present on every multi-tenant entity.
 */
export const tenantIdSchema = uuidSchema
export type TenantId = z.infer<typeof tenantIdSchema>

/**
 * Booking mode — mirrors the `booking_mode` PG enum.
 * The *runtime* fallback ('none' when nothing is configured) is
 * computed by `@medsite/doctolib#resolveBookingMode`.
 */
export const bookingModeSchema = z.enum(['doctolib', 'alternative', 'contact'])
export type BookingMode = z.infer<typeof bookingModeSchema>

// ── Table row + Zod schemas re-exported from @medsite/db ─────────
export * from './schemas'
