import { NextResponse } from 'next/server'
import { z } from 'zod'

import { emailService } from '@/lib/email'
import { getPractitionerSession } from '@/lib/get-tenant'

const SUPPORT_ADDRESS = 'support@medsite.fr'

const InputSchema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
})

export async function POST(request: Request) {
  const session = await getPractitionerSession()

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = InputSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Sujet et message sont requis.' },
      { status: 422 },
    )
  }

  const email = emailService()
  if (!email) {
    return NextResponse.json(
      { error: 'Service email indisponible. Contactez-nous par téléphone.' },
      { status: 503 },
    )
  }

  const result = await email.sendSupportRequest(SUPPORT_ADDRESS, {
    practitionerName: session.user.name ?? session.user.email,
    practitionerEmail: session.user.email,
    tenantName: session.tenant.name,
    tenantSlug: session.tenant.slug,
    planName: session.plan?.displayName ?? '—',
    subject: parsed.data.subject,
    message: parsed.data.message,
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? 'Échec de l\'envoi.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
