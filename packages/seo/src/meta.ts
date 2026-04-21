import { fullName } from './helpers'
import type { BlogPostSEOData, ServiceSEOData, TenantSEOData } from './types'

type PageKind = 'home' | 'about' | 'contact' | 'service' | 'blog_post' | 'blog_index'

interface PageMetadataParams {
  tenant: TenantSEOData
  page: PageKind
  service?: ServiceSEOData
  blogPost?: BlogPostSEOData
}

export interface PageMetadata {
  title: string
  description: string
  openGraph: {
    title: string
    description: string
    url: string
    siteName: string
    type: string
    locale: string
    images?: { url: string; alt: string }[]
  }
  twitter: {
    card: string
    title: string
    description: string
    images?: string[]
  }
  alternates: {
    canonical: string
  }
}

export function generatePageMetadata(params: PageMetadataParams): PageMetadata {
  const { tenant, page, service, blogPost } = params
  const name = fullName(tenant.practitioner)
  const specialty = tenant.practitioner.specialty
  const city = tenant.address.city

  const { title, description, path, ogType } = buildPageStrings(
    page,
    name,
    specialty,
    city,
    tenant.practitioner.businessName,
    service,
    blogPost,
  )

  const canonicalUrl = `${tenant.siteUrl}${path}`

  const image = resolveImage(page, tenant, service, blogPost)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: tenant.practitioner.businessName,
      type: ogType,
      locale: 'fr_FR',
      ...(image && {
        images: [{ url: image, alt: title }],
      }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image && { images: [image] }),
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

function buildPageStrings(
  page: PageKind,
  name: string,
  specialty: string,
  city: string,
  businessName: string,
  service?: ServiceSEOData,
  blogPost?: BlogPostSEOData,
): { title: string; description: string; path: string; ogType: string } {
  switch (page) {
    case 'home':
      return {
        title: `${businessName} — ${specialty} à ${city}`,
        description: `${name}, ${specialty} à ${city}. Prenez rendez-vous en ligne et découvrez nos services.`,
        path: '',
        ogType: 'website',
      }
    case 'about':
      return {
        title: `À propos de ${name} — ${specialty} à ${city}`,
        description: `Découvrez le parcours et les compétences de ${name}, ${specialty} à ${city}.`,
        path: '/a-propos',
        ogType: 'profile',
      }
    case 'contact':
      return {
        title: `Contact — ${name} ${specialty} à ${city}`,
        description: `Contactez ${name}, ${specialty} à ${city}. Adresse, téléphone et formulaire de contact.`,
        path: '/contact',
        ogType: 'website',
      }
    case 'service': {
      const sTitle = service?.metaTitle ?? service?.title ?? 'Service'
      const sDesc =
        service?.metaDescription ??
        service?.shortDescription ??
        `${sTitle} proposé par ${name}, ${specialty} à ${city}.`
      return {
        title: `${sTitle} | ${name} — ${specialty} à ${city}`,
        description: sDesc,
        path: `/actes/${service?.slug ?? ''}`,
        ogType: 'website',
      }
    }
    case 'blog_post': {
      const bTitle = blogPost?.metaTitle ?? blogPost?.title ?? 'Article'
      const bDesc =
        blogPost?.metaDescription ??
        blogPost?.excerpt ??
        `Article par ${name}, ${specialty} à ${city}.`
      return {
        title: `${bTitle} | Blog ${businessName}`,
        description: bDesc,
        path: `/blog/${blogPost?.slug ?? ''}`,
        ogType: 'article',
      }
    }
    case 'blog_index':
      return {
        title: `Blog — ${businessName} | ${specialty} à ${city}`,
        description: `Articles et conseils par ${name}, ${specialty} à ${city}.`,
        path: '/blog',
        ogType: 'website',
      }
  }
}

function resolveImage(
  page: PageKind,
  tenant: TenantSEOData,
  service?: ServiceSEOData,
  blogPost?: BlogPostSEOData,
): string | undefined {
  switch (page) {
    case 'service':
      return service?.imageUrl ?? tenant.practitioner.photoUrl
    case 'blog_post':
      return blogPost?.coverImageUrl ?? tenant.practitioner.photoUrl
    default:
      return tenant.practitioner.photoUrl
  }
}
