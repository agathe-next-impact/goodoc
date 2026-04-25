'use client'

import {
  familyPractice,
  medicalClassic,
  minimalPro,
  modernClinic,
  warmWellness,
  type TemplateDefinition,
} from '@medsite/templates'
import { useState, type CSSProperties } from 'react'

import {
  Badge,
  Button,
  Card,
  Grid,
  Section,
  Shell,
} from './dashboard/_primitives'

/**
 * Dashboard panel listing the 5 site templates with restrained, sober
 * preview cards. Picking one POSTs to /api/apply-template-preset; the
 * authenticated practitioner is automatically scoped to their tenant.
 */
const templates: TemplateDefinition[] = [
  medicalClassic,
  warmWellness,
  modernClinic,
  minimalPro,
  familyPractice,
]

type Status =
  | { kind: 'idle' }
  | { kind: 'pending'; templateId: string }
  | {
      kind: 'done'
      templateId: string
      created: string[]
      overwritten: string[]
      skipped: string[]
    }
  | { kind: 'error'; templateId: string; message: string }

export function TemplateGallery() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [mode, setMode] = useState<'skip' | 'overwrite'>('skip')

  async function apply(templateId: string) {
    setStatus({ kind: 'pending', templateId })
    try {
      const res = await fetch('/api/apply-template-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, mode }),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(
          typeof body?.error === 'string' ? body.error : `Erreur ${res.status}`,
        )
      }
      setStatus({
        kind: 'done',
        templateId,
        created: body.created ?? [],
        overwritten: body.overwritten ?? [],
        skipped: body.skipped ?? [],
      })
    } catch (err) {
      setStatus({
        kind: 'error',
        templateId,
        message: err instanceof Error ? err.message : 'Erreur inconnue',
      })
    }
  }

  return (
    <Shell>
      <Section
        eyebrow="Apparence"
        title="Modèles de site"
        description="Choisissez la palette et la composition qui correspondent à votre pratique. Vos contenus existants sont préservés sauf en mode écrasement."
        actions={
          <fieldset style={modeFieldsetStyle}>
            <ModeRadio value="skip" current={mode} onChange={setMode} label="Préserver" />
            <ModeRadio value="overwrite" current={mode} onChange={setMode} label="Écraser" />
          </fieldset>
        }
      >
        <Grid minCol="280px">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onApply={() => apply(t.id)}
              status={
                status.kind !== 'idle' && status.templateId === t.id
                  ? status
                  : { kind: 'idle' }
              }
            />
          ))}
        </Grid>
      </Section>
    </Shell>
  )
}

function TemplateCard({
  template,
  onApply,
  status,
}: {
  template: TemplateDefinition
  onApply: () => void
  status: Status
}) {
  const { primary, accent, background, foreground } = template.theme.colors

  return (
    <Card padding="0" hoverable>
      <div
        aria-hidden
        style={{
          height: 140,
          position: 'relative',
          overflow: 'hidden',
          borderTopLeftRadius: '7px',
          borderTopRightRadius: '7px',
          background: `hsl(${background})`,
          color: `hsl(${foreground})`,
          fontFamily: template.theme.fonts.serif,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at top right, hsl(${primary} / 0.18), transparent 60%), radial-gradient(ellipse at bottom left, hsl(${accent} / 0.4), transparent 70%)`,
          }}
        />
        <div style={previewLayoutStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: template.theme.radius,
                background: `hsl(${primary})`,
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>
              {template.name}
            </span>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 18,
              right: 18,
              bottom: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Aperçu
            </span>
            <span
              style={{
                width: 80,
                height: 26,
                borderRadius: template.theme.radius,
                background: `hsl(${primary})`,
                color: `hsl(${template.theme.colors.primaryForeground})`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: template.theme.fonts.sans,
              }}
            >
              Prendre RDV
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.25rem 1.25rem 1.5rem' }}>
        <h3 style={cardTitleStyle}>{template.name}</h3>
        <p style={cardDescStyle}>{template.description}</p>

        <div style={{ marginTop: '1rem' }}>
          <Button
            onClick={onApply}
            disabled={status.kind === 'pending'}
            variant="primary"
            size="md"
          >
            {status.kind === 'pending' ? 'Application…' : 'Appliquer ce modèle'}
          </Button>
        </div>

        {status.kind === 'done' ? (
          <div style={{ marginTop: '0.75rem' }}>
            <Badge tone="success">
              {status.created.length} créée(s) · {status.overwritten.length}{' '}
              maj · {status.skipped.length} ignorée(s)
            </Badge>
          </div>
        ) : null}
        {status.kind === 'error' ? (
          <div style={{ marginTop: '0.75rem' }}>
            <Badge tone="error">{status.message}</Badge>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

function ModeRadio({
  value,
  current,
  onChange,
  label,
}: {
  value: 'skip' | 'overwrite'
  current: 'skip' | 'overwrite'
  onChange: (v: 'skip' | 'overwrite') => void
  label: string
}) {
  const active = current === value
  return (
    <label style={modeRadioStyle(active)}>
      <input
        type="radio"
        name="tg-mode"
        value={value}
        checked={active}
        onChange={() => onChange(value)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      {label}
    </label>
  )
}

const modeFieldsetStyle: CSSProperties = {
  border: '1px solid var(--theme-elevation-200)',
  borderRadius: '999px',
  padding: '3px',
  display: 'inline-flex',
  gap: '2px',
  margin: 0,
}

function modeRadioStyle(active: boolean): CSSProperties {
  return {
    position: 'relative',
    padding: '0.375rem 0.875rem',
    borderRadius: '999px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    background: active ? 'var(--theme-text)' : 'transparent',
    color: active ? 'var(--theme-bg)' : 'var(--theme-text)',
    transition: 'background 0.15s, color 0.15s',
  }
}

const previewLayoutStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  padding: '1rem 1.125rem',
  display: 'flex',
  flexDirection: 'column',
}

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  letterSpacing: '-0.01em',
}

const cardDescStyle: CSSProperties = {
  margin: '0.375rem 0 0',
  fontSize: '0.8125rem',
  opacity: 0.7,
  lineHeight: 1.5,
  minHeight: '2.5rem',
}
