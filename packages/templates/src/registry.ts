import type { BlockDefinition, TemplateDefinition } from './types'

const blockRegistry = new Map<string, BlockDefinition>()
const templateRegistry = new Map<string, TemplateDefinition>()

export function registerBlock<TProps extends Record<string, unknown>>(
  def: BlockDefinition<TProps>,
): void {
  if (blockRegistry.has(def.blockType)) {
    throw new Error(
      `Block "${def.blockType}" is already registered. Block types must be unique.`,
    )
  }
  blockRegistry.set(def.blockType, def as unknown as BlockDefinition)
}

export function getBlock(blockType: string): BlockDefinition | undefined {
  return blockRegistry.get(blockType)
}

export function listBlocks(): BlockDefinition[] {
  return Array.from(blockRegistry.values())
}

export function registerTemplate(def: TemplateDefinition): void {
  if (templateRegistry.has(def.id)) {
    throw new Error(`Template "${def.id}" is already registered.`)
  }
  templateRegistry.set(def.id, def)
}

export function getTemplate(id: string): TemplateDefinition | undefined {
  return templateRegistry.get(id)
}

export function listTemplates(): TemplateDefinition[] {
  return Array.from(templateRegistry.values())
}
