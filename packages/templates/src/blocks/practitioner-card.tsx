import { z } from 'zod'

import { registerBlock } from '../registry'
import { imageSchema } from './_shared/schemas'
import { Section } from './_shared/section'

/**
 * Extended single-practitioner card: portrait, titles, specialty, bio,
 * credentials, languages and RPPS / ADELI number. Used on `/a-propos` and
 * occasionally on `/` for solo practices that want to make the bio
 * prominent.
 */
export const practitionerCardSchema = z.object({
  blockType: z.literal('practitioner-card'),
  id: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  civility: z.string().optional(), // "Dr.", "Mme", etc.
  specialty: z.string().min(1),
  bio: z.string().optional(),
  photo: imageSchema.optional(),
  rppsLabel: z.string().optional(), // e.g. "RPPS 10000000001"
  // Arrays of strings are stored as `[{ value }]` — matches Payload's array
  // field shape, which wraps scalar items in an object per row.
  credentials: z.array(z.object({ value: z.string().min(1) })).optional(),
  languages: z.array(z.object({ value: z.string().min(1) })).optional(),
  consultationFormats: z
    .array(z.object({ value: z.string().min(1) }))
    .optional(),
})

export type PractitionerCardProps = z.infer<typeof practitionerCardSchema>

export function PractitionerCard({
  firstName,
  lastName,
  civility,
  specialty,
  bio,
  photo,
  rppsLabel,
  credentials,
  languages,
  consultationFormats,
}: PractitionerCardProps) {
  const fullName = [civility, firstName, lastName].filter(Boolean).join(' ')
  return (
    <Section>
      <div className="bg-card border-border grid gap-8 rounded-[calc(var(--radius)+0.5rem)] border p-6 md:grid-cols-[200px_1fr] md:p-10">
        {photo ? (
          <div className="aspect-square overflow-hidden rounded-full md:aspect-[4/5] md:rounded-[var(--radius)]">
            <img
              src={photo.url}
              alt={photo.alt}
              width={photo.width ?? 400}
              height={photo.height ?? 500}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div>
          <h2 className="font-serif text-2xl font-semibold md:text-3xl">
            {fullName}
          </h2>
          <p className="text-primary mt-1 text-sm font-medium">{specialty}</p>
          {rppsLabel ? (
            <p className="text-muted-foreground mt-1 text-xs">{rppsLabel}</p>
          ) : null}

          {bio ? (
            <p className="text-foreground/80 mt-4 whitespace-pre-line text-sm leading-relaxed md:text-base">
              {bio}
            </p>
          ) : null}

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {credentials && credentials.length > 0 ? (
              <div>
                <dt className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  Diplômes et formation
                </dt>
                <dd className="text-muted-foreground mt-2 text-sm">
                  <ul className="space-y-1">
                    {credentials.map((c, i) => (
                      <li key={`${c.value}-${i}`}>{c.value}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}

            {languages && languages.length > 0 ? (
              <div>
                <dt className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  Langues parlées
                </dt>
                <dd className="text-muted-foreground mt-2 text-sm">
                  {languages.map((l) => l.value).join(' · ')}
                </dd>
              </div>
            ) : null}

            {consultationFormats && consultationFormats.length > 0 ? (
              <div>
                <dt className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  Formats de consultation
                </dt>
                <dd className="text-muted-foreground mt-2 text-sm">
                  {consultationFormats.map((f) => f.value).join(' · ')}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </Section>
  )
}

registerBlock({
  blockType: 'practitioner-card',
  schema: practitionerCardSchema,
  Component: PractitionerCard,
})
