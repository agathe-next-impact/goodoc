# Chantier 08 — Screenshots réels dans la galerie admin

## But

Remplacer le dégradé synthétique de `TemplateGallery` par des screenshots réels de chaque thème, générés automatiquement au build pour rester à jour.

## Pré-requis

- Chantier 04 (Playwright fonctionnel)
- Au moins un tenant par thème (3 + 2 à créer en seed étendu, ou utiliser les 3 existants + 2 tenants test pour `modern-clinic` et `minimal-pro`)

## Périmètre exact

**Inclus :**
- Script `pnpm tsx scripts/generate-template-screenshots.ts` qui :
  - lance `apps/web` en build local
  - boot Playwright
  - pour chaque thème, applique le preset à un tenant éphémère, navigue sur `/p/home`, capture l'écran en 1280×800
  - sauve dans `apps/admin/public/templates/<id>.png`
- `TemplateGallery` lit l'image au lieu du dégradé
- Workflow GitHub Actions optionnel qui régénère sur push de `packages/templates/**`

**Exclus :**
- Galerie multi-pages (juste home pour la V1)
- Animation hover

## Fichiers touchés

| Chemin | Nature |
|--------|--------|
| `scripts/generate-template-screenshots.ts` | nouveau |
| `apps/admin/public/templates/*.png` | nouveaux assets |
| `apps/admin/src/components/template-gallery.tsx` | utilise `<img src="/templates/<id>.png">` |
| `package.json` | + script `screenshots` |

## Étapes d'implémentation

### 1. Script de capture

```ts
// scripts/generate-template-screenshots.ts
import { chromium } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs/promises'

const TEMPLATES = [
  { id: 'medical-classic', tenantHost: 'dr-sophie-martin' },
  { id: 'family-practice', tenantHost: 'cabinet-dupont' },
  { id: 'warm-wellness', tenantHost: 'emilie-rousseau' },
  // pour les 2 autres : créer des tenants de démo OU appliquer overwrite via API
]

const OUT_DIR = path.resolve('apps/admin/public/templates')

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  for (const t of TEMPLATES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await page.goto(`http://${t.tenantHost}.localhost:3003/p/home`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: path.join(OUT_DIR, `${t.id}.png`), fullPage: false })
    await page.close()
  }
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

### 2. Adaptation de `TemplateGallery`

```tsx
// apps/admin/src/components/template-gallery.tsx
<div style={{ height: 200, position: 'relative' }}>
  <img
    src={`/templates/${template.id}.png`}
    alt={`Aperçu ${template.name}`}
    width={1280}
    height={800}
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    onError={(e) => {
      // fallback dégradé si screenshot manquant
      e.currentTarget.style.display = 'none'
    }}
  />
</div>
```

### 3. Workflow CI optionnel

```yaml
# .github/workflows/screenshots.yml
on:
  push:
    branches: [master]
    paths:
      - 'packages/templates/**'
jobs:
  generate:
    # … boot postgres, seed, run dev, run script, commit & push si différent
```

## Critères de done

- [ ] 5 PNG dans `apps/admin/public/templates/` (1 par thème)
- [ ] La galerie admin affiche les screenshots
- [ ] Le fallback dégradé reste si un PNG manque
- [ ] `pnpm screenshots` se lance localement et regénère les 5 images en < 1 min

## Risques connus

- Les screenshots changent à chaque modif de palette → diff git bruyant. Solution : régénérer en CI mais ne PAS commiter, héberger sur R2 et lire `https://media.medsite.fr/template-previews/<id>.png`.
- Tenants temporaires pour `modern-clinic`/`minimal-pro` : préparer des tenants `_demo` dédiés, non listés en prod.
- En prod, ces images doivent être servies par CDN, pas par Vercel (taille).

## Tests à ajouter

Pas de unit test. Visual check manuel.

## Estimation

0,5 jour.
