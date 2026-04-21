import { EmailLayout } from './layout'

interface SiteSuspendedEmailProps {
  name: string
  reactivateUrl: string
}

export function SiteSuspendedEmail({ name, reactivateUrl }: SiteSuspendedEmailProps) {
  return (
    <EmailLayout previewText="Votre site a été mis hors ligne">
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', margin: '0 0 16px' }}>
        Votre site a été mis hors ligne
      </h1>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 16px' }}>
        Bonjour {name},
      </p>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 24px' }}>
        Votre site MedSite a été temporairement mis hors ligne en raison d&apos;un
        problème avec votre abonnement. Vos données sont conservées et votre
        site peut être remis en ligne immédiatement après régularisation.
      </p>
      <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <a
          href={reactivateUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#1B3A5C',
            color: '#ffffff',
            padding: '14px 32px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Réactiver mon site
        </a>
      </div>
      <p style={{ fontSize: 14, color: '#71717a', lineHeight: '22px', margin: 0 }}>
        Vos données seront conservées pendant 30 jours. Passé ce délai,
        elles pourront être supprimées.
      </p>
    </EmailLayout>
  )
}
