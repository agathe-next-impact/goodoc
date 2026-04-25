# Chantier 04 — E2E Playwright sur les templates

## But

Couvrir en automatique le périmètre validé manuellement au chantier 01 : pour chaque tenant dev, charger les 6 pages canoniques, vérifier le rendu de chaque bloc et la présence du JSON-LD attendu.

## Pré-requis

- Chantier 01 (rendu OK)
- Playwright déjà installé (`apps/web/playwright.config.ts` existe)
- Base seedée disponible

## Périmètre exact

**Inclus :**
- Test E2E par tenant qui charge les 6 slugs et vérifie :
  - Status 200
  - Présence du `<h1>` ou `<h2>` attendu (par bloc)
  - Présence du JSON-LD pour les 4 blocs concernés (parsing JSON valide)
  - Aucune erreur console
- Test d'isolation multi-tenant (visiter tenant A puis tenant B → contenus différents)
- Test du formulaire `contact-form` : honeypot rejeté, validation, soumission OK

**Exclus :**
- Visual regression (chantier 18)
- Tests cross-browser (Chromium suffit en CI)

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `apps/web/e2e/templates.spec.ts` | nouveau |
| `apps/web/e2e/multi-tenant.spec.ts` | nouveau |
| `apps/web/e2e/contact-form.spec.ts` | nouveau |
| `apps/web/playwright.config.ts` | + entries pour les nouveaux specs |

## Étapes d'implémentation

```ts
// apps/web/e2e/templates.spec.ts
import { expect, test } from '@playwright/test'

const tenants = [
  { slug: 'dr-sophie-martin', baseUrl: 'http://dr-sophie-martin.localhost:3003' },
  { slug: 'cabinet-dupont', baseUrl: 'http://cabinet-dupont.localhost:3003' },
  { slug: 'emilie-rousseau', baseUrl: 'http://emilie-rousseau.localhost:3003' },
]

const slugs = ['home', 'a-propos', 'services', 'contact', 'faq', 'tarifs']

for (const tenant of tenants) {
  test.describe(`tenant: ${tenant.slug}`, () => {
    for (const slug of slugs) {
      test(`renders /p/${slug} with no console errors`, async ({ page }) => {
        const errors: string[] = []
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

        const response = await page.goto(`${tenant.baseUrl}/p/${slug}`)
        expect(response?.status()).toBe(200)
        await expect(page.locator('main')).toBeVisible()
        expect(errors).toEqual([])
      })
    }

    test('home emits FAQ + Services + LocalBusiness JSON-LD', async ({ page }) => {
      await page.goto(`${tenant.baseUrl}/p/home`)
      const ldScripts = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents()
      const types = ldScripts.map((s) => JSON.parse(s)['@type'])
      expect(types).toContain('FAQPage')
      expect(types).toContain('ItemList')
      expect(types).toContain('LocalBusiness')
    })
  })
}
```

```ts
// apps/web/e2e/multi-tenant.spec.ts
import { expect, test } from '@playwright/test'

test('tenant A et tenant B affichent des contenus différents', async ({ page }) => {
  await page.goto('http://dr-sophie-martin.localhost:3003/p/home')
  const titleA = await page.locator('h1').first().textContent()

  await page.goto('http://cabinet-dupont.localhost:3003/p/home')
  const titleB = await page.locator('h1').first().textContent()

  expect(titleA).not.toEqual(titleB)
})
```

```ts
// apps/web/e2e/contact-form.spec.ts
import { expect, test } from '@playwright/test'

test('honeypot bloque les bots', async ({ page }) => {
  await page.goto('http://dr-sophie-martin.localhost:3003/p/contact')
  await page.fill('input[name="senderName"]', 'Test')
  await page.fill('input[name="senderEmail"]', 'test@example.com')
  await page.fill('textarea[name="message"]', 'Bonjour')
  await page.locator('input[name="website"]').evaluate((el: HTMLInputElement) => {
    el.value = 'spam' // remplit le honeypot caché
  })
  await page.click('button[type="submit"]')
  // Le serveur doit rejeter, l'UI ne doit pas afficher de succès
  await expect(page.getByText('Message envoyé')).toHaveCount(0)
})
```

## Critères de done

- [ ] 18 tests de pages passent
- [ ] 1 test multi-tenant passe
- [ ] 1 test honeypot passe
- [ ] `pnpm test:e2e` exit 0 en local
- [ ] Lancé en CI (peut être fusionné avec chantier 03)

## Risques connus

- Les sous-domaines `*.localhost` doivent résoudre sur la machine CI ; sinon utiliser `playwright.config.ts > use.extraHTTPHeaders.host`.
- Les tests dépendent du seed. Si le contenu des presets change, les assertions textuelles cassent — on assertera plutôt sur la présence de balises et de blockTypes que sur des chaînes exactes.
- Le `contact-form` POST sur `/contact` : il faut une route handler qui retourne 200 même si le message n'est pas écrit (mode test) ou un mock côté Playwright.

## Tests à ajouter

Voir étapes ci-dessus.

## Estimation

1 jour.
