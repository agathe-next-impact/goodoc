import { NextResponse } from 'next/server'
import { z } from 'zod'

import { signup, SignupError } from '@/lib/signup'

/**
 * POST /api/auth/signup
 *
 * Provisions a tenant + practitioner user. Public endpoint — guard against
 * abuse upstream (e.g. Vercel rate limiting, Cloudflare WAF). Body is
 * validated with Zod; everything beyond is delegated to `signup()`.
 *
 * Returns 201 with `{ userId, tenantId, practitionerId }` on success.
 */

const slugRegex = /^[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?$/

const bodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(slugRegex, 'slug must be lowercase alphanumeric with optional hyphens'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  specialty: z.string().min(1).max(100),
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
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const result = await signup(parsed.data)
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof SignupError) {
      const status = err.code === 'EMAIL_TAKEN' || err.code === 'SLUG_TAKEN' ? 409 : 400
      return NextResponse.json({ error: err.message, code: err.code }, { status })
    }
    console.error('[signup] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
