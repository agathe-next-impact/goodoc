import { NextResponse, type NextRequest } from 'next/server'

import { PAYLOAD_TOKEN_COOKIE, verifyPayloadJwt } from './lib/auth'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isPublic(pathname)) return NextResponse.next()

  const token = req.cookies.get(PAYLOAD_TOKEN_COOKIE)?.value
  const secret = process.env.PAYLOAD_SECRET

  if (!token || !secret) {
    return redirectToLogin(req)
  }

  const decoded = await verifyPayloadJwt(token, secret)
  if (!decoded) {
    return redirectToLogin(req)
  }

  // Forward identity to RSCs without trusting client-supplied headers.
  const reqHeaders = new Headers(req.headers)
  reqHeaders.set('x-user-id', decoded.id)
  reqHeaders.set('x-user-collection', decoded.collection)

  return NextResponse.next({ request: { headers: reqHeaders } })
}

function redirectToLogin(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.search = ''
  const next = req.nextUrl.pathname + req.nextUrl.search
  if (next && next !== '/login') {
    url.searchParams.set('next', next)
  }
  return NextResponse.redirect(url)
}

export const config = {
  // Skip Next internals + static assets. Everything else is gated.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
