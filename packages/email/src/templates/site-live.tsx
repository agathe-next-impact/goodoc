import { EmailLayout } from './layout'

interface SiteLiveEmailProps {
  name: string
  siteUrl: string
  dashboardUrl: string
}

export function SiteLiveEmail({ name, siteUrl, dashboardUrl }: SiteLiveEmailProps) {
  return (
    <EmailLayout previewText="Votre site est en ligne !">
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#18181b', margin: '0 0 16px' }}>
        Votre site est en ligne !
      </h1>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 16px' }}>
        Félicitations {name},
      </p>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 24px' }}>
        Votre site professionnel est maintenant accessible à l&apos;adresse suivante :
      </p>
      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <a
          href={siteUrl}
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1B3A5C',
            textDecoration: 'underline',
          }}
        >
          {siteUrl}
        </a>
      </div>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 24px' }}>
        Vous pouvez modifier votre contenu, ajouter des actes et gérer vos
        messages depuis votre espace de gestion.
      </p>
      <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <a
          href={dashboardUrl}
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
          Accéder à mon espace
        </a>
      </div>
    </EmailLayout>
  )
}
