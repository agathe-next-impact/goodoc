import 'server-only'

import {
  blogPosts,
  faqItems,
  pages,
  services,
  testimonials,
} from '@medsite/db'
import { and, asc, desc, eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

import { db } from './db'

// ── Services ──────────────────────────────────────────────────────

export async function getPublishedServices(tenantId: string) {
  return unstable_cache(
    async () =>
      db()
        .select()
        .from(services)
        .where(and(eq(services.tenantId, tenantId), eq(services.isPublished, true)))
        .orderBy(asc(services.sortOrder)),
    ['services', tenantId],
    { tags: [`tenant:${tenantId}`, `services:${tenantId}`], revalidate: 3600 },
  )()
}

export async function getServiceBySlug(tenantId: string, slug: string) {
  return unstable_cache(
    async () => {
      const rows = await db()
        .select()
        .from(services)
        .where(
          and(
            eq(services.tenantId, tenantId),
            eq(services.slug, slug),
            eq(services.isPublished, true),
          ),
        )
        .limit(1)
      return rows[0] ?? null
    },
    ['service', tenantId, slug],
    { tags: [`tenant:${tenantId}`, `services:${tenantId}`], revalidate: 3600 },
  )()
}

// ── Blog Posts ─────────────────────────────────────────────────────

export async function getPublishedBlogPosts(
  tenantId: string,
  limit = 12,
  offset = 0,
) {
  return unstable_cache(
    async () =>
      db()
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.tenantId, tenantId), eq(blogPosts.isPublished, true)))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit)
        .offset(offset),
    ['blog-posts', tenantId, String(limit), String(offset)],
    { tags: [`tenant:${tenantId}`, `blog:${tenantId}`], revalidate: 3600 },
  )()
}

export async function getBlogPostBySlug(tenantId: string, slug: string) {
  return unstable_cache(
    async () => {
      const rows = await db()
        .select()
        .from(blogPosts)
        .where(
          and(
            eq(blogPosts.tenantId, tenantId),
            eq(blogPosts.slug, slug),
            eq(blogPosts.isPublished, true),
          ),
        )
        .limit(1)
      return rows[0] ?? null
    },
    ['blog-post', tenantId, slug],
    { tags: [`tenant:${tenantId}`, `blog:${tenantId}`], revalidate: 3600 },
  )()
}

// ── FAQ ───────────────────────────────────────────────────────────

export async function getPublishedFaqItems(tenantId: string) {
  return unstable_cache(
    async () =>
      db()
        .select()
        .from(faqItems)
        .where(and(eq(faqItems.tenantId, tenantId), eq(faqItems.isPublished, true)))
        .orderBy(asc(faqItems.sortOrder)),
    ['faq', tenantId],
    { tags: [`tenant:${tenantId}`], revalidate: 3600 },
  )()
}

// ── Pages (template-rendered) ─────────────────────────────────────

export async function getPublishedPageBySlug(tenantId: string, slug: string) {
  return unstable_cache(
    async () => {
      const rows = await db()
        .select()
        .from(pages)
        .where(
          and(
            eq(pages.tenantId, tenantId),
            eq(pages.slug, slug),
            eq(pages.isPublished, true),
          ),
        )
        .limit(1)
      return rows[0] ?? null
    },
    ['page', tenantId, slug],
    { tags: [`tenant:${tenantId}`, `pages:${tenantId}`], revalidate: 3600 },
  )()
}

// ── Testimonials ──────────────────────────────────────────────────

export async function getPublishedTestimonials(tenantId: string, limit = 6) {
  return unstable_cache(
    async () =>
      db()
        .select()
        .from(testimonials)
        .where(
          and(
            eq(testimonials.tenantId, tenantId),
            eq(testimonials.isPublished, true),
          ),
        )
        .orderBy(desc(testimonials.publishedAt))
        .limit(limit),
    ['testimonials', tenantId],
    { tags: [`tenant:${tenantId}`], revalidate: 3600 },
  )()
}
