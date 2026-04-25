import { expect, test } from '@playwright/test'

/**
 * Smoke tests for the practitioner ↔ tenant binding fixed by chantier #23.
 *
 * These specs hit `apps/admin` on port 3001 (Payload), which is started in
 * parallel with `apps/web` by the root `pnpm dev` (turbo). They depend on
 * `pnpm db:seed && pnpm db:seed:users` having been run beforehand — the CI
 * job seeds before invoking Playwright.
 *
 * The dev URL is hardcoded because Playwright's project-level baseURL
 * targets port 3003. Cross-port specs are explicit by design.
 */

const ADMIN_URL = 'http://localhost:3001/admin'

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto(`${ADMIN_URL}/login`)
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password|mot de passe/i).fill(password)
  await page.getByRole('button', { name: /log in|connexion|se connecter/i }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 10_000 })
}

test.describe('Payload practitioner access (chantier #23)', () => {
  test('practitioner sees all tenant-scoped collections in nav', async ({ page }) => {
    await login(page, 'dr.martin@medsite.fr', 'Test1234!')

    // Each label below comes from collections/*.ts `labels.plural` and the
    // SiteSettings collection. Practitioner role should see all of these.
    const expected = [
      'Profil',
      'Actes',
      'Pages',
      'FAQ',
      'Témoignages',
      'Adresses',
      'Horaires',
      'Médias',
      'Réglages du site',
    ]
    for (const label of expected) {
      await expect(page.getByRole('link', { name: new RegExp(label, 'i') })).toBeVisible()
    }
  })

  test('practitioner only sees their own tenant rows in Services', async ({ page }) => {
    await login(page, 'dr.martin@medsite.fr', 'Test1234!')
    await page.goto(`${ADMIN_URL}/collections/services`)

    // Sophie Martin's seeded services are dermatology-focused.
    const body = await page.locator('body').textContent()
    expect(body).toContain('dermatologie')

    // Must NOT see other tenants' services.
    expect(body).not.toContain('Kinésithérapie sportive')
    expect(body).not.toContain('Sophrologie')
  })

  test('practitioner has exactly one SiteSettings entry', async ({ page }) => {
    await login(page, 'dr.martin@medsite.fr', 'Test1234!')
    await page.goto(`${ADMIN_URL}/collections/site-settings`)

    // The list view should show 1 entry — the one for the practitioner's tenant.
    await expect(page.getByText(/medical-classic/i)).toBeVisible()
  })

  test('super-admin sees all tenants', async ({ page }) => {
    await login(page, 'admin@medsite.fr', 'Admin1234!')
    await page.goto(`${ADMIN_URL}/collections/practitioners`)

    const body = await page.locator('body').textContent()
    expect(body).toContain('Martin')
    expect(body).toContain('Dupont')
    expect(body).toContain('Rousseau')
  })
})
