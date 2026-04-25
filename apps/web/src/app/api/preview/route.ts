import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

import { timingSafeEqual } from '@/lib/preview-secret'

/**
 * GET /api/preview?secret=<token>&slug=<slug>
 *
 * Entry point used by Payload Live Preview. Validates the secret, enables
 * Next.js draft mode (which sets a `__prerender_bypass` cookie), then
 * redirects to `/p/<slug>` so the route reads the draft version. The
 * endpoint is reachable from any origin — the only auth is the shared
 * secret, so guard `PREVIEW_SECRET` carefully.
 */
export async function GET(request: Request) {
  const secret = process.env.PREVIEW_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'Preview not configured (PREVIEW_SECRET missing)' },
      { status: 500 },
    )
  }

  const url = new URL(request.url)
  const provided = url.searchParams.get('secret')
  const slug = url.searchParams.get('slug')

  if (!provided || !timingSafeEqual(provided, secret)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  if (!slug || !/^[a-z0-9-]{1,200}$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const draft = await draftMode()
  draft.enable()

  return NextResponse.redirect(new URL(`/p/${slug}`, request.url))
}
