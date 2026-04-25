/**
 * @medsite/templates — template + block system.
 *
 * - Blocks: registered once at load time via side-effect imports.
 *   Importing the `blocks` barrel populates the registry.
 * - Templates: bundled theme + page presets, registered explicitly at app
 *   startup via `registerBuiltInTemplates()`.
 * - Renderer: `<SectionRenderer sections={...} />` walks `pages.content`
 *   and renders each section through its registered block.
 */

// Core types
export type {
  BlockDefinition,
  HslTriplet,
  PagePreset,
  SectionNode,
  TemplateDefinition,
  ThemeColorTokens,
  ThemeFontTokens,
  ThemeOverrides,
  ThemeTokens,
} from './types'

// Registry
export {
  getBlock,
  getTemplate,
  listBlocks,
  listTemplates,
  registerBlock,
  registerTemplate,
} from './registry'

// Theme helpers
export { buildThemeCss, defaultTheme, hexToHsl, ThemeStyle } from './theme'

// Renderer
export { SectionRenderer } from './renderer'

// Preset helpers
export { buildPresetPages } from './presets/pages'
export type { PresetPageDescriptor } from './presets/pages'

// Built-in blocks (side-effect imports registering them) + templates
import './blocks'
export { registerBuiltInBlocks } from './blocks'
export {
  familyPractice,
  medicalClassic,
  minimalPro,
  modernClinic,
  registerBuiltInTemplates,
  warmWellness,
} from './themes'
