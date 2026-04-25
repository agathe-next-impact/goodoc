import { z } from 'zod'

/**
 * Building blocks reused across many block schemas. Kept in one place so
 * that validation stays consistent (same URL shape, same image shape, etc.).
 */

export const urlSchema = z
  .string()
  .min(1)
  .refine(
    (v) => v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://') || v.startsWith('mailto:') || v.startsWith('tel:'),
    { message: 'Must be an absolute URL or start with /, mailto:, tel:' },
  )

export const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})

export type ImageData = z.infer<typeof imageSchema>

export const ctaSchema = z.object({
  label: z.string().min(1),
  href: urlSchema,
  external: z.boolean().optional(),
})

export type CtaData = z.infer<typeof ctaSchema>
