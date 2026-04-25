'use client'

import { cn } from '@medsite/ui'
import { useState, type FormEvent, type ReactNode } from 'react'
import { z } from 'zod'

import { registerBlock } from '../registry'
import { Section, SectionHeader } from './_shared/section'

/**
 * Simple client-side contact form. Submits via `fetch` to `actionUrl` with
 * `application/x-www-form-urlencoded`. No patient health data is ever
 * collected here (RGPD) — only contact details and a free-text message.
 *
 * A server action equivalent lives in `apps/web/src/components/contact-form.tsx`
 * for the legacy hardcoded `/contact` page; this block is the generic
 * template-driven version and expects the tenant to wire `actionUrl` to a
 * POST endpoint that parses `FormData`.
 */
export const contactFormSchema = z.object({
  blockType: z.literal('contact-form'),
  id: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  actionUrl: z.string().min(1),
  successMessage: z.string().optional(),
  // Array stored as `[{ value }]` — matches Payload's array field shape.
  motifs: z.array(z.object({ value: z.string().min(1) })).optional(),
  showPhone: z.boolean().optional(),
  legalNotice: z.string().optional(),
})

export type ContactFormProps = z.infer<typeof contactFormSchema>

type Status = 'idle' | 'pending' | 'success' | 'error'

export function ContactForm({
  title = 'Nous contacter',
  subtitle,
  actionUrl,
  successMessage = 'Message envoyé — nous revenons vers vous rapidement.',
  motifs,
  showPhone = true,
  legalNotice,
}: ContactFormProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('pending')
    setErrorMessage(null)
    const formData = new FormData(event.currentTarget)
    try {
      const response = await fetch(actionUrl, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`)
      }
      setStatus('success')
      event.currentTarget.reset()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  if (status === 'success') {
    return (
      <Section>
        <div className="bg-accent text-accent-foreground mx-auto max-w-xl rounded-[var(--radius)] p-6 text-center">
          <p className="font-semibold">{successMessage}</p>
        </div>
      </Section>
    )
  }

  return (
    <Section>
      <div className="mx-auto max-w-xl">
        <SectionHeader title={title} subtitle={subtitle} align="center" />

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Honeypot — hidden from users */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="website">Site web (ne pas remplir)</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <Field id="senderName" label="Nom" required>
            <input
              id="senderName"
              name="senderName"
              type="text"
              required
              autoComplete="name"
              className={inputClass}
            />
          </Field>

          <Field id="senderEmail" label="Email" required>
            <input
              id="senderEmail"
              name="senderEmail"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
            />
          </Field>

          {showPhone ? (
            <Field id="senderPhone" label="Téléphone">
              <input
                id="senderPhone"
                name="senderPhone"
                type="tel"
                autoComplete="tel"
                className={inputClass}
              />
            </Field>
          ) : null}

          {motifs && motifs.length > 0 ? (
            <Field id="motif" label="Motif">
              <select id="motif" name="motif" className={inputClass}>
                <option value="">Choisir un motif</option>
                {motifs.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.value}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          <Field id="message" label="Message" required>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className={cn(inputClass, 'min-h-[120px] resize-y')}
            />
          </Field>

          {errorMessage ? (
            <p role="alert" className="text-destructive text-sm">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={status === 'pending'}
            className="bg-primary text-primary-foreground focus-visible:ring-ring hover:bg-primary/90 h-11 rounded-[var(--radius)] px-6 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {status === 'pending' ? 'Envoi…' : 'Envoyer'}
          </button>

          {legalNotice ? (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {legalNotice}
            </p>
          ) : null}
        </form>
      </div>
    </Section>
  )
}

const inputClass =
  'border-input bg-background focus-visible:ring-ring w-full rounded-[var(--radius)] border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2'

function Field({
  id,
  label,
  required = false,
  children,
}: {
  id: string
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {required ? <span aria-hidden className="text-destructive ml-0.5">*</span> : null}
      </label>
      {children}
    </div>
  )
}

registerBlock({
  blockType: 'contact-form',
  schema: contactFormSchema,
  Component: ContactForm,
})
