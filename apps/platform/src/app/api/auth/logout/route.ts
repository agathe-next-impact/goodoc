import { NextResponse } from 'next/server'

import { PAYLOAD_TOKEN_COOKIE } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.redirect(
    new URL(
      '/login',
      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002',
    ),
    { status: 303 },
  )
  response.cookies.set({
    name: PAYLOAD_TOKEN_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
    ...(process.env.AUTH_COOKIE_DOMAIN
      ? { domain: process.env.AUTH_COOKIE_DOMAIN }
      : {}),
  })
  return response
}
