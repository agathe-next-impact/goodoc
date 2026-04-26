import { test, expect } from '@playwright/test'

/**
 * Smoke E2E for chantier #00 — verifies the auth gate redirects to /login
 * and that the login form is reachable. Doesn't exercise the full
 * authenticated journey because that requires a seeded database
 * (`pnpm db:seed && pnpm db:seed:users`); a separate spec gated on that
 * fixture should land alongside chantier #05.
 */
test.describe('platform — auth gate', () => {
  test('unauthenticated visitor is redirected to /login', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.url()).toContain('/login')
    await expect(
      page.getByRole('heading', { name: 'Connexion' }),
    ).toBeVisible()
  })

  test('login page exposes a usable form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Mot de passe')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Se connecter' }),
    ).toBeEnabled()
  })

  test('rejects bad credentials with an inline error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('nobody@medsite.fr')
    await page.getByLabel('Mot de passe').fill('wrong-password')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page.getByRole('alert')).toContainText(/invalides|erreur/i)
  })
})
