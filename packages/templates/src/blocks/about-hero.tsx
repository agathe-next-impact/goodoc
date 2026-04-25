import { z } from 'zod'

import { registerBlock } from '../registry'
import { ButtonLink } from './_shared/button'
import { ctaSchema, imageSchema } from './_shared/schemas'

/**
 * Page-header variant for About / Mission pages. Optional portrait next to a
 * narrative paragraph. Shorter than HeroSplit — no booking CTA by default.
 */
export const aboutHeroSchema = z.object({
  blockType: z.literal('about-hero'),
  id: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  image: imageSchema.optional(),
  cta: ctaSchema.optional(),
})

export type AboutHeroProps = z.infer<typeof aboutHeroSchema>

export function AboutHero({ eyebrow, title, body, image, cta }: AboutHeroProps) {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-14">
          <div>
            {eyebrow ? (
              <p className="text-primary text-sm font-medium uppercase tracking-wider">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-serif mt-3 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="text-muted-foreground mt-6 whitespace-pre-line text-base leading-relaxed md:text-lg">
              {body}
            </p>
            {cta ? (
              <div className="mt-8">
                <ButtonLink href={cta.href} external={cta.external} size="md">
                  {cta.label}
                </ButtonLink>
              </div>
            ) : null}
          </div>

          {image ? (
            <div className="aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)+0.5rem)]">
              <img
                src={image.url}
                alt={image.alt}
                width={image.width ?? 560}
                height={image.height ?? 700}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

registerBlock({
  blockType: 'about-hero',
  schema: aboutHeroSchema,
  Component: AboutHero,
})
