import type { Resend } from 'resend'
import type { ReactElement } from 'react'

const FROM_ADDRESS = 'MedSite <noreply@medsite.fr>'

export function createEmailService(resend: Resend) {
  async function send(
    to: string,
    subject: string,
    react: ReactElement,
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const result = await resend.emails.send({
        from: FROM_ADDRESS,
        to,
        subject,
        react,
      })

      if (result.error) {
        return { success: false, error: result.error.message }
      }
      return { success: true, id: result.data?.id }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  }

  return {
    sendWelcome: (to: string, name: string, onboardingUrl: string) =>
      import('./templates/welcome').then(({ WelcomeEmail }) =>
        send(to, `Bienvenue sur MedSite, ${name} !`, WelcomeEmail({ name, onboardingUrl })),
      ),

    sendSiteLive: (to: string, name: string, siteUrl: string, dashboardUrl: string) =>
      import('./templates/site-live').then(({ SiteLiveEmail }) =>
        send(to, 'Votre site est en ligne !', SiteLiveEmail({ name, siteUrl, dashboardUrl })),
      ),

    sendNewContactMessage: (
      to: string,
      props: {
        practitionerName: string
        senderName: string
        senderEmail: string
        senderPhone?: string
        subject?: string
        messagePreview: string
        dashboardUrl: string
      },
    ) =>
      import('./templates/new-contact-message').then(({ NewContactMessageEmail }) =>
        send(
          to,
          `Nouveau message de ${props.senderName}`,
          NewContactMessageEmail(props),
        ),
      ),

    sendTrialExpiring: (to: string, name: string, daysLeft: number, upgradeUrl: string) =>
      import('./templates/trial-expiring').then(({ TrialExpiringEmail }) =>
        send(
          to,
          `Votre essai expire dans ${daysLeft} jours`,
          TrialExpiringEmail({ name, daysLeft, upgradeUrl }),
        ),
      ),

    sendPaymentFailed: (
      to: string,
      name: string,
      level: 'gentle' | 'urgent' | 'final',
      updatePaymentUrl: string,
    ) =>
      import('./templates/payment-failed').then(({ PaymentFailedEmail }) => {
        const subjects = {
          gentle: 'Un problème avec votre paiement',
          urgent: 'Action requise : paiement en attente',
          final: 'Dernier avis : risque de suspension de votre site',
        }
        return send(to, subjects[level], PaymentFailedEmail({ name, level, updatePaymentUrl }))
      }),

    sendSiteSuspended: (to: string, name: string, reactivateUrl: string) =>
      import('./templates/site-suspended').then(({ SiteSuspendedEmail }) =>
        send(
          to,
          'Votre site a été mis hors ligne',
          SiteSuspendedEmail({ name, reactivateUrl }),
        ),
      ),

    sendSupportRequest: (
      to: string,
      props: {
        practitionerName: string
        practitionerEmail: string
        tenantName: string
        tenantSlug: string
        planName: string
        subject: string
        message: string
      },
    ) =>
      import('./templates/support-request').then(({ SupportRequestEmail }) =>
        send(
          to,
          `[Support] ${props.subject} — ${props.tenantName}`,
          SupportRequestEmail(props),
        ),
      ),
  }
}

export type EmailService = ReturnType<typeof createEmailService>
