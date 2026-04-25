'use client'

import type { CSSProperties, ReactNode } from 'react'

/**
 * Shared primitives for the custom Payload dashboard. Inspired visually by a
 * sober premium dashboard layout (Aspect-like): generous spacing, fine
 * borders, restrained typography, subtle glow on interactive surfaces.
 *
 * No external code imported — only Payload's existing CSS variables
 * (`--theme-elevation-*`, `--theme-text`, `--theme-success-*`) so the look
 * adapts automatically to Payload's light/dark theme.
 */

// ── Layout ──────────────────────────────────────────────────────

export function Shell({ children }: { children: ReactNode }) {
  return <div style={shellStyle}>{children}</div>
}

export function Section({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section style={sectionStyle}>
      <header style={sectionHeaderStyle}>
        <div>
          {eyebrow ? <p style={eyebrowStyle}>{eyebrow}</p> : null}
          <h2 style={sectionTitleStyle}>{title}</h2>
          {description ? <p style={sectionDescStyle}>{description}</p> : null}
        </div>
        {actions ? <div style={{ flexShrink: 0 }}>{actions}</div> : null}
      </header>
      {children}
    </section>
  )
}

export function Grid({
  minCol = '260px',
  children,
}: {
  minCol?: string
  children: ReactNode
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCol}, 1fr))`,
        gap: '1rem',
      }}
    >
      {children}
    </div>
  )
}

// ── Cards ───────────────────────────────────────────────────────

export function Card({
  children,
  href,
  padding = '1.5rem',
  hoverable = false,
}: {
  children: ReactNode
  href?: string
  padding?: string
  hoverable?: boolean
}) {
  const style: CSSProperties = {
    ...cardBaseStyle,
    padding,
    cursor: href ? 'pointer' : 'default',
  }
  if (href) {
    return (
      <a
        href={href}
        style={{ ...style, textDecoration: 'none', color: 'inherit' }}
        className={hoverable || href ? 'medsite-card-hover' : undefined}
      >
        {children}
      </a>
    )
  }
  return (
    <div
      style={style}
      className={hoverable ? 'medsite-card-hover' : undefined}
    >
      {children}
    </div>
  )
}

// ── Typography ──────────────────────────────────────────────────

export function HeroTitle({ children }: { children: ReactNode }) {
  return <h1 style={heroTitleStyle}>{children}</h1>
}

export function HeroSubtitle({ children }: { children: ReactNode }) {
  return <p style={heroSubtitleStyle}>{children}</p>
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p style={eyebrowStyle}>{children}</p>
}

// ── Buttons ─────────────────────────────────────────────────────

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  href,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
  disabled?: boolean
  href?: string
}) {
  const style: CSSProperties = {
    ...buttonBaseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  }
  if (href) {
    return (
      <a href={href} style={{ ...style, textDecoration: 'none' }}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  )
}

// ── Inline status / badges ──────────────────────────────────────

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'success' | 'error'
  children: ReactNode
}) {
  return <span style={badgeStyles[tone]}>{children}</span>
}

// ── Hover style (injected once via global stylesheet) ───────────

export function HoverStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
.medsite-card-hover {
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}
.medsite-card-hover:hover {
  border-color: var(--theme-elevation-300, rgba(127,127,127,0.4));
  box-shadow: 0 8px 24px -12px var(--theme-elevation-300, rgba(0,0,0,0.18));
  transform: translateY(-1px);
}
`,
      }}
    />
  )
}

// ── Styles ──────────────────────────────────────────────────────

const shellStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  padding: '1rem 2rem 4rem',
  maxWidth: 1200,
  margin: '0 auto',
}

const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
}

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: '1.5rem',
  flexWrap: 'wrap',
}

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
}

const sectionDescStyle: CSSProperties = {
  margin: '0.375rem 0 0',
  fontSize: '0.875rem',
  opacity: 0.65,
  maxWidth: 640,
  lineHeight: 1.5,
}

const eyebrowStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.6875rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 600,
  opacity: 0.55,
  marginBottom: '0.5rem',
}

const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
  fontWeight: 600,
  letterSpacing: '-0.025em',
  lineHeight: 1.1,
}

const heroSubtitleStyle: CSSProperties = {
  margin: '1rem 0 0',
  fontSize: '1rem',
  opacity: 0.7,
  maxWidth: 640,
  lineHeight: 1.55,
}

const cardBaseStyle: CSSProperties = {
  background: 'var(--theme-elevation-50)',
  border: '1px solid var(--theme-elevation-100)',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  textDecoration: 'none',
  color: 'inherit',
}

const buttonBaseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  border: '1px solid transparent',
  borderRadius: '6px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.15s, border-color 0.15s, opacity 0.15s',
  fontFamily: 'inherit',
}

const sizeStyles: Record<'sm' | 'md', CSSProperties> = {
  sm: { padding: '0.375rem 0.75rem', fontSize: '0.8125rem' },
  md: { padding: '0.5rem 1.25rem', fontSize: '0.875rem' },
}

const variantStyles: Record<'primary' | 'secondary' | 'ghost', CSSProperties> = {
  primary: {
    background: 'var(--theme-text)',
    color: 'var(--theme-bg)',
    borderColor: 'var(--theme-text)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--theme-text)',
    borderColor: 'var(--theme-elevation-200)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--theme-text)',
    borderColor: 'transparent',
  },
}

const badgeStyles: Record<'neutral' | 'success' | 'error', CSSProperties> = {
  neutral: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 500,
    background: 'var(--theme-elevation-100)',
    color: 'var(--theme-text)',
  },
  success: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 500,
    background: 'var(--theme-success-100, rgba(22,163,74,0.12))',
    color: 'var(--theme-success-700, #15803d)',
  },
  error: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 500,
    background: 'var(--theme-error-100, rgba(185,28,28,0.12))',
    color: 'var(--theme-error-700, #b91c1c)',
  },
}
