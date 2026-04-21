import { test, expect } from '@playwright/test'

test.describe('SEO validation', () => {
  test.use({ baseURL: 'http://dr-sophie-martin.localhost:3003' })

  const pages = [
    { path: '/', expectedTitlePart: 'Sophie Martin' },
    { path: '/a-propos', expectedTitlePart: 'À propos' },
    { path: '/actes', expectedTitlePart: 'Actes' },
    { path: '/contact', expectedTitlePart: 'Contact' },
  ]

  for (const { path, expectedTitlePart } of pages) {
    test(`${path} has correct meta tags`, async ({ page }) => {
      await page.goto(path)

      // Title
      const title = await page.title()
      expect(title).toContain(expectedTitlePart)

      // Meta description
      const description = page.locator('meta[name="description"]')
      await expect(description).toHaveAttribute('content', /.+/)

      // Canonical URL
      const canonical = page.locator('link[rel="canonical"]')
      const canonicalExists = (await canonical.count()) > 0
      if (canonicalExists) {
        await expect(canonical).toHaveAttribute('href', /http/)
      }

      // Open Graph
      const ogTitle = page.locator('meta[property="og:title"]')
      await expect(ogTitle).toHaveAttribute('content', /.+/)
    })

    test(`${path} has JSON-LD structured data`, async ({ page }) => {
      await page.goto(path)

      const jsonLdScripts = page.locator('script[type="application/ld+json"]')
      const count = await jsonLdScripts.count()
      expect(count).toBeGreaterThan(0)

      // Parse and validate the first JSON-LD block
      const content = await jsonLdScripts.first().textContent()
      expect(content).toBeTruthy()
      const parsed = JSON.parse(content!)
      expect(parsed['@context']).toBe('https://schema.org')
      expect(parsed['@type']).toBeTruthy()
    })
  }

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')
    expect(response?.status()).toBe(200)

    const content = await page.content()
    expect(content).toContain('<urlset')
    expect(content).toContain('<loc>')
  })

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt')
    expect(response?.status()).toBe(200)
  })
})
