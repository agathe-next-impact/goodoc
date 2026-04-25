import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/exit-preview?redirect=<path>
 *
 * Disables Next.js draft mode and returns the user to the live (published)
 * version. Called either from the floating "Exit preview" button rendered
 * by `next/draft-mode` or by a custom UI in Payload.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const redirect = url.searchParams.get('redirect') ?? '/'
  const safeRedirect = redirect.startsWith('/') ? redirect : '/'

  const draft = await draftMode()
  draft.disable()

  return NextResponse.redirect(new URL(safeRedirect, request.url))
}
