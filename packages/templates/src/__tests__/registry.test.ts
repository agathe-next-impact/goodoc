import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { getBlock, listBlocks, registerBlock } from '../registry'

describe('block registry', () => {
  it('retrieves the built-in placeholder block', async () => {
    // Side-effect import — registers the placeholder block.
    await import('../blocks/placeholder')
    const def = getBlock('placeholder')
    expect(def).toBeDefined()
    expect(def?.blockType).toBe('placeholder')
  })

  it('rejects duplicate registrations', () => {
    const schema = z.object({
      blockType: z.literal('__duplicate-test'),
    })
    const Component = () => null
    registerBlock({ blockType: '__duplicate-test', schema, Component })
    expect(() =>
      registerBlock({ blockType: '__duplicate-test', schema, Component }),
    ).toThrow(/already registered/)
  })

  it('lists all registered blocks', () => {
    expect(listBlocks().length).toBeGreaterThan(0)
  })
})
