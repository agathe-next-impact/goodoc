import { EmailLayout } from './layout'

interface NewContactMessageEmailProps {
  practitionerName: string
  senderName: string
  senderEmail: string
  senderPhone?: string
  subject?: string
  messagePreview: string
  dashboardUrl: string
}

export function NewContactMessageEmail({
  practitionerName,
  senderName,
  senderEmail,
  senderPhone,
  subject,
  messagePreview,
  dashboardUrl,
}: NewContactMessageEmailProps) {
  return (
    <EmailLayout previewText={`Nouveau message de ${senderName}`}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#18181b', margin: '0 0 16px' }}>
        Nouveau message reçu
      </h1>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 16px' }}>
        Bonjour {practitionerName},
      </p>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 24px' }}>
        Vous avez reçu un nouveau message via le formulaire de contact de votre site.
      </p>

      <div style={{
        backgroundColor: '#f4f4f5',
        borderRadius: 8,
        padding: '20px 24px',
        margin: '0 0 24px',
      }}>
        <p style={{ fontSize: 14, color: '#71717a', margin: '0 0 4px' }}>De</p>
        <p style={{ fontSize: 16, color: '#18181b', fontWeight: 600, margin: '0 0 12px' }}>
          {senderName} ({senderEmail})
          {senderPhone && <span> — {senderPhone}</span>}
        </p>
        {subject && (
          <>
            <p style={{ fontSize: 14, color: '#71717a', margin: '0 0 4px' }}>Objet</p>
            <p style={{ fontSize: 16, color: '#18181b', margin: '0 0 12px' }}>{subject}</p>
          </>
        )}
        <p style={{ fontSize: 14, color: '#71717a', margin: '0 0 4px' }}>Message</p>
        <p style={{ fontSize: 15, color: '#3f3f46', lineHeight: '24px', margin: 0 }}>
          {messagePreview}
        </p>
      </div>

      <div style={{ textAlign: 'center' as const, margin: '32px 0 0' }}>
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
          Voir et répondre
        </a>
      </div>
    </EmailLayout>
  )
}
