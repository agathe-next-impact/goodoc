import { EmailLayout } from './layout'

interface TrialExpiringEmailProps {
  name: string
  daysLeft: number
  upgradeUrl: string
}

export function TrialExpiringEmail({ name, daysLeft, upgradeUrl }: TrialExpiringEmailProps) {
  return (
    <EmailLayout previewText={`Votre essai expire dans ${daysLeft} jours`}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#18181b', margin: '0 0 16px' }}>
        Votre essai gratuit expire bientôt
      </h1>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 16px' }}>
        Bonjour {name},
      </p>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 24px' }}>
        Votre essai gratuit MedSite expire dans <strong>{daysLeft} jour{daysLeft > 1 ? 's' : ''}</strong>.
        Pour continuer à utiliser votre site professionnel sans interruption,
        choisissez votre formule dès maintenant.
      </p>
      <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <a
          href={upgradeUrl}
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
          Choisir ma formule
        </a>
      </div>
      <p style={{ fontSize: 14, color: '#71717a', lineHeight: '22px', margin: 0 }}>
        Si vous ne souscrivez pas d&apos;abonnement, votre site sera temporairement
        mis hors ligne à la fin de la période d&apos;essai. Vos données seront
        conservées pendant 30 jours.
      </p>
    </EmailLayout>
  )
}
