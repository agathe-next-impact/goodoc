import { Resend } from 'resend'

/**
 * Creates a Resend client bound to an API key.
 */
export function createEmailClient(apiKey: string): Resend {
  return new Resend(apiKey)
}

// Email sending service
export { createEmailService } from './send'
export type { EmailService } from './send'

// Templates (for preview/testing)
export { WelcomeEmail } from './templates/welcome'
export { SiteLiveEmail } from './templates/site-live'
export { NewContactMessageEmail } from './templates/new-contact-message'
export { TrialExpiringEmail } from './templates/trial-expiring'
export { PaymentFailedEmail } from './templates/payment-failed'
export { SiteSuspendedEmail } from './templates/site-suspended'
export { SupportRequestEmail } from './templates/support-request'
