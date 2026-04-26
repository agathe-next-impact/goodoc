import { EmailLayout } from './layout'

interface SupportRequestEmailProps {
  practitionerName: string
  practitionerEmail: string
  tenantName: string
  tenantSlug: string
  planName: string
  subject: string
  message: string
}

export function SupportRequestEmail({
  practitionerName,
  practitionerEmail,
  tenantName,
  tenantSlug,
  planName,
  subject,
  message,
}: SupportRequestEmailProps) {
  return (
    <EmailLayout previewText={`Demande de support — ${subject}`}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#18181b', margin: '0 0 16px' }}>
        Nouvelle demande de support
      </h1>
      <div style={{
        backgroundColor: '#f4f4f5',
        borderRadius: 8,
        padding: '20px 24px',
        margin: '0 0 24px',
      }}>
        <p style={{ fontSize: 14, color: '#71717a', margin: '0 0 4px' }}>De</p>
        <p style={{ fontSize: 16, color: '#18181b', fontWeight: 600, margin: '0 0 12px' }}>
          {practitionerName} ({practitionerEmail})
        </p>
        <p style={{ fontSize: 14, color: '#71717a', margin: '0 0 4px' }}>Cabinet</p>
        <p style={{ fontSize: 16, color: '#18181b', margin: '0 0 12px' }}>
          {tenantName} ({tenantSlug}) — plan {planName}
        </p>
        <p style={{ fontSize: 14, color: '#71717a', margin: '0 0 4px' }}>Objet</p>
        <p style={{ fontSize: 16, color: '#18181b', margin: '0 0 12px' }}>{subject}</p>
        <p style={{ fontSize: 14, color: '#71717a', margin: '0 0 4px' }}>Message</p>
        <p style={{ fontSize: 15, color: '#3f3f46', lineHeight: '24px', margin: 0, whiteSpace: 'pre-wrap' }}>
          {message}
        </p>
      </div>
    </EmailLayout>
  )
}
