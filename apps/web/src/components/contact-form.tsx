'use client'

import { useActionState } from 'react'

import { submitContactForm, type ContactFormState } from '@/app/(tenant)/contact/action'

const initialState: ContactFormState = { success: false }

export function ContactForm({ tenantId }: { tenantId: string }) {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState,
  )

  if (state.success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
        <p className="font-semibold">Message envoyé !</p>
        <p className="mt-1 text-sm">
          Nous avons bien reçu votre message et vous répondrons dans les
          meilleurs délais.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="tenantId" value={tenantId} />

      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Ne pas remplir</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="senderName" className="mb-1 block text-sm font-medium">
          Nom *
        </label>
        <input
          id="senderName"
          name="senderName"
          type="text"
          required
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Votre nom"
        />
      </div>

      <div>
        <label htmlFor="senderEmail" className="mb-1 block text-sm font-medium">
          Email *
        </label>
        <input
          id="senderEmail"
          name="senderEmail"
          type="email"
          required
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="votre@email.fr"
        />
      </div>

      <div>
        <label htmlFor="senderPhone" className="mb-1 block text-sm font-medium">
          Téléphone
        </label>
        <input
          id="senderPhone"
          name="senderPhone"
          type="tel"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="06 12 34 56 78"
        />
      </div>

      <div>
        <label htmlFor="motif" className="mb-1 block text-sm font-medium">
          Motif
        </label>
        <select
          id="motif"
          name="motif"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Choisir un motif</option>
          <option value="rendez-vous">Prise de rendez-vous</option>
          <option value="information">Demande d&apos;information</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Votre message..."
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? 'Envoi en cours...' : 'Envoyer'}
      </button>
    </form>
  )
}
