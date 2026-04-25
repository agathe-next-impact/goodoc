import { cn } from '@medsite/ui'
import { z } from 'zod'

import { registerBlock } from '../registry'
import { ButtonLink } from './_shared/button'
import { ctaSchema, imageSchema } from './_shared/schemas'

/**
 * Hero with a two-column split: copy on the left, practitioner photo on the
 * right. Reverses to a single column below md. Source shape inspired by
 * shadcn/ui blocks (MIT) — written fresh for MedSite.
 */
export const heroSplitSchema = z.object({
  blockType: z.literal('hero-split'),
  id: z.string().optional(),
  badge: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.optional(),
  image: imageSchema,
  imagePosition: z.enum(['left', 'right']).optional(),
})

export type HeroSplitProps = z.infer<typeof heroSplitSchema>

export function HeroSplit({
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  image,
  imagePosition = 'right',
}: HeroSplitProps) {
  return (
    <section className="bg-background relative overflow-hidden py-16 md:py-24">
      <div className="container">
        <div
          className={cn(
            'grid gap-10 md:grid-cols-2 md:items-center md:gap-14',
            imagePosition === 'left' && 'md:[&>div:first-child]:order-2',
          )}
        >
          <div>
            {badge ? (
              <span className="bg-accent text-accent-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
                {badge}
              </span>
            ) : null}
            <h1 className="font-serif mt-4 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-muted-foreground mt-5 max-w-lg text-lg leading-relaxed">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink
                href={primaryCta.href}
                variant="primary"
                size="lg"
                external={primaryCta.external}
              >
                {primaryCta.label}
              </ButtonLink>
              {secondaryCta ? (
                <ButtonLink
                  href={secondaryCta.href}
                  variant="outline"
                  size="lg"
                  external={secondaryCta.external}
                >
                  {secondaryCta.label}
                </ButtonLink>
              ) : null}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)+0.5rem)]">
              <img
                src={image.url}
                alt={image.alt}
                width={image.width ?? 640}
                height={image.height ?? 800}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

registerBlock({
  blockType: 'hero-split',
  schema: heroSplitSchema,
  Component: HeroSplit,
})
