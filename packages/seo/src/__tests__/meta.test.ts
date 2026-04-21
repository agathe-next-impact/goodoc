import { describe, expect, it } from 'vitest'

import { generatePageMetadata } from '../meta'
import {
  blogPost,
  paramedicalTenant,
  serviceNoPrice,
  serviceWithPrice,
  specialistTenant,
  wellnessTenant,
} from './fixtures'

describe('generatePageMetadata', () => {
  describe('home page', () => {
    it('generates correct title pattern', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'home',
      })
      expect(meta.title).toBe(
        'Cabinet de Cardiologie Dr Martin — Cardiologue à Paris',
      )
    })

    it('sets canonical URL to site root', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'home',
      })
      expect(meta.alternates.canonical).toBe('https://dr-martin.medsite.fr')
    })

    it('sets openGraph type to website', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'home',
      })
      expect(meta.openGraph.type).toBe('website')
    })

    it('includes image in openGraph when photo available', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'home',
      })
      expect(meta.openGraph.images).toHaveLength(1)
      expect(meta.openGraph.images![0]!.url).toBe(
        'https://media.medsite.fr/dr-martin/photo.jpg',
      )
    })

    it('omits images when no photo', () => {
      const meta = generatePageMetadata({
        tenant: wellnessTenant,
        page: 'home',
      })
      expect(meta.openGraph.images).toBeUndefined()
    })
  })

  describe('about page', () => {
    it('generates correct title pattern', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'about',
      })
      expect(meta.title).toBe(
        'À propos de Jean Martin — Cardiologue à Paris',
      )
    })

    it('sets canonical to /a-propos', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'about',
      })
      expect(meta.alternates.canonical).toBe(
        'https://dr-martin.medsite.fr/a-propos',
      )
    })

    it('sets openGraph type to profile', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'about',
      })
      expect(meta.openGraph.type).toBe('profile')
    })
  })

  describe('contact page', () => {
    it('generates correct title pattern', () => {
      const meta = generatePageMetadata({
        tenant: paramedicalTenant,
        page: 'contact',
      })
      expect(meta.title).toBe(
        'Contact — Sophie Dupont Kinésithérapeute à Lyon',
      )
    })
  })

  describe('service page', () => {
    it('uses service title in page title', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'service',
        service: serviceWithPrice,
      })
      expect(meta.title).toBe(
        'Échocardiographie | Jean Martin — Cardiologue à Paris',
      )
    })

    it('uses metaTitle when available', () => {
      const service = {
        ...serviceWithPrice,
        metaTitle: 'Custom Meta Title',
      }
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'service',
        service,
      })
      expect(meta.title).toBe(
        'Custom Meta Title | Jean Martin — Cardiologue à Paris',
      )
    })

    it('uses service image for openGraph', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'service',
        service: serviceWithPrice,
      })
      expect(meta.openGraph.images![0]!.url).toBe(
        'https://media.medsite.fr/dr-martin/echo.jpg',
      )
    })

    it('falls back to practitioner photo when no service image', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'service',
        service: serviceNoPrice,
      })
      expect(meta.openGraph.images![0]!.url).toBe(
        'https://media.medsite.fr/dr-martin/photo.jpg',
      )
    })

    it('sets canonical to /actes/{slug}', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'service',
        service: serviceWithPrice,
      })
      expect(meta.alternates.canonical).toBe(
        'https://dr-martin.medsite.fr/actes/echocardiographie',
      )
    })
  })

  describe('blog post page', () => {
    it('uses blog post title in page title', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'blog_post',
        blogPost,
      })
      expect(meta.title).toBe(
        'Quand consulter un cardiologue ? | Blog Cabinet de Cardiologie Dr Martin',
      )
    })

    it('sets openGraph type to article', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'blog_post',
        blogPost,
      })
      expect(meta.openGraph.type).toBe('article')
    })

    it('uses blog cover image for openGraph', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'blog_post',
        blogPost,
      })
      expect(meta.openGraph.images![0]!.url).toBe(
        'https://media.medsite.fr/dr-martin/blog-cardio.jpg',
      )
    })
  })

  describe('blog index page', () => {
    it('generates correct title pattern', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'blog_index',
      })
      expect(meta.title).toBe(
        'Blog — Cabinet de Cardiologie Dr Martin | Cardiologue à Paris',
      )
    })
  })

  describe('common metadata', () => {
    it('always sets locale to fr_FR', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'home',
      })
      expect(meta.openGraph.locale).toBe('fr_FR')
    })

    it('sets siteName from businessName', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'home',
      })
      expect(meta.openGraph.siteName).toBe(
        'Cabinet de Cardiologie Dr Martin',
      )
    })

    it('uses summary_large_image twitter card when image available', () => {
      const meta = generatePageMetadata({
        tenant: specialistTenant,
        page: 'home',
      })
      expect(meta.twitter.card).toBe('summary_large_image')
    })

    it('uses summary twitter card when no image', () => {
      const meta = generatePageMetadata({
        tenant: wellnessTenant,
        page: 'home',
      })
      expect(meta.twitter.card).toBe('summary')
    })
  })
})
