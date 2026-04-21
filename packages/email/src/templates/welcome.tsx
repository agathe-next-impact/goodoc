import { EmailLayout } from './layout'

interface WelcomeEmailProps {
  name: string
  onboardingUrl: string
}

export function WelcomeEmail({ name, onboardingUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout previewText={`Bienvenue sur MedSite, ${name} !`}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#18181b', margin: '0 0 16px' }}>
        Bienvenue sur MedSite !
      </h1>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 16px' }}>
        Bonjour {name},
      </p>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 24px' }}>
        Votre compte a été créé avec succès. Vous pouvez dès maintenant
        configurer votre site professionnel en quelques minutes.
      </p>
      <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <a
          href={onboardingUrl}
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
          Configurer mon site
        </a>
      </div>
      <p style={{ fontSize: 14, color: '#71717a', lineHeight: '22px', margin: 0 }}>
        Votre essai gratuit de 14 jours commence maintenant. Aucun moyen de
        paiement n&apos;est requis pendant la période d&apos;essai.
      </p>
    </EmailLayout>
  )
}
