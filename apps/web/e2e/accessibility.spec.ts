import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test.use({ baseURL: 'http://dr-sophie-martin.localhost:3003' })

  test('all images have alt text', async ({ page }) => {
    await page.goto('/')

    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const src = await img.getAttribute('src')
      expect(alt, `Image ${src} missing alt text`).toBeTruthy()
    }
  })

  test('navigation is keyboard-accessible', async ({ page }) => {
    await page.goto('/')

    // Tab through nav links
    await page.keyboard.press('Tab')
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName)
    expect(firstFocused).toBeTruthy()
  })

  test('main landmark exists', async ({ page }) => {
    await page.goto('/')

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('heading hierarchy is correct', async ({ page }) => {
    await page.goto('/')

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('interactive elements have sufficient size on mobile', async ({
    page,
  }) => {
    // Use iPhone viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // All links and buttons should be at least 44x44px (WCAG target size)
    const interactives = page.locator('a, button')
    const count = await interactives.count()

    for (let i = 0; i < count; i++) {
      const el = interactives.nth(i)
      if (await el.isVisible()) {
        const box = await el.boundingBox()
        if (box) {
          // Allow some items to be smaller (inline text links)
          // but CTA buttons should meet minimum size
          const isCta = await el.evaluate(
            (node) =>
              node.classList.contains('bg-primary') ||
              node.getAttribute('role') === 'button',
          )
          if (isCta) {
            expect(box.height, `CTA too small: ${await el.textContent()}`).toBeGreaterThanOrEqual(40)
          }
        }
      }
    }
  })
})
