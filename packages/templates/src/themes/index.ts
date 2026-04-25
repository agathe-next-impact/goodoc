import { registerTemplate } from '../registry'
import { familyPractice } from './family-practice'
import { medicalClassic } from './medical-classic'
import { minimalPro } from './minimal-pro'
import { modernClinic } from './modern-clinic'
import { warmWellness } from './warm-wellness'

const builtInTemplates = [
  medicalClassic,
  warmWellness,
  modernClinic,
  minimalPro,
  familyPractice,
]

/**
 * Import this module once at app startup (e.g. from the tenant layout) to
 * register every built-in template. `registerTemplate` throws on duplicate
 * ids — we swallow that here so double imports (tests, HMR) don't crash.
 */
export function registerBuiltInTemplates(): void {
  for (const template of builtInTemplates) {
    try {
      registerTemplate(template)
    } catch {
      // Already registered — ignore.
    }
  }
}

export { familyPractice, medicalClassic, minimalPro, modernClinic, warmWellness }
