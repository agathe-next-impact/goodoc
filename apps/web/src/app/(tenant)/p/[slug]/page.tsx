import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import {
  registerBuiltInBlocks,
  registerBuiltInTemplates,
  SectionRenderer,
  type SectionNode,
} from '@medsite/templates'

import { getPageDraftBySlug, getPublishedPageBySlug } from '@/lib/queries'
import { getTenantOrNull } from '@/lib/tenant'

// Idempotent: ESM caching makes the double call here a no-op after the first
// request. Kept explicit so that this route is self-sufficient and doesn't
// rely on another module having imported the barrels first.
registerBuiltInBlocks()
registerBuiltInTemplates()

type RouteProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const tenant = await getTenantOrNull()
  if (!tenant) return {}
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const page = isDraft
    ? await getPageDraftBySlug(tenant.tenant.id, slug)
    : await getPublishedPageBySlug(tenant.tenant.id, slug)
  if (!page) return {}
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
    robots: isDraft ? { index: false, follow: false } : undefined,
  }
}

export default async function DynamicPage({ params }: RouteProps) {
  const tenant = await getTenantOrNull()
  if (!tenant) notFound()

  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const page = isDraft
    ? await getPageDraftBySlug(tenant.tenant.id, slug)
    : await getPublishedPageBySlug(tenant.tenant.id, slug)
  if (!page) notFound()

  const sections = normalizeSections(page.content)

  return <SectionRenderer sections={sections} />
}

function normalizeSections(raw: unknown): SectionNode[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    if (item && typeof item === 'object' && 'blockType' in item) {
      return [item as SectionNode]
    }
    return []
  })
}
