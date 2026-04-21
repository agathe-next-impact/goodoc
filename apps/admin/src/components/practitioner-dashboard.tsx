'use client'

import type React from 'react'

/**
 * Custom dashboard component for practitioners.
 * Replaces the default Payload dashboard with a simplified view.
 * Rendered via Payload's `afterDashboard` component slot.
 */
export const PractitionerDashboard: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      {/* Welcome card */}
      <div
        style={{
          background: 'var(--theme-elevation-50)',
          borderRadius: '8px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          Bienvenue sur votre espace MedSite
        </h2>
        <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>
          Gérez votre site professionnel en quelques clics.
        </p>
      </div>

      {/* Quick actions grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <ActionCard
          title="Modifier ma page d'accueil"
          description="Personnalisez le contenu visible par vos patients."
          href="/admin/collections/pages"
        />
        <ActionCard
          title="Ajouter un acte"
          description="Décrivez un nouvel acte ou une prestation."
          href="/admin/collections/services/create"
        />
        <ActionCard
          title="Écrire un article"
          description="Publiez un article de blog pour votre référencement."
          href="/admin/collections/blog-posts/create"
        />
        <ActionCard
          title="Voir mes messages"
          description="Consultez les messages de vos patients."
          href="/admin/collections/contact-messages"
        />
      </div>

      {/* Status cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatusCard label="Mon profil" href="/admin/collections/practitioners" />
        <StatusCard label="Réglages du site" href="/admin/globals/site-settings" />
        <StatusCard label="Mes images" href="/admin/collections/media" />
        <StatusCard label="FAQ" href="/admin/collections/faq-items" />
      </div>
    </div>
  )
}

function ActionCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        padding: '1.25rem',
        background: 'var(--theme-elevation-100)',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background 0.15s',
      }}
    >
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
        {title}
      </h3>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', opacity: 0.7 }}>
        {description}
      </p>
    </a>
  )
}

function StatusCard({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'var(--theme-elevation-50)',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'background 0.15s',
      }}
    >
      {label}
    </a>
  )
}
