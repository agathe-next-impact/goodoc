import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

import {
  JsonLd,
  buildBreadcrumbItems,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
} from '@medsite/seo'

import { getTenant } from '@/lib/tenant'
import { getPublishedBlogPosts } from '@/lib/queries'
import { buildSiteUrl, toTenantSEOData } from '@/lib/seo-helpers'

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant()
  const seoData = toTenantSEOData(tenant)
  const meta = generatePageMetadata({ tenant: seoData, page: 'blog_index' })
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    alternates: meta.alternates,
  }
}

export default async function BlogIndexPage() {
  const tenant = await getTenant()
  const posts = await getPublishedBlogPosts(tenant.tenant.id)
  const siteUrl = buildSiteUrl(tenant)

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    buildBreadcrumbItems(siteUrl, { name: 'Blog', path: '/blog' }),
  )

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <section className="container mx-auto px-6 py-16">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">
          Blog
        </h1>

        {posts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition hover:shadow-md"
              >
                {post.coverImageUrl && (
                  <Image
                    src={post.coverImageUrl}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="aspect-[3/2] w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {post.category && (
                    <span className="text-xs font-medium uppercase tracking-wider text-primary">
                      {post.category}
                    </span>
                  )}
                  <h2 className="text-lg font-semibold group-hover:text-primary line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  {post.publishedAt && (
                    <time
                      dateTime={new Date(post.publishedAt).toISOString()}
                      className="mt-auto pt-2 text-xs text-muted-foreground"
                    >
                      {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Les articles apparaîtront ici quand le blog sera activé.
          </p>
        )}
      </section>
    </>
  )
}
