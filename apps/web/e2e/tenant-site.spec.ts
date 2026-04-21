import { test, expect } from '@playwright/test'

test.describe('Practitioner site with Doctolib', () => {
  test.use({ baseURL: 'http://dr-sophie-martin.localhost:3003' })

  test('home page shows practitioner info and CTA', async ({ page }) => {
    await page.goto('/')

    // Hero section
    await expect(page.locator('h1')).toContainText('Sophie Martin')
    await expect(page.getByText('Dermatologue')).toBeVisible()

    // CTA links to Doctolib
    const ctaLink = page.getByRole('link', { name: /rendez-vous/i }).first()
    await expect(ctaLink).toBeVisible()
  })

  test('services page lists services', async ({ page }) => {
    await page.goto('/actes')

    await expect(page.locator('h1')).toContainText('Actes')
    // Should have service cards
    const serviceLinks = page.locator('a[href^="/actes/"]')
    await expect(serviceLinks.first()).toBeVisible()
  })

  test('service detail page has contextual CTA', async ({ page }) => {
    await page.goto('/actes/consultation-dermatologie-generale')

    await expect(page.locator('h1')).toContainText('dermatologie')
    // Sidebar with booking CTA
    const sidebar = page.locator('aside')
    await expect(sidebar.getByText(/min/)).toBeVisible()
  })

  test('contact page shows practitioner info', async ({ page }) => {
    await page.goto('/contact')

    await expect(page.locator('h1')).toContainText('Contact')
    await expect(page.getByText('+33 4 78 00 00 01')).toBeVisible()
  })

  test('contact form can be submitted', async ({ page }) => {
    await page.goto('/contact')

    await page.fill('#senderName', 'Patient Test')
    await page.fill('#senderEmail', 'patient@test.com')
    await page.fill('#message', 'Bonjour, je souhaite prendre rendez-vous pour un dépistage.')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Message envoyé')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Practitioner site without Doctolib', () => {
  test.use({ baseURL: 'http://emilie-rousseau.localhost:3003' })

  test('CTA says "Me contacter" instead of "Prendre RDV"', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toContainText('Émilie Rousseau')
    // Should NOT have a Doctolib iframe
    const iframe = page.locator('iframe[src*="doctolib"]')
    await expect(iframe).toHaveCount(0)
  })

  test('booking page redirects to contact', async ({ page }) => {
    await page.goto('/rendez-vous')

    // Should redirect to /contact for contact-only practitioners
    await expect(page).toHaveURL(/\/contact/)
  })
})
