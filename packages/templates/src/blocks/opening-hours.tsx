import { z } from 'zod'

import { registerBlock } from '../registry'
import { JsonLd } from './_shared/json-ld'
import { Section, SectionHeader } from './_shared/section'

/**
 * Maps a day label (free-form but typically `Lundi`, `Mardi`, …) to the
 * two-letter schema.org `dayOfWeek` code. Unknown labels are dropped from
 * the JSON-LD — they still render visually.
 */
const dayLabelToSchemaOrg: Record<string, string> = {
  lundi: 'Mo',
  mardi: 'Tu',
  mercredi: 'We',
  jeudi: 'Th',
  vendredi: 'Fr',
  samedi: 'Sa',
  dimanche: 'Su',
}

/**
 * Weekly schedule — one row per day, open/close time ranges or closed marker.
 * Specific to MedSite: doesn't exist in any imported template and is a core
 * expectation for patients.
 *
 * Day order follows France (Lundi → Dimanche). `dayLabel` is free text so the
 * back-office can localize it.
 */
const timeRangeSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/, 'HH:MM'),
  close: z.string().regex(/^\d{2}:\d{2}$/, 'HH:MM'),
})

export const openingHoursSchema = z.object({
  blockType: z.literal('opening-hours'),
  id: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  days: z
    .array(
      z.object({
        dayLabel: z.string().min(1),
        isClosed: z.boolean().optional(),
        ranges: z.array(timeRangeSchema).optional(),
        note: z.string().optional(),
      }),
    )
    .min(1),
  phoneNumber: z.string().optional(),
  phoneLabel: z.string().optional(),
  emergencyNote: z.string().optional(),
})

export type OpeningHoursProps = z.infer<typeof openingHoursSchema>

function openingHoursJsonLd(days: OpeningHoursProps['days']) {
  const specs = days.flatMap((day) => {
    if (day.isClosed || !day.ranges?.length) return []
    const code = dayLabelToSchemaOrg[day.dayLabel.toLowerCase()]
    if (!code) return []
    return day.ranges.map((range) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: code,
      opens: range.open,
      closes: range.close,
    }))
  })
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    openingHoursSpecification: specs,
  }
}

export function OpeningHours({
  title = 'Horaires du cabinet',
  subtitle,
  days,
  phoneNumber,
  phoneLabel,
  emergencyNote,
}: OpeningHoursProps) {
  return (
    <Section>
      <JsonLd data={openingHoursJsonLd(days)} />
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,340px)]">
        <ul className="divide-border bg-card border-border divide-y rounded-[var(--radius)] border">
          {days.map((day, index) => (
            <li
              key={`${day.dayLabel}-${index}`}
              className="flex items-center justify-between gap-6 px-5 py-3 text-sm"
            >
              <span className="text-foreground font-medium">{day.dayLabel}</span>
              <span className="text-muted-foreground text-right">
                {day.isClosed || !day.ranges?.length ? (
                  'Fermé'
                ) : (
                  <span className="tabular-nums">
                    {day.ranges
                      .map((r) => `${r.open} – ${r.close}`)
                      .join(' · ')}
                  </span>
                )}
                {day.note ? (
                  <span className="text-muted-foreground/80 ml-2 text-xs italic">
                    {day.note}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>

        {phoneNumber ? (
          <aside className="bg-accent text-accent-foreground flex flex-col justify-center rounded-[var(--radius)] p-6">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
              {phoneLabel ?? 'Contact téléphonique'}
            </p>
            <a
              href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
              className="font-serif mt-2 text-2xl font-semibold underline-offset-4 hover:underline"
            >
              {phoneNumber}
            </a>
            {emergencyNote ? (
              <p className="mt-4 text-sm leading-relaxed opacity-90">
                {emergencyNote}
              </p>
            ) : null}
          </aside>
        ) : null}
      </div>
    </Section>
  )
}

registerBlock({
  blockType: 'opening-hours',
  schema: openingHoursSchema,
  Component: OpeningHours,
})
