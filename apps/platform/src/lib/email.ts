import 'server-only'

import { createEmailClient, createEmailService, type EmailService } from '@medsite/email'

let cached: EmailService | null = null

/**
 * Lazy email service. Returns `null` when `RESEND_API_KEY` is missing so
 * dev environments without a Resend account don't crash on the support
 * form — the route handler returns a clear error in that case instead.
 */
export function emailService(): EmailService | null {
  if (cached) return cached
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  cached = createEmailService(createEmailClient(key))
  return cached
}
