import { z } from 'zod'

import { registerBlock } from '../registry'
import { Section, SectionHeader } from './_shared/section'

/**
 * Pricing table tuned for French medical acts: a single table listing the
 * act, social-security base rate, the practice's own rate, optional duration
 * and an "honoraires libres / conventionné" column. No plan comparison —
 * this isn't a SaaS.
 */
export const feePricingSchema = z.object({
  blockType: z.literal('fee-pricing'),
  id: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  disclaimer: z.string().optional(),
  fees: z
    .array(
      z.object({
        actLabel: z.string().min(1),
        durationLabel: z.string().optional(),
        tarifSecu: z.string().optional(),
        tarifCabinet: z.string().optional(),
        conventionLabel: z.string().optional(),
        note: z.string().optional(),
      }),
    )
    .min(1),
})

export type FeePricingProps = z.infer<typeof feePricingSchema>

export function FeePricing({
  title,
  subtitle,
  disclaimer,
  fees,
}: FeePricingProps) {
  const hasDuration = fees.some((f) => f.durationLabel)
  const hasSecu = fees.some((f) => f.tarifSecu)
  const hasCabinet = fees.some((f) => f.tarifCabinet)
  const hasConvention = fees.some((f) => f.conventionLabel)

  return (
    <Section>
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="border-border bg-card overflow-hidden rounded-[var(--radius)] border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold">Acte</th>
                {hasDuration ? (
                  <th className="px-5 py-3 font-semibold">Durée</th>
                ) : null}
                {hasSecu ? (
                  <th className="px-5 py-3 font-semibold">Tarif Sécurité sociale</th>
                ) : null}
                {hasCabinet ? (
                  <th className="px-5 py-3 font-semibold">Tarif cabinet</th>
                ) : null}
                {hasConvention ? (
                  <th className="px-5 py-3 font-semibold">Convention</th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {fees.map((fee, index) => (
                <tr key={`${fee.actLabel}-${index}`}>
                  <td className="px-5 py-4">
                    <p className="text-foreground font-medium">{fee.actLabel}</p>
                    {fee.note ? (
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        {fee.note}
                      </p>
                    ) : null}
                  </td>
                  {hasDuration ? (
                    <td className="text-muted-foreground px-5 py-4 tabular-nums">
                      {fee.durationLabel ?? '—'}
                    </td>
                  ) : null}
                  {hasSecu ? (
                    <td className="text-muted-foreground px-5 py-4 tabular-nums">
                      {fee.tarifSecu ?? '—'}
                    </td>
                  ) : null}
                  {hasCabinet ? (
                    <td className="text-foreground px-5 py-4 font-medium tabular-nums">
                      {fee.tarifCabinet ?? '—'}
                    </td>
                  ) : null}
                  {hasConvention ? (
                    <td className="text-muted-foreground px-5 py-4">
                      {fee.conventionLabel ?? '—'}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {disclaimer ? (
        <p className="text-muted-foreground mt-6 max-w-3xl text-xs leading-relaxed">
          {disclaimer}
        </p>
      ) : null}
    </Section>
  )
}

registerBlock({
  blockType: 'fee-pricing',
  schema: feePricingSchema,
  Component: FeePricing,
})
