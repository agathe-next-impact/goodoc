import { NextResponse } from 'next/server'
import { z } from 'zod'

import { PAYLOAD_TOKEN_COOKIE } from '@/lib/auth'

const InputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

interface PayloadLoginResponse {
  token?: string
  exp?: number
  user?: { id: string; email: string }
}

/**
 * Proxies the login to Payload's REST endpoint, then mints our own
 * `payload-token` cookie on the platform's domain. We don't trust the
 * `Set-Cookie` Payload returns: it may target a different host (admin)
 * and we want explicit control over the cookie attributes.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = InputSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Identifiants invalides.' }, { status: 400 })
  }

  const adminUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'

  const upstream = await fetch(`${adminUrl}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
    cache: 'no-store',
  }).catch(() => null)

  if (!upstream || !upstream.ok) {
    return NextResponse.json(
      { error: 'Identifiants invalides.' },
      { status: upstream?.status ?? 502 },
    )
  }

  const body = (await upstream.json()) as PayloadLoginResponse
  if (!body.token) {
    return NextResponse.json(
      { error: 'Réponse de connexion invalide.' },
      { status: 502 },
    )
  }

  const maxAge = body.exp
    ? Math.max(60, body.exp - Math.floor(Date.now() / 1000))
    : 60 * 60 * 24 * 2

  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: PAYLOAD_TOKEN_COOKIE,
    value: body.token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
    ...(process.env.AUTH_COOKIE_DOMAIN
      ? { domain: process.env.AUTH_COOKIE_DOMAIN }
      : {}),
  })
  return response
}
