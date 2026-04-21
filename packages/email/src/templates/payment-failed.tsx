import { EmailLayout } from './layout'

interface PaymentFailedEmailProps {
  name: string
  level: 'gentle' | 'urgent' | 'final'
  updatePaymentUrl: string
}

const MESSAGES: Record<'gentle' | 'urgent' | 'final', { subject: string; body: string }> = {
  gentle: {
    subject: 'Un problème avec votre paiement',
    body: 'Votre dernier paiement n\'a pas pu être traité. Cela peut arriver si votre carte a expiré ou si votre banque a refusé la transaction. Veuillez mettre à jour vos informations de paiement pour éviter toute interruption de service.',
  },
  urgent: {
    subject: 'Action requise : paiement en attente',
    body: 'Nous n\'avons toujours pas pu traiter votre paiement après plusieurs tentatives. Sans action de votre part, votre site sera temporairement mis hors ligne. Veuillez mettre à jour vos informations de paiement dans les plus brefs délais.',
  },
  final: {
    subject: 'Dernier avis : risque de suspension de votre site',
    body: 'Malgré plusieurs tentatives, votre paiement n\'a pas pu être traité. Votre site sera mis hors ligne sous 24 heures si nous ne recevons pas votre paiement. Mettez à jour vos informations de paiement immédiatement pour éviter la suspension.',
  },
}

export function PaymentFailedEmail({ name, level, updatePaymentUrl }: PaymentFailedEmailProps) {
  const msg = MESSAGES[level]

  return (
    <EmailLayout previewText={msg.subject}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: level === 'final' ? '#dc2626' : '#18181b', margin: '0 0 16px' }}>
        {msg.subject}
      </h1>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 16px' }}>
        Bonjour {name},
      </p>
      <p style={{ fontSize: 16, color: '#3f3f46', lineHeight: '26px', margin: '0 0 24px' }}>
        {msg.body}
      </p>
      <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <a
          href={updatePaymentUrl}
          style={{
            display: 'inline-block',
            backgroundColor: level === 'final' ? '#dc2626' : '#1B3A5C',
            color: '#ffffff',
            padding: '14px 32px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Mettre à jour mon paiement
        </a>
      </div>
    </EmailLayout>
  )
}
