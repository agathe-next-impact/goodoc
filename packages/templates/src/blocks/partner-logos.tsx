import { z } from 'zod'

import { registerBlock } from '../registry'
import { imageSchema, urlSchema } from './_shared/schemas'
import { Section, SectionHeader } from './_shared/section'

/**
 * Strip of affiliated / partnering organisations — mutuelles, hôpitaux,
 * ordres professionnels. Labeled "Partenaires" by default; the block is
 * generic enough to repurpose for "Mutuelles acceptées" or "Formations".
 */
export const partnerLogosSchema = z.object({
  blockType: z.literal('partner-logos'),
  id: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  logos: z
    .array(
      z.object({
        name: z.string().min(1),
        image: imageSchema.optional(),
        href: urlSchema.optional(),
      }),
    )
    .min(1),
})

export type PartnerLogosProps = z.infer<typeof partnerLogosSchema>

export function PartnerLogos({ title, subtitle, logos }: PartnerLogosProps) {
  return (
    <Section>
      {title ? (
        <SectionHeader title={title} subtitle={subtitle} align="center" />
      ) : null}
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {logos.map((logo, index) => {
          const content = logo.image ? (
            <img
              src={logo.image.url}
              alt={logo.image.alt || logo.name}
              width={logo.image.width ?? 140}
              height={logo.image.height ?? 56}
              loading="lazy"
              decoding="async"
              className="h-10 w-auto grayscale opacity-70 transition hover:opacity-100 hover:grayscale-0"
            />
          ) : (
            <span className="text-muted-foreground text-sm font-medium">
              {logo.name}
            </span>
          )
          return (
            <li key={`${logo.name}-${index}`}>
              {logo.href ? (
                <a
                  href={logo.href}
                  aria-label={logo.name}
                  rel="noopener noreferrer"
                  className="focus-visible:ring-ring inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2"
                >
                  {content}
                </a>
              ) : (
                content
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

registerBlock({
  blockType: 'partner-logos',
  schema: partnerLogosSchema,
  Component: PartnerLogos,
})
