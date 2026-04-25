import { cn } from '@medsite/ui'
import { z } from 'zod'

import { registerBlock } from '../registry'
import { ButtonLink } from './_shared/button'
import { ctaSchema } from './_shared/schemas'

/**
 * Full-width banner nudging the visitor to book. Two visual tones: `primary`
 * for strong above-the-fold push, `subtle` for end-of-section softer reminder.
 */
export const ctaBannerSchema = z.object({
  blockType: z.literal('cta-banner'),
  id: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.optional(),
  tone: z.enum(['primary', 'subtle']).optional(),
})

export type CtaBannerProps = z.infer<typeof ctaBannerSchema>

export function CtaBanner({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  tone = 'primary',
}: CtaBannerProps) {
  return (
    <section
      className={cn(
        'py-16 md:py-20',
        tone === 'primary'
          ? 'bg-primary text-primary-foreground'
          : 'bg-accent text-accent-foreground',
      )}
    >
      <div className="container flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 text-base leading-relaxed opacity-90">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink
            href={primaryCta.href}
            external={primaryCta.external}
            size="lg"
            variant={tone === 'primary' ? 'secondary' : 'primary'}
          >
            {primaryCta.label}
          </ButtonLink>
          {secondaryCta ? (
            <ButtonLink
              href={secondaryCta.href}
              external={secondaryCta.external}
              size="lg"
              variant="outline"
              className={
                tone === 'primary'
                  ? 'border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'
                  : undefined
              }
            >
              {secondaryCta.label}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </section>
  )
}

registerBlock({
  blockType: 'cta-banner',
  schema: ctaBannerSchema,
  Component: CtaBanner,
})
