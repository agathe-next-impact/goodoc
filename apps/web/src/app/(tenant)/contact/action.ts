'use server'

import { contactMessages } from '@medsite/db'
import { z } from 'zod'

import { db } from '@/lib/db'

const contactSchema = z.object({
  tenantId: z.string().uuid(),
  senderName: z.string().min(2, 'Le nom est requis.').max(200),
  senderEmail: z.string().email('Email invalide.'),
  senderPhone: z.string().max(20).optional().default(''),
  subject: z.string().max(300).optional().default(''),
  message: z.string().min(10, 'Le message est trop court.').max(5000),
  motif: z.string().max(100).optional().default(''),
  // Honeypot
  website: z.string().max(0, 'Spam détecté.').optional().default(''),
})

export type ContactFormState = {
  success: boolean
  error?: string
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    tenantId: formData.get('tenantId'),
    senderName: formData.get('senderName'),
    senderEmail: formData.get('senderEmail'),
    senderPhone: formData.get('senderPhone') ?? '',
    subject: formData.get('subject') ?? '',
    message: formData.get('message'),
    motif: formData.get('motif') ?? '',
    website: formData.get('website') ?? '',
  }

  const result = contactSchema.safeParse(raw)
  if (!result.success) {
    const firstError = result.error.errors[0]?.message ?? 'Données invalides.'
    return { success: false, error: firstError }
  }

  const { website: _honeypot, ...data } = result.data

  try {
    await db().insert(contactMessages).values({
      tenantId: data.tenantId,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      senderPhone: data.senderPhone || null,
      subject: data.subject || null,
      message: data.message,
      motif: data.motif || null,
      status: 'new',
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }
  }
}
