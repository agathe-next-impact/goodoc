'use client'

import type { CSSProperties } from 'react'

import {
  Card,
  Eyebrow,
  Grid,
  HeroSubtitle,
  HeroTitle,
  HoverStyles,
  Section,
  Shell,
} from './dashboard/_primitives'

/**
 * Custom dashboard rendered above Payload's default. Visually inspired by a
 * sober premium dashboard layout: hero with restrained typography, fine
 * borders, subtle hover states, no flashy colors. Adapts to Payload's
 * light / dark theme via `--theme-*` CSS variables.
 */
export function PractitionerDashboard() {
  return (
    <Shell>
      <HoverStyles />

      <header>
        <Eyebrow>Espace praticien</Eyebrow>
        <HeroTitle>Pilotez votre site MedSite.</HeroTitle>
        <HeroSubtitle>
          Éditez vos pages, gérez vos rendez-vous et personnalisez l&apos;apparence
          de votre site professionnel — sans toucher au code.
        </HeroSubtitle>
      </header>

      <Section
        eyebrow="Actions rapides"
        title="Que souhaitez-vous faire ?"
        description="Les tâches les plus courantes, accessibles en un clic."
      >
        <Grid minCol="260px">
          <ActionCard
            title="Modifier ma page d&rsquo;accueil"
            description="Personnalisez le contenu visible par vos patients."
            href="/admin/collections/pages"
            cta="Ouvrir l&rsquo;éditeur"
          />
          <ActionCard
            title="Ajouter un acte"
            description="Décrivez un nouvel acte ou une prestation médicale."
            href="/admin/collections/services/create"
            cta="Nouveau service"
          />
          <ActionCard
            title="Écrire un article"
            description="Publiez un article pour améliorer votre référencement."
            href="/admin/collections/blog-posts/create"
            cta="Rédiger"
          />
          <ActionCard
            title="Voir mes messages"
            description="Consultez les messages reçus via votre formulaire."
            href="/admin/collections/contact-messages"
            cta="Boîte de réception"
          />
        </Grid>
      </Section>

      <Section
        eyebrow="Mon site"
        title="Configuration"
        description="Identité, contenu et apparence — toutes les briques de votre site sous la main."
      >
        <Grid minCol="200px">
          <StatusCard label="Mon profil" href="/admin/collections/practitioners" />
          <StatusCard label="Réglages du site" href="/admin/globals/site-settings" />
          <StatusCard label="Bibliothèque média" href="/admin/collections/media" />
          <StatusCard label="Témoignages" href="/admin/collections/testimonials" />
          <StatusCard label="FAQ" href="/admin/collections/faq-items" />
          <StatusCard label="Horaires" href="/admin/collections/opening-hours" />
        </Grid>
      </Section>
    </Shell>
  )
}

function ActionCard({
  title,
  description,
  href,
  cta,
}: {
  title: string
  description: string
  href: string
  cta: string
}) {
  return (
    <Card href={href} hoverable>
      <h3 style={actionTitleStyle}>{title}</h3>
      <p style={actionDescStyle}>{description}</p>
      <span style={ctaStyle}>
        {cta}
        <span aria-hidden>→</span>
      </span>
    </Card>
  )
}

function StatusCard({ label, href }: { label: string; href: string }) {
  return (
    <Card href={href} hoverable padding="1.125rem 1.25rem">
      <span style={statusLabelStyle}>{label}</span>
    </Card>
  )
}

const actionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  letterSpacing: '-0.01em',
}

const actionDescStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  opacity: 0.65,
  lineHeight: 1.5,
}

const ctaStyle: CSSProperties = {
  marginTop: '0.5rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.8125rem',
  fontWeight: 600,
  opacity: 0.85,
}

const statusLabelStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 500,
}
