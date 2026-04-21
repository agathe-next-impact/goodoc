import { test, expect } from '@playwright/test'

test.describe('Multi-tenant isolation', () => {
  test('tenant A shows only tenant A data', async ({ page }) => {
    await page.goto('http://dr-sophie-martin.localhost:3003/')

    await expect(page.locator('h1')).toContainText('Sophie Martin')
    await expect(page.getByText('Dermatologue')).toBeVisible()

    // Should NOT contain data from other tenants
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toContain('Julien Dupont')
    expect(bodyText).not.toContain('Émilie Rousseau')
  })

  test('tenant B shows only tenant B data', async ({ page }) => {
    await page.goto('http://cabinet-dupont.localhost:3003/')

    await expect(page.locator('h1')).toContainText('Dupont')

    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toContain('Sophie Martin')
    expect(bodyText).not.toContain('Émilie Rousseau')
  })

  test('tenant C shows only tenant C data', async ({ page }) => {
    await page.goto('http://emilie-rousseau.localhost:3003/')

    await expect(page.locator('h1')).toContainText('Rousseau')

    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toContain('Sophie Martin')
    expect(bodyText).not.toContain('Julien Dupont')
  })

  test('unknown subdomain shows 404', async ({ page }) => {
    const response = await page.goto('http://unknown-tenant.localhost:3003/')
    expect(response?.status()).toBe(404)
  })
})
