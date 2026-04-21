import type { ReactNode } from 'react'

interface EmailLayoutProps {
  children: ReactNode
  previewText?: string
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: '#f4f4f5', padding: '40px 0' }}>
      {previewText && (
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
          {previewText}
        </div>
      )}

      {/* Header */}
      <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' as const, padding: '0 20px 24px' }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#1B3A5C', letterSpacing: '-0.5px' }}>
          MedSite
        </span>
      </div>

      {/* Body */}
      <div style={{
        maxWidth: 580,
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: '32px 40px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{
        maxWidth: 580,
        margin: '24px auto 0',
        textAlign: 'center' as const,
        padding: '0 20px',
        fontSize: 12,
        color: '#71717a',
        lineHeight: '20px',
      }}>
        <p style={{ margin: 0 }}>
          MedSite — Plateforme de sites web pour professionnels de santé
        </p>
        <p style={{ margin: '4px 0 0' }}>
          <a href="https://medsite.fr" style={{ color: '#71717a' }}>medsite.fr</a>
          {' | '}
          <a href="https://medsite.fr/mentions-legales" style={{ color: '#71717a' }}>
            Mentions légales
          </a>
        </p>
      </div>
    </div>
  )
}
