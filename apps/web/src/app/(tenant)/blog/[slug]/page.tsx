import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  JsonLd,
  buildBreadcrumbItems,
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
} from '@medsite/seo'
import type { BlogPostSEOData } from '@medsite/seo'

import { getTenant } from '@/lib/tenant'
import { getBlogPostBySlug, getPublishedBlogPosts } from '@/lib/queries'
import { buildSiteUrl, toTenantSEOData } from '@/lib/seo-helpers'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tenant = await getTenant()
  const post = await getBlogPostBySlug(tenant.tenant.id, slug)
  if (!post) return { title: 'Article non trouvé' }

  const seoData = toTenantSEOData(tenant)
  const postSeo: BlogPostSEOData = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? undefined,
    coverImageUrl: post.coverImageUrl ?? undefined,
    category: post.category ?? undefined,
    publishedAt: post.publishedAt?.toISOString() ?? new Date().toISOString(),
    metaTitle: post.metaTitle ?? undefined,
    metaDescription: post.metaDescription ?? undefined,
  }
  const meta = generatePageMetadata({
    tenant: seoData,
    page: 'blog_post',
    blogPost: postSeo,
  })
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    alternates: meta.alternates,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tenant = await getTenant()
  const post = await getBlogPostBySlug(tenant.tenant.id, slug)
  if (!post) notFound()

  const { practitioner } = tenant
  const seoData = toTenantSEOData(tenant)
  const siteUrl = buildSiteUrl(tenant)

  const postSeo: BlogPostSEOData = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? undefined,
    coverImageUrl: post.coverImageUrl ?? undefined,
    category: post.category ?? undefined,
    publishedAt: post.publishedAt?.toISOString() ?? new Date().toISOString(),
    modifiedAt: post.updatedAt?.toISOString() ?? undefined,
  }

  const articleJsonLd = generateArticleJsonLd(seoData, postSeo)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    buildBreadcrumbItems(
      siteUrl,
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: `/blog/${post.slug}` },
    ),
  )

  // Related posts
  const allPosts = await getPublishedBlogPosts(tenant.tenant.id, 4)
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 3)

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <article className="container mx-auto px-6 py-16">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span>{post.title}</span>
        </nav>

        {post.category && (
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            {post.category}
          </span>
        )}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            Par {practitioner.title ? `${practitioner.title} ` : ''}
            {practitioner.firstName} {practitioner.lastName}
          </span>
          {post.publishedAt && (
            <>
              <span>·</span>
              <time dateTime={new Date(post.publishedAt).toISOString()}>
                {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </>
          )}
        </div>

        {post.coverImageUrl && (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            width={1200}
            height={630}
            className="mt-8 aspect-[2/1] w-full rounded-xl object-cover"
            priority
          />
        )}

        <div className="prose mx-auto mt-8 max-w-prose">
          {post.excerpt && (
            <p className="lead text-lg text-muted-foreground">{post.excerpt}</p>
          )}
          {/* Rich text content will be rendered via a Lexical renderer */}
          {post.content && (
            <p className="text-foreground/80">Contenu de l&apos;article.</p>
          )}
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 border-t border-border/60 pt-12">
            <h2 className="mb-6 text-xl font-semibold">Articles connexes</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {relatedPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group rounded-xl border border-border/60 bg-card p-5 transition hover:shadow-md"
                >
                  <h3 className="font-semibold group-hover:text-primary line-clamp-2">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {p.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  )
}
