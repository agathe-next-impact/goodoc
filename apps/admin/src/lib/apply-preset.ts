import type { DbClient } from '@medsite/db'
import { pages } from '@medsite/db'
import {
  buildPresetPages,
  registerBuiltInTemplates,
} from '@medsite/templates'
import { and, eq } from 'drizzle-orm'

registerBuiltInTemplates()

export type ApplyPresetMode = 'skip' | 'overwrite'

export type ApplyPresetResult = {
  templateId: string
  created: string[]
  overwritten: string[]
  skipped: string[]
}

/**
 * Applies a template's canonical page presets to a tenant. Each preset
 * becomes one row in `pages`, with `content` set to the section array —
 * the exact shape `SectionRenderer` expects.
 *
 * - `mode: 'skip'` (default): existing pages with the same slug are left
 *   untouched. Safe for post-onboarding template switches.
 * - `mode: 'overwrite'`: replaces `content` and `title` on existing pages.
 *   Use only with explicit practitioner confirmation.
 */
export async function applyTemplatePreset(
  client: DbClient,
  input: {
    tenantId: string
    templateId: string
    mode?: ApplyPresetMode
  },
): Promise<ApplyPresetResult> {
  const descriptors = buildPresetPages(input.templateId)
  const mode = input.mode ?? 'skip'

  const existing = await client
    .select({ slug: pages.slug })
    .from(pages)
    .where(eq(pages.tenantId, input.tenantId))
  const existingSlugs = new Set(existing.map((p) => p.slug))

  const created: string[] = []
  const overwritten: string[] = []
  const skipped: string[] = []

  for (const descriptor of descriptors) {
    if (existingSlugs.has(descriptor.slug)) {
      if (mode === 'overwrite') {
        await client
          .update(pages)
          .set({
            title: descriptor.title,
            pageType: descriptor.pageType as never,
            content: descriptor.content,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(pages.tenantId, input.tenantId),
              eq(pages.slug, descriptor.slug),
            ),
          )
        overwritten.push(descriptor.slug)
      } else {
        skipped.push(descriptor.slug)
      }
      continue
    }

    await client.insert(pages).values({
      tenantId: input.tenantId,
      title: descriptor.title,
      slug: descriptor.slug,
      pageType: descriptor.pageType as never,
      content: descriptor.content,
      isPublished: true,
      isDraft: false,
      publishedAt: new Date(),
      sortOrder: descriptor.sortOrder,
    })
    created.push(descriptor.slug)
  }

  return {
    templateId: input.templateId,
    created,
    overwritten,
    skipped,
  }
}
