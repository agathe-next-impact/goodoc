import { z } from 'zod'

import { registerBlock } from '../registry'

/**
 * A trivial block used to prove the end-to-end rendering pipeline before any
 * real block is implemented. It renders a titled text panel — nothing more.
 * Safe to leave in the registry: it doubles as a fallback for pages that
 * were authored before richer blocks existed.
 */
export const placeholderSchema = z.object({
  blockType: z.literal('placeholder'),
  id: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
})

export type PlaceholderProps = z.infer<typeof placeholderSchema>

export function Placeholder({ title, body }: PlaceholderProps) {
  return (
    <section className="border-border border-y py-12">
      <div className="container">
        <h2 className="text-foreground text-2xl font-semibold">
          {title ?? 'Placeholder'}
        </h2>
        {body ? (
          <p className="text-muted-foreground mt-4 max-w-prose">{body}</p>
        ) : null}
      </div>
    </section>
  )
}

registerBlock({
  blockType: 'placeholder',
  schema: placeholderSchema,
  Component: Placeholder,
})
