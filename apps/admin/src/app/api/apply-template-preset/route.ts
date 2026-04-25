import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { z } from 'zod'

import { applyTemplatePreset } from '@/lib/apply-preset'
import { db } from '@/lib/db'

/**
 * POST /api/apply-template-preset
 *
 * Called from the admin panel after a practitioner picks (or changes) the
 * site template. Writes the canonical preset into `pages`. Only the
 * authenticated practitioner's own tenant can be modified — super-admins
 * may pass an explicit `tenantId` to target another tenant.
 */
const bodySchema = z.object({
  templateId: z.string().min(1),
  mode: z.enum(['skip', 'overwrite']).optional(),
  tenantId: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({
    headers: request.headers,
  })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Practitioners can only touch their own tenant. Super-admins may target
  // any tenant by passing `tenantId` explicitly.
  const isSuperAdmin =
    (user as { role?: string }).role === 'super-admin'
  const scopedTenantId = (user as { tenantId?: string }).tenantId
  const targetTenantId = parsed.data.tenantId ?? scopedTenantId

  if (!targetTenantId) {
    return NextResponse.json(
      { error: 'No tenant in scope for this user' },
      { status: 403 },
    )
  }
  if (!isSuperAdmin && parsed.data.tenantId && parsed.data.tenantId !== scopedTenantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const result = await applyTemplatePreset(db(), {
      tenantId: targetTenantId,
      templateId: parsed.data.templateId,
      ...(parsed.data.mode ? { mode: parsed.data.mode } : {}),
    })
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
