import { z } from 'zod'

import { registerBlock } from '../registry'
import { Section, SectionHeader } from './_shared/section'

/**
 * Practice location — static OpenStreetMap tile iframe (no API key needed),
 * plus address block and transport / parking notes. We intentionally avoid
 * Google Maps JS here to keep the bundle light; `apps/web` can opt into a
 * richer interactive map when `NEXT_PUBLIC_GOOGLE_MAPS_KEY` is set by
 * building a different block variant.
 */
export const locationMapSchema = z.object({
  blockType: z.literal('location-map'),
  id: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  streetAddress: z.string().min(1),
  postalCode: z.string().min(1),
  city: z.string().min(1),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Array stored as `[{ value }]` — matches Payload's array field shape.
  transports: z.array(z.object({ value: z.string().min(1) })).optional(),
  parking: z.string().optional(),
  accessibilityNote: z.string().optional(),
})

export type LocationMapProps = z.infer<typeof locationMapSchema>

function buildOsmUrl(lat: number, lng: number): string {
  const d = 0.005
  const bbox = [lng - d, lat - d, lng + d, lat + d].map((n) => n.toFixed(5)).join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(5)},${lng.toFixed(5)}`
}

export function LocationMap({
  title = 'Adresse du cabinet',
  subtitle,
  streetAddress,
  postalCode,
  city,
  country = 'France',
  latitude,
  longitude,
  transports,
  parking,
  accessibilityNote,
}: LocationMapProps) {
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number'

  return (
    <Section muted>
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="grid gap-8 md:grid-cols-2 md:items-stretch">
        <address className="bg-card border-border not-italic rounded-[var(--radius)] border p-6">
          <p className="font-serif text-lg font-semibold">{streetAddress}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {postalCode} {city}
            {country ? `, ${country}` : null}
          </p>

          {transports && transports.length > 0 ? (
            <div className="mt-5">
              <h3 className="text-foreground text-xs font-semibold uppercase tracking-wider">
                Transports
              </h3>
              <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                {transports.map((t, i) => (
                  <li key={`${t.value}-${i}`}>{t.value}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {parking ? (
            <div className="mt-5">
              <h3 className="text-foreground text-xs font-semibold uppercase tracking-wider">
                Stationnement
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">{parking}</p>
            </div>
          ) : null}

          {accessibilityNote ? (
            <div className="mt-5">
              <h3 className="text-foreground text-xs font-semibold uppercase tracking-wider">
                Accessibilité
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">{accessibilityNote}</p>
            </div>
          ) : null}
        </address>

        <div className="border-border aspect-video overflow-hidden rounded-[var(--radius)] border md:aspect-auto">
          {hasCoords ? (
            <iframe
              title={`Carte — ${streetAddress}, ${city}`}
              src={buildOsmUrl(latitude, longitude)}
              loading="lazy"
              className="h-full w-full"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-center text-sm">
              Carte indisponible — coordonnées GPS non renseignées.
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

registerBlock({
  blockType: 'location-map',
  schema: locationMapSchema,
  Component: LocationMap,
})
