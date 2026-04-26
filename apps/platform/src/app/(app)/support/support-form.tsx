'use client'

import { useState, type FormEvent } from 'react'

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string }

export function SupportForm() {
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ kind: 'submitting' })
    const formData = new FormData(event.currentTarget)
    const subject = String(formData.get('subject') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()
    if (!subject || !message) {
      setState({ kind: 'error', message: 'Sujet et message sont requis.' })
      return
    }
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setState({
          kind: 'error',
          message: body.error ?? 'Échec de l\'envoi. Réessayez plus tard.',
        })
        return
      }
      setState({ kind: 'success' })
      event.currentTarget.reset()
    } catch {
      setState({ kind: 'error', message: 'Réseau indisponible.' })
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      aria-busy={state.kind === 'submitting'}
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Sujet</span>
        <input
          name="subject"
          required
          maxLength={200}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Message</span>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={5000}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state.kind === 'submitting'}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {state.kind === 'submitting' ? 'Envoi…' : 'Envoyer ma demande'}
        </button>
        {state.kind === 'success' ? (
          <p className="text-sm text-emerald-700" role="status">
            Demande envoyée. Nous revenons vers vous rapidement.
          </p>
        ) : null}
        {state.kind === 'error' ? (
          <p className="text-sm text-destructive" role="alert">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  )
}
