import { z } from 'zod'

import { registerBlock } from '../registry'
import { JsonLd } from './_shared/json-ld'
import { urlSchema } from './_shared/schemas'
import { Section, SectionHeader } from './_shared/section'

/**
 * Grid of services / acts. Each item carries a title, short description, an
 * optional price hint and an optional link to a dedicated detail page.
 *
 * Vocabulary is medical-first: `services` in French clinics means the acts
 * practised, so the copy must match ("Consultation", "Examen", "Acte
 * chirurgical"...). The block itself is vocabulary-neutral — content is
 * driven by props.
 */
export const servicesGridSchema = z.object({
  blockType: z.literal('services-grid'),
  id: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  services: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        priceLabel: z.string().optional(),
        durationLabel: z.string().optional(),
        href: urlSchema.optional(),
        iconInitial: z.string().max(2).optional(),
      }),
    )
    .min(1),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
})

export type ServicesGridProps = z.infer<typeof servicesGridSchema>

function servicesJsonLd(title: string, services: ServicesGridProps['services']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.title,
        ...(service.description ? { description: service.description } : {}),
        ...(service.href ? { url: service.href } : {}),
      },
    })),
  }
}

export function ServicesGrid({
  title,
  subtitle,
  services,
  columns = 3,
}: ServicesGridProps) {
  const colClass =
    columns === 2
      ? 'md:grid-cols-2'
      : columns === 4
        ? 'md:grid-cols-2 lg:grid-cols-4'
        : 'md:grid-cols-2 lg:grid-cols-3'

  return (
    <Section muted>
      <JsonLd data={servicesJsonLd(title, services)} />
      <SectionHeader title={title} subtitle={subtitle} />
      <ul className={`grid gap-6 ${colClass}`}>
        {services.map((service, index) => {
          const body = (
            <>
              <div
                aria-hidden
                className="bg-primary/10 text-primary mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius)] font-serif text-lg font-semibold"
              >
                {service.iconInitial ?? service.title.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-foreground font-serif text-xl font-semibold">
                {service.title}
              </h3>
              {service.description ? (
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {service.description}
                </p>
              ) : null}
              {(service.priceLabel ?? service.durationLabel) ? (
                <dl className="text-muted-foreground mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {service.durationLabel ? (
                    <div className="flex items-center gap-1">
                      <dt className="sr-only">Durée</dt>
                      <dd>{service.durationLabel}</dd>
                    </div>
                  ) : null}
                  {service.priceLabel ? (
                    <div className="flex items-center gap-1">
                      <dt className="sr-only">Tarif</dt>
                      <dd>{service.priceLabel}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </>
          )

          return (
            <li key={`${service.title}-${index}`}>
              {service.href ? (
                <a
                  href={service.href}
                  className="bg-card border-border hover:border-primary/40 focus-visible:ring-ring block h-full rounded-[var(--radius)] border p-6 transition focus-visible:outline-none focus-visible:ring-2"
                >
                  {body}
                </a>
              ) : (
                <div className="bg-card border-border h-full rounded-[var(--radius)] border p-6">
                  {body}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

registerBlock({
  blockType: 'services-grid',
  schema: servicesGridSchema,
  Component: ServicesGrid,
})
